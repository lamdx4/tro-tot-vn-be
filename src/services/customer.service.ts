import { PostStatus, RoleType } from '@/domains/entities/enum/value-object'
import {
  AccountRepository,
  AppointmentRepository,
  CustomerRepository,
  PostRepository,
  PostViewHistoryRepository,
  SavedPostRepository
} from '@/infras/repositories'
import { Result } from '@/utils/data-types/result'
import ChangedProfileDto from '@/web/controllers/dto/changed-profile.dto'
import { da } from '@faker-js/faker/.'
import { MoreThan } from 'typeorm'

export class CustomerService {
  private accountRepository: AccountRepository
  private customerRepository: CustomerRepository
  private postRepository: PostRepository
  private savedPostRepository: SavedPostRepository
  private appointmentRepository: AppointmentRepository
  private historyRepository: PostViewHistoryRepository

  constructor() {
    this.accountRepository = new AccountRepository()
    this.customerRepository = new CustomerRepository()
    this.postRepository = new PostRepository()
    this.savedPostRepository = new SavedPostRepository()
    this.appointmentRepository = new AppointmentRepository()
    this.historyRepository = new PostViewHistoryRepository()
  }

  // đã gửi, đã bị từ chối, cuộc hẹn sắp tới, đang chờ chấp nhận
  async getAllAppointments(customerId: number) {
    const sentAppointments = await this.appointmentRepository.find({
      where: { requesterId: customerId, appointmentAt: MoreThan(new Date()), status: 'Pending' },
      relations: {
        post: {
          owner: true,
          multimediaFiles: { file: true }
        }
      },
      order: { createdAt: 'DESC' }
    })
    const receivedAppointments = await this.appointmentRepository.find({
      where: { post: { ownerId: customerId }, appointmentAt: MoreThan(new Date()) },
      relations: {
        requester: true,
        post: true
      },
      order: { createdAt: 'DESC' }
    })
    const inComingAppointments = await this.appointmentRepository.find({
      where: { appointmentAt: MoreThan(new Date()), status: 'Accept' },
      relations: {
        requester: true,
        post: true
      },
      order: { createdAt: 'DESC' }
    })
    const rejectedAppointments = await this.appointmentRepository.find({
      where: { appointmentAt: MoreThan(new Date()), status: 'Reject' },
      relations: {
        requester: true,
        post: true
      },
      order: { createdAt: 'DESC' }
    })

    return Result.ok({
      sentAppointments: sentAppointments,
      receivedAppointments: receivedAppointments,
      inComingAppointments: inComingAppointments,
      rejectedAppointments: rejectedAppointments
    })
  }

  async deleteSavedPost(customerId: number, postId: number) {
    console.log('deleteSavedPost', customerId, postId)
    const savedPost = await this.savedPostRepository.findOne({
      where: { customerId, postId }
    })
    if (!savedPost) {
      return Result.fail(404, 'POST_NOT_SAVED')
    }
    await this.savedPostRepository.delete({ customerId, postId })
    return Result.ok({})
  }

  async updateMyProfile(customerId: number, data: ChangedProfileDto) {
    const customer = await this.customerRepository.findOne({
      where: { customerId },
      relations: { account: true },
      select: {
        customerId: true,
        lastName: true,
        firstName: true,
        bio: true,
        birthday: true,
        gender: true,
        account: {
          email: true
        }
      }
    })
    if (!customer) {
      return Result.fail(404, 'CUSTOMER_NOT_FOUND')
    }
    if (customer.account.email !== data.email) {
      const account = await this.accountRepository.findOne({
        where: { email: data.email }
      })
      if (account) {
        return Result.fail(400, 'EMAIL_ALREADY_EXISTS')
      }
    }
    const isSuccess = await this.customerRepository.updateProfile(customerId, data)
    if (!isSuccess) {
      return Result.fail(400, 'UPDATE_PROFILE_FAILED')
    }
    return Result.ok({})
  }

  async getCustomerProfile(customerId: number) {
    const status = 'Approved'
    const customer = await this.customerRepository.findOne({
      where: { customerId }
    })

    const posts = await this.postRepository.find({
      where: { ownerId: customerId, status : status },
      order: { postId: 'DESC' },
      take: 8,
      relations: {
        multimediaFiles: { file: true }
      }
    })

    const data = { ...customer, posts }

    if (!data) {
      console.log(data)
      return Result.fail(404, 'CUSTOMER_NOT_FOUND')
    }
    return Result.ok(data)
  }

