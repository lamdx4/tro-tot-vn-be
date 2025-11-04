import { ActionType, PostStatus, RoleType } from '@/domains/entities/enum/value-object'
import {
  AccountRepository,
  AdminRepository,
  PostModerationHistoryRepository,
  PostRepository,
  ModerationLogRepository
} from '@/infras/repositories'
import { Result } from '@/utils/data-types/result'
import dayjs from 'dayjs'
import isoWeek from 'dayjs/plugin/isoWeek'
import { Between } from 'typeorm'
import { ConfigService } from './config.service'

export default class AdminService {
  private postRepository: PostRepository
  private postModerateHistoryRepository: PostModerationHistoryRepository
  private adminRepository: AdminRepository
  private accountRepository: AccountRepository
  private moderationLogRepository: ModerationLogRepository
  private configService: ConfigService

  constructor() {
    this.postRepository = new PostRepository()
    this.postModerateHistoryRepository = new PostModerationHistoryRepository()
    this.adminRepository = new AdminRepository()
    this.accountRepository = new AccountRepository()
    this.moderationLogRepository = new ModerationLogRepository()
    this.configService = ConfigService.gI()
  }

  async getStatisticsForDashBoard() {
    dayjs.extend(isoWeek)
    const startOfWeek = dayjs().startOf('isoWeek').toDate() // Thứ 2 đầu tuần
    const endOfWeek = dayjs().endOf('isoWeek').toDate() // Chủ nhật cuối tuần

    // Tin chờ duyệt
    const totalPendingPost = await this.postRepository.count({
      where: { status: PostStatus.PENDING }
    })

    // Tin đã duyệt trong tuần này
    // COUNT DISTINCT posts được approve trong tuần (không phải số lần approve)
    const totalApprovedPostInWeek = await this.postModerateHistoryRepository
      .createQueryBuilder('history')
      .select('COUNT(DISTINCT history.postId)', 'count')
      .where('history.actionType = :actionType', { actionType: ActionType.APPROVED })
      .andWhere('history.execAt BETWEEN :start AND :end', {
        start: startOfWeek,
        end: endOfWeek
      })
      .getRawOne()
      .then((result) => parseInt(result.count))

    // COUNT DISTINCT posts bị reject trong tuần (không phải số lần reject)
    const totalRejectedPostInWeek = await this.postModerateHistoryRepository
      .createQueryBuilder('history')
      .select('COUNT(DISTINCT history.postId)', 'count')
      .where('history.actionType = :actionType', { actionType: ActionType.REJECTED })
      .andWhere('history.execAt BETWEEN :start AND :end', {
        start: startOfWeek,
        end: endOfWeek
      })
      .getRawOne()
      .then((result) => parseInt(result.count))

    return Result.ok({ totalPendingPost, totalRejectedPostInWeek, totalApprovedPostInWeek })
  }

