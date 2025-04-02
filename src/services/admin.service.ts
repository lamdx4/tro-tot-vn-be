import { PostStatus } from '@/domains/entities/enum/value-object'
import { PostRepository } from '@/infras/repositories'
import { Result } from '@/utils/data-types/result'
import { In } from 'typeorm'

export default class AdminService {
  private postRepository: PostRepository

  constructor() {
    this.postRepository = new PostRepository()
  }

  async listPostPending() {
    const postPending = await this.postRepository.find({
      where: { status: 'Pending' },
      relations: {
        owner: true,
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
}
