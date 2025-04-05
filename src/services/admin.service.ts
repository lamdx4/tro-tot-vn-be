import { PostStatus } from '@/domains/entities/enum/value-object'
import { AdminRepository, PostModerationHistoryRepository, PostRepository } from '@/infras/repositories'
import { Result } from '@/utils/data-types/result'

export default class AdminService {
  private postRepository: PostRepository
  private postModerateHistoryRepository: PostModerationHistoryRepository
  private adminRepository: AdminRepository

  constructor() {
    this.postRepository = new PostRepository()
    this.postModerateHistoryRepository = new PostModerationHistoryRepository()
    this.adminRepository = new AdminRepository()
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

  async moderatePost(status: string, postId: number, message: string) {
    if (status === PostStatus.REJECTED && (!message || message.trim() === '')) {
      return Result.fail(400, "Rejection reason is required when status is 'Reject'")
    }

    const update = await this.postRepository.update(
      {
        postId: postId,
        status: PostStatus.PENDING
      },
      { status }
      
    )

    if (update.affected === 0) {
      return Result.fail(404, 'Post not found or status not changed')
    }
    return Result.ok('Post status updated successfully')
  }
  async moderateHistory(postId: number, accountId: number, actionType: string, reason: string) {
    // Kiểm tra dữ liệu trước khi lưu
    const post = await this.postRepository.findOne({ where: { postId } })
    const admin = await this.adminRepository.findOne({
      where: { accountId },
      relations: ['account']
    })
    if (!post) {
      return Result.fail(404, 'Post not found')
    
      }
    if (!admin) {
      return Result.fail(404, 'Admin not found')
    }

  
    // Lưu lại lịch sử moderation
    const save = await this.postModerateHistoryRepository.save({
      postId,  // Directly use postId, no need to wrap in an object
      adminId: admin.adminId,  // Directly use adminId
      actionType,
      reason,
      execAt: new Date()
    })
  
    if (!save) {
      return Result.fail(404, 'Failed to save moderation history')
    }
  
    return Result.ok('Post status updated successfully')
  }
  async getHistory(postId: number) {
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
    if (!history) {
      return Result.fail(404, 'Post not found')
    }
    return Result.ok(history)
  }
  
}
