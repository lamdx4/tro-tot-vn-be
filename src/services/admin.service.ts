import { PostStatus, RoleType } from '@/domains/entities/enum/value-object'
import { AccountRepository, AdminRepository, PostModerationHistoryRepository, PostRepository } from '@/infras/repositories'
import { Result } from '@/utils/data-types/result'
import dayjs from 'dayjs'
import { Like, Not } from 'typeorm'

export default class AdminService {

  private postRepository: PostRepository
  private postModerateHistoryRepository: PostModerationHistoryRepository
  private adminRepository: AdminRepository
  private accountRepository: AccountRepository;

  constructor() {
    this.postRepository = new PostRepository()
    this.postModerateHistoryRepository = new PostModerationHistoryRepository()
    this.adminRepository = new AdminRepository()
    this.accountRepository = new AccountRepository()
  }

  async resetPasswordOfModerator(password: any, moderatorId: any) {
    const moderator = await this.adminRepository.findOne({ where: { adminId: moderatorId } })
    if (!moderator) {
      return Result.fail(404, 'MODERATOR_NOT_FOUND')
    }
    const account = await this.accountRepository.findOne({ where: { accountId: moderator.accountId } })
    if (!account) {
      return Result.fail(404, 'ACCOUNT_NOT_FOUND')
    }
    account.password = password
    await this.accountRepository.save(account)
    return Result.ok("Reset password successfully")
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
          address: true,
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

  async moderatePost(reviewerId: number, actionType: string, postId: number, reason: string) {
    if (actionType === PostStatus.REJECTED && (!reason || reason.trim() === '')) {
      return Result.fail(400, "REQUIRED_REASON")
    }
    const post = await this.postRepository.findOne({ where: { postId } })
    if (!post) {
      return Result.fail(404, 'POST_NOT_FOUND')
    }
    const isSuccess = await this.postModerateHistoryRepository.moderatePost(reviewerId, postId, actionType, reason)
    if (!isSuccess) {
      return Result.fail(500, 'Failed to moderate post')
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
        post: true,
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
          postId: true,
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
      .createQueryBuilder("admin")
      .leftJoinAndSelect("admin.account", "account")
      .leftJoinAndSelect("account.role", "role")
      .where("role.roleName != :roleName", { roleName: RoleType.MANAGER })
      .andWhere(
        key
          ? "(account.phone LIKE :key OR account.email LIKE :key)"
          : "1=1",
        key ? { key: `%${key}%` } : {}
      )
      .select([
        "admin",
        "account.email",
        "account.phone",
        "account.status",
      ])
      .getMany();
    return Result.ok(admins)
  }

  async addModeratorsService(firstName: string, lastName: string, email: string, phone: string, gender: string, birthday: Date, password: string) {
    // Tìm kiếm tài khoản đã tồn tại dựa trên email và phone
    const birthDay = dayjs(birthday);
    // Chuyển đổi ngày tháng sang chuỗi
    const birthdayString = birthDay.format('YYYY-MM-DD');

    let account = await this.accountRepository.findOne({ where: { email, phone } });

    // Nếu tài khoản không tồn tại, tạo một tài khoản mới
    if (!account) {
      account = this.accountRepository.create({ email, phone, status: "Active", password, roleId: 2 });
      await this.accountRepository.save(account);
    } else {
      return Result.fail(400, "Account already exists")
    }

    // Tạo một đối tượng Admin mới
    const admin = this.adminRepository.create({
      firstName,
      lastName,
      gender,
      birthday: birthdayString, // Sử dụng chuỗi ngày tháng đã chuyển đổi
      accountId: account.accountId, // Gán accountId
      account,
    });

    // Lưu đối tượng Admin vào cơ sở dữ liệu
    await this.adminRepository.save(admin);

    return Result.ok("User added as moderator successfully");
  }
  async updateModeratorService(status: string, moderatorId: number) {
    // Tìm kiếm tài khoản dựa trên moderatorId
    const moderator = await this.accountRepository.findOne({
      where: {
        admin: { adminId: moderatorId },
      },
      relations: {
        admin: true
      }
    },);
    if (!moderator) {
      return Result.fail(404, 'User not found');
    }

    // Cập nhật trạng thái tài khoản
    moderator.status = status;

    // Lưu thay đổi vào cơ sở dữ liệu
    await this.accountRepository.save(moderator);

    return Result.ok('Moderator status updated successfully');
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
          status: true,
        }
      },
      relations: {
        account: true,
      },
      where: { adminId: adminId },
    });

    if (!moderator) {
      return Result.fail(404, 'MODERATOR_NOT_FOUND');
    }
    return Result.ok(moderator);
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
          status: true,
        }
      }
    })
    if (!admin) {
      return Result.fail(404, 'User not found')
    }
    return Result.ok(admin)
  }
  async updateMyProfileService(accountId: number, phone: string, email: string) {
    const account = await this.accountRepository.findOne({
      where: { accountId }
    })

    if (!account) {
      return Result.fail(404, 'User not found');
    }
    let isUpdated = false;

    // Kiểm tra số điện thoại đã tồn tại ở tài khoản khác
    if (phone && account.phone !== phone) {
      const existPhone = await this.accountRepository.findOne({
        where: { phone, accountId: Not(accountId) }
      });
      if (existPhone) {
        return Result.fail(400, 'Phone number already exists');
      }

      account.phone = phone;
      isUpdated = true;
    }

    // Kiểm tra email đã tồn tại ở tài khoản khác
    if (email && account.email !== email) {
      const existEmail = await this.accountRepository.findOne({
        where: { email, accountId: Not(accountId) }
      });

      if (existEmail) {
        return Result.fail(400, 'Email already exists');
      }


      account.email = email;
      isUpdated = true;
    }

    // Nếu không thay đổi gì thì trả về
    if (!isUpdated) {
      return Result.ok("No changes detected");
    }

    await this.accountRepository.save(account);

    return Result.ok("Update profile successfully");
  }

}
