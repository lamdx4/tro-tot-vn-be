import { PostStatus } from '@/domains/entities/enum/value-object'
import {
  AccountRepository,
  CustomerRepository,
  PostRepository,
  PostViewHistoryRepository,
  RateRepository,
  SavedPostRepository,
  SubscriptionAreaPostRepository
} from '@/infras/repositories'
import { Result } from '@/utils/data-types/result'
import ChangedProfileDto from '@/web/controllers/dto/changed-profile.dto'
import { LessThan, LessThanOrEqual, MoreThan } from 'typeorm'

export class CustomerService {
  private accountRepository: AccountRepository
  private customerRepository: CustomerRepository
  private postRepository: PostRepository
  private savedPostRepository: SavedPostRepository
  private historyRepository: PostViewHistoryRepository
  private rateRepository: RateRepository
  private subscriptionRepository: SubscriptionAreaPostRepository

  constructor() {
    this.accountRepository = new AccountRepository()
    this.customerRepository = new CustomerRepository()
    this.postRepository = new PostRepository()
    this.savedPostRepository = new SavedPostRepository()
    this.historyRepository = new PostViewHistoryRepository()
    this.rateRepository = new RateRepository()
    this.subscriptionRepository = new SubscriptionAreaPostRepository()
  }

  async getRateFromPost(postId: number, cursor: Date | null, limit: number) {
    console.log('getRateFromPost', postId, cursor, limit)
    const post = await this.postRepository.findOne({
      where: { postId: postId, status: PostStatus.APPROVED }
    })
    if (post === null) {
      return Result.fail(404, 'POST_NOT_FOUND')
    }
    const rates = await this.rateRepository
      .createQueryBuilder('rate')
      .leftJoinAndSelect('rate.rater', 'rater')
      .where('rate.postId = :postId', { postId })
      .andWhere(cursor ? 'rate.createdAt < :cursor' : '1=1', { cursor })
      .orderBy('rate.createdAt', 'DESC')
      .take(limit)
      .getMany()

    return Result.ok(rates)
  }

  async getAvgRateFromPost(postId: number) {
    const post = await this.postRepository.findOne({
      where: { postId: postId, status: PostStatus.APPROVED }
    })
    if (post === null) {
      return Result.fail(404, 'POST_NOT_FOUND')
    }
    const avgRate = await this.rateRepository
      .createQueryBuilder('rate')
      .select('CAST(AVG(rate.numRate) AS FLOAT)', 'avgRate')
      .where('rate.postId = :postId', { postId })
      .getRawOne()
    const coutRate = await this.rateRepository
      .createQueryBuilder('rate')
      .select('COUNT(rate.rateId)', 'countRate')
      .where('rate.postId = :postId', { postId })
      .getRawOne()

    return Result.ok({
      avgRate: avgRate.avgRate,
      countRate: coutRate.countRate
    })
  }

  async addRate(customerId: number, postId: number, numStart: number, comment: string) {
    const isExist = await this.postRepository.findOne({
      where: { postId: postId, status: PostStatus.APPROVED }
    })
    if (isExist === null) {
      return Result.fail(404, 'POST_NOT_FOUND')
    }
    const isOwner = await this.postRepository.findOne({
      where: { postId: postId, ownerId: customerId }
    })

    if (isOwner) {
      return Result.fail(400, 'CANNOT_RATE_OWN_POST')
    }

    const rate = await this.rateRepository.findOne({
      where: { raterId: customerId, postId: postId }
    })
    if (rate) {
      await this.rateRepository.update(
        { rateId: rate.rateId },
        {
          numRate: numStart,
          comment: comment,
          createdAt: new Date()
        }
      )
    } else {
      const object = {
        raterId: customerId,
        postId: postId,
        numRate: numStart,
        comment: comment
      }
      await this.rateRepository.insert(object)
    }
    return Result.ok({})
  }

  async getMyRateOnPost(customerId: number, postId: number) {
    console.log('getMyRateOnPost', customerId, postId)
    const rate = await this.rateRepository.findOne({
      where: { raterId: customerId, postId: postId },
      relations: { rater: true }
    })
    if (rate === null) {
      return Result.fail(404, 'RATE_NOT_FOUND')
    }
    return Result.ok(rate)
  }

  async delMyRateOnPost(customerId: number, postId: number) {
    const rate = await this.rateRepository.findOne({
      where: { raterId: customerId, postId: postId }
    })
    if (rate === null) {
      return Result.fail(404, 'RATE_NOT_FOUND')
    }
    await this.rateRepository.delete({ raterId: customerId, postId: postId })
    return Result.ok({})
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
      where: { ownerId: customerId, status: status },
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
      where: { customerId},
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
    console.log('getViewedPost', data)
    return Result.ok(data)
  }
  async addPostHistoryView(customerId: number, postId: number) {
    const post = await this.postRepository.findOne({
      where: { postId: postId, status: PostStatus.APPROVED }
    })
    if (post === null) {
      return Result.fail(404, 'POST_NOT_FOUND')
    }
    const isOwner = await this.postRepository.findOne({
      where: { postId: postId, ownerId: customerId }
    })
    if (isOwner) {
      return Result.fail(400, 'CANNOT_VIEW_OWN_POST')
    }
    const isExist = await this.historyRepository.findOne({
      where: { customerId, postId }
    })
    if (isExist) {
      await this.historyRepository.update(
        { customerId, postId },
        {
          viewedAt: new Date()
        }
      )
    } else {
      const object = {
        customerId: customerId,
        postId: postId,
        viewedAt: new Date()
      }
      await this.historyRepository.insert(object)
    }
    return Result.ok({})
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

  async getAnalytics(customerId: number) {}

  async getSubscription(customerId: number) {
    const subscription = await this.subscriptionRepository.find({
      where: { customerId },
      order: { createdAt: 'DESC' }
    })
    return Result.ok(subscription)
  }
  async createSubscription(customerId: number, city: string, district: string) {
    const isExist = await this.subscriptionRepository.findOne({
      where: { customerId, city, district }
    })
    if (isExist) {
      return Result.fail(400, 'SUBSCRIPTION_ALREADY_EXISTS')
    }
    const subscription = this.subscriptionRepository.create({
      customerId,
      city,
      district,
      createdAt: new Date()
    })
    const data = await this.subscriptionRepository.save(subscription)
    return Result.ok(data)
  }

  editSubscription = async (customerId: number, subscriptionId: number, city: string, district: string) => {
    const subscription = await this.subscriptionRepository.findOne({
      where: { customerId, subscriptionId }
    })
    if (!subscription) {
      return Result.fail(404, 'SUBSCRIPTION_NOT_FOUND')
    }
    subscription.city = city
    subscription.district = district
    await this.subscriptionRepository.save(subscription)
    return Result.ok(subscription)
  }

  deleteSubscription = async (customerId: number, subscriptionId: number) => {
    const subscription = await this.subscriptionRepository.findOne({
      where: { customerId, subscriptionId }
    })
    if (!subscription) {
      return Result.fail(404, 'SUBSCRIPTION_NOT_FOUND')
    }
    await this.subscriptionRepository.delete({ customerId, subscriptionId })
    return Result.ok({})
  }
  
}