  async resetPasswordOfModerator(moderatorId: number) {
    const moderator = await this.adminRepository.findOne({ where: { adminId: moderatorId } })
    if (!moderator) {
      return Result.fail(404, 'MODERATOR_NOT_FOUND')
    }
    const account = await this.accountRepository.findOne({ where: { accountId: moderator.accountId } })
    if (!account) {
      return Result.fail(404, 'ACCOUNT_NOT_FOUND')
    }
    const formatter = new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
    account.password = formatter.format(new Date(moderator.birthday)).replace(/\//g, '')
    await this.accountRepository.save(account)
    return Result.ok('Reset password successfully')
  }

  async listPostPending() {
    const postPending = await this.postRepository.find({
      where: { status: 'Pending' },
      relations: {
        owner: {
          account: true
        },
        multimediaFiles: {
          file: true
        }
      }, // Tự động join bảng Customer theo quan hệ ManyToOne
      select: {
        postId: true,
        title: true,
        description: true,
        price: true,
        streetNumber: true,
        street: true,
        city: true,
        district: true,
        ward: true,
        interiorCondition: true,
        acreage: true,
        createdAt: true,
        status: true,
        extendedAt: true,
        multimediaFiles: {
          fileId: true,
          file: {
            fileId: true,
            fileType: true,
            createdAt: true
          }
        },
        owner: {
          customerId: true,
          firstName: true,
          lastName: true,
          currentCity: true,
          currentDistrict: true,
          currentJob: true,
          avatar: true,
          joinedAt: true,
          account: {
            accountId: true,
            email: true,
            phone: true
          }
        }
      }
    })
    if (!postPending) {
      return Result.fail(404, 'Not_Found_Post')
    }
    return Result.ok(postPending)
  }

  async moderatePost(reviewerId: number, actionType: string, postId: number, reason: string, isHateContent?: boolean) {
    if (actionType === PostStatus.REJECTED && (!reason || reason.trim() === '')) {
      return Result.fail(400, 'REQUIRED_REASON')
    }
    const post = await this.postRepository.findOne({ where: { postId } })
    if (!post) {
      return Result.fail(404, 'POST_NOT_FOUND')
    }
    const isSuccess = await this.postModerateHistoryRepository.moderatePost(reviewerId, postId, actionType, reason)
    if (!isSuccess) {
      return Result.fail(500, 'Failed to moderate post')
    }

    // Log to ModerationLog if admin rejects for hate content
    if (actionType === PostStatus.REJECTED && isHateContent === true) {
      try {
        const threshold = Number(this.configService.get('MODERATION_THRESHOLD') || 0.7)
        await this.moderationLogRepository.logAdminReject({
          title: post.title,
          description: post.description,
          aiScore: post.aiModerationScore || 0,
          aiThreshold: threshold
        })
        console.log(`[ModerationLog] Logged admin rejection for hate content: postId=${postId}`)
      } catch (error) {
        console.error('[ModerationLog] Failed to log admin rejection:', error)
        // Don't fail the whole operation if logging fails
      }
    }

    return Result.ok({})
  }

  async getHistoryOfPost(postId: number) {
    const post = await this.postRepository.findOne({ where: { postId } })
    if (!post) {
      return Result.fail(404, 'POST_NOT_FOUND')
    }
    const history = await this.postModerateHistoryRepository.find({
      where: { postId },
      relations: {
        admin: {
          account: true
        }
      },
      select: {
        postId: true,
        actionType: true,
        reason: true,
        execAt: true,
        admin: {
          accountId: true,
          firstName: true,
          lastName: true,
          account: {
            email: true
          }
        }
      }
    })
    return Result.ok(history)
  }
  async getHistoryByModeratorId(moderatorId: number) {
    const moderator = await this.adminRepository.findOne({ where: { adminId: moderatorId } })
    if (!moderator) {
      return Result.fail(404, 'MODERATOR_NOT_FOUND')
    }
    const history = await this.postModerateHistoryRepository.find({
      relations: {
        post: true
      },
      where: {
        admin: { adminId: moderatorId }
      },
      select: {
        postId: true,
        actionType: true,
        reason: true,
        execAt: true,
        post: {
          title: true,
          postId: true
        }
      }
    })
    if (!history) {
      return Result.fail(404, 'Post not found')
    }
    return Result.ok(history)
  }

  async getModeratorsService(key: string | null) {
    const admins = await this.adminRepository
      .createQueryBuilder('admin')
      .leftJoinAndSelect('admin.account', 'account')
      .leftJoinAndSelect('account.role', 'role')
      .where('role.roleName != :roleName', { roleName: RoleType.MANAGER })
      .andWhere(key ? '(account.phone LIKE :key OR account.email LIKE :key)' : '1=1', key ? { key: `%${key}%` } : {})
      .select(['admin', 'account.email', 'account.phone', 'account.status'])
      .getMany()
    return Result.ok(admins)
  }

  async addModeratorsService(
    firstName: string,
    lastName: string,
    email: string,
    phone: string,
    gender: string,
    birthday: Date
  ) {
    // Tìm kiếm tài khoản đã tồn tại dựa trên email và phone
    const birthDay = dayjs(birthday)
    // Chuyển đổi ngày tháng sang chuỗi
    const birthdayString = birthDay.format('YYYY-MM-DD')

    if (await this.accountRepository.findOne({ where: { phone } })) {
      return Result.fail(400, 'PHONE_ALREADY_EXISTS')
    }
    if (await this.accountRepository.findOne({ where: { email } })) {
      return Result.fail(400, 'EMAIL_ALREADY_EXISTS')
    }

    // Tạo một đối tượng Admin mới
    const admin = this.adminRepository.createAdmin(
      firstName,
      lastName,
      gender,
      birthdayString, // Sử dụng chuỗi ngày tháng đã chuyển đổi
      email,
      phone
    )

    return Result.ok('User added as moderator successfully')
  }
  async updateModeratorService(status: string, moderatorId: number) {
    // Tìm kiếm tài khoản dựa trên moderatorId
    const moderator = await this.accountRepository.findOne({
      where: {
        admin: { adminId: moderatorId }
      },
      relations: {
        admin: true
      }
    })
    if (!moderator) {
      return Result.fail(404, 'User not found')
    }

    // Cập nhật trạng thái tài khoản
    moderator.status = status

    // Lưu thay đổi vào cơ sở dữ liệu
    await this.accountRepository.save(moderator)

    return Result.ok('Moderator status updated successfully')
  }
  async getProfileModeratorService(adminId: number) {
    console.log('adminId', adminId)
    // Tìm kiếm tài khoản dựa trên accountId
    const moderator = await this.adminRepository.findOne({
      select: {
        adminId: true,
        firstName: true,
        lastName: true,
        birthday: true,
        gender: true,
        joinedAt: true,
        account: {
          phone: true,
          email: true,
          status: true
        }
      },
      relations: {
        account: true
      },
      where: { adminId: adminId }
    })

    if (!moderator) {
      return Result.fail(404, 'MODERATOR_NOT_FOUND')
    }
    return Result.ok(moderator)
  }
  async getMyProfileService(adminId: number) {
    const admin = await this.adminRepository.findOne({
      where: { adminId },
      relations: {
        account: true
      },
      select: {
        account: {
          accountId: true,
          email: true,
          phone: true,
          status: true
        }
      }
    })
    if (!admin) {
      return Result.fail(404, 'User not found')
    }
    return Result.ok(admin)
  }
  async updateMyProfileService(
    accountId: number,
    phone?: string,
    email?: string,
    gender?: string,
    birthday?: string,
    firstName?: string,
    lastName?: string
  ) {
    const account = await this.accountRepository.findOne({
      where: { accountId }
    })

    if (!account) {
      return Result.fail(404, 'User not found')
    }
    const isSuccess = await this.accountRepository.changeAdminProfile(
      accountId,
      phone,
      email,
      gender,
      birthday,
      firstName,
      lastName
    )
    if (!isSuccess) {
      return Result.fail(500, 'Failed to update profile')
    }
    return Result.ok('Update profile successfully')
  }

  /**
   * Get moderation statistics (AI vs Admin rejections)
   */
  async getModerationStats() {
    const stats = await this.moderationLogRepository.getStatsByType()
    return Result.ok(stats)
  }

  /**
   * Export training data for PhoBERT retraining
   */
  async exportTrainingData(limit: number = 1000) {
    const data = await this.moderationLogRepository.getTrainingData(limit)
    return Result.ok(data)
  }
}