  async getAppointments(customerId: number) {
    const r = await this.appointmentRepository.find({
      where: { requesterId: customerId },
      relations: {
        post: {
          owner: true,
          multimediaFiles: { file: true }
        }
      },
      order: { createdAt: 'DESC' }
    })
    return Result.ok(r)
  }

  async getMyProfile(customerId: number) {
    const customer = await this.customerRepository.findOne({
      where: { customerId: customerId },
      relations: { account: true },
      select: {
        customerId: true,
        lastName: true,
        firstName: true,
        bio: true,
        birthday: true,
        gender: true,
        account: {
          email: true,
          phone: true
        }
      }
    })
    if (!customer) {
      return Result.fail(404, 'CUSTOMER_NOT_FOUND')
    }
    return Result.ok(customer)
  }

  async savePost(customerId: number, postId: number) {
    const post = await this.postRepository.findOne({
      where: { postId: postId, status: PostStatus.APPROVED }
    })
    if (post === null) {
      return Result.fail(404, 'POST_NOT_FOUND')
    }
    const isSavedPost = await this.savedPostRepository.findOne({
      where: { customerId, postId }
    })
    if (isSavedPost) {
      return Result.fail(400, 'POST_ALREADY_SAVED')
    }
    await this.savedPostRepository.insert({
      customerId: customerId,
      postId: postId
    })
    return Result.ok({})
  }

  async isCustomerSavedPost(customerId: number, postId: number) {
    const savedPost = await this.savedPostRepository.findOne({
      where: { customerId, postId }
    })
    if (savedPost) {
      return Result.ok(true)
    } else {
      return Result.ok(false)
    }
  }
  async getViewedPost(customerId: number) {
    const viewedPosts = await this.historyRepository.find({
      where: { customerId, post: { status: PostStatus.APPROVED } },
      relations: {
        post: {
          multimediaFiles: { file: true }
        }
      },
      order: { viewedAt: 'DESC' }
    })
    const data = viewedPosts.map((viewedPost) => {
      return viewedPost.post
    })
    return Result.ok(data)
  }
  async getSavedPost(customerId: number) {
    const savedPosts = await this.savedPostRepository.find({
      where: { customerId, post: { status: PostStatus.APPROVED } },
      relations: {
        post: {
          multimediaFiles: { file: true }
        }
      },
      order: { createdAt: 'DESC' }
    })
    const data = savedPosts.map((savedPost) => {
      return savedPost.post
    })
    return Result.ok(data)
  }

  async createAppointment(customerId: number, postId: number, appointmentAt: Date) {
    const post = await this.postRepository.findOne({
      where: { postId: postId, status: PostStatus.APPROVED }
    })
    if (post === null) {
      return Result.fail(404, 'POST_NOT_FOUND')
    }

    const existingAppointments = await this.appointmentRepository.find({
      where: { requesterId: customerId },
      order: { appointmentAt: 'DESC' }
    })

    for (const existingAppointment of existingAppointments) {
      const timeDifference = Math.abs(
        new Date(existingAppointment.appointmentAt).getTime() - new Date(appointmentAt).getTime()
      )
      const hoursDifference = timeDifference / (1000 * 60 * 60)
      if (hoursDifference < 24) {
        return Result.fail(400, 'APPOINTMENTS_MUST_BE_24H_APART')
      }
    }

    const appointment = await this.appointmentRepository.exists({
      where: { postId: postId, requesterId: customerId, appointmentAt: appointmentAt }
    })
    if (appointment) {
      return Result.fail(400, 'APPOINTMENT_ALREADY_EXISTS')
    }

    const r = await this.appointmentRepository.insert({
      postId: postId,
      requesterId: customerId,
      status: 'Pending',
      appointmentAt: appointmentAt
    })
    if (!r.identifiers[0].appointmentId) {
      return Result.fail(500, 'INTERNAL_SERVER_ERROR')
    }
    return Result.ok({
      appointmentId: r.identifiers[0].appointmentId
    })
  }

  async getAnalytics(customerId: number) {}
}
