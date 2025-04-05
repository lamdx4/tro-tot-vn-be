import { Customer } from '@/domains/entities/customer.entity'
import { Post } from '@/domains/entities/post.entity'
import { PostRepository } from '@/infras/repositories'
import { CreatePostDto } from '@/web/controllers/dto/create-post.dto'
import CloudDriveService from './google-drive.service'
import { MultimediaFile } from '@/domains/entities/multimedia-file.entity'
import { MultimediaType, PostStatus } from '@/domains/entities/enum/value-object'
import { Result } from '@/utils/data-types/result'
import { MoreThan } from 'typeorm'

export default class PostService {
  private postRepository: PostRepository
  private cloudService: CloudDriveService
  constructor() {
    this.postRepository = new PostRepository()
    this.cloudService = CloudDriveService.gI()
  }

  async hidePost(postId: number, customerId: number) {
    const isOwner = await this.postRepository.findOne({
      where: { postId, ownerId: customerId },
      select: { postId: true, ownerId: true }
    })
    if (!isOwner) {
      return Result.fail(403, 'CUSTOMER_NOT_OWNER')
    }
    const post = await this.postRepository.findOne({
      where: { postId },
      select: { postId: true, status: true }
    })
    if (!post) {
      return Result.fail(404, 'POST_NOT_FOUND')
    }
    if (post.status !== PostStatus.APPROVED) {
      return Result.fail(400, 'STATE_NOT_ALLOW')
    }
    post.status = PostStatus.HIDDEN
    await this.postRepository.save(post)
    return Result.ok({})
  }

  async getLastPost(limit: number) {
    try {
      const posts = await this.postRepository.find({
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
            postId: false
          }
        },
        relations: {
          multimediaFiles: true
        },
        where: { status: 'Approved' },
        order: { createdAt: 'DESC' },
        take: limit
      })
      return Result.ok(posts)
    } catch (e) {
      console.log(e)
      return Result.fail(500, 'Get post failure')
    }
  }
  async getPostDetail(postId: number) {
    try {
      const post = await this.postRepository.findOne({
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
        },
        where: { postId: postId, status: 'Approved' },
        relations: {
          multimediaFiles: {
            file: true
          },
          owner: {
            account: true
          }
        }
      })
      if (!post) {
        return Result.fail(404, 'Post not found')
      }
      return Result.ok(post)
    } catch (e) {
      console.log(e)
      return Result.fail(500, 'Get post failure')
    }
  }

  async getPosts(customer: Customer, status: string, cursor: number, limit: number) {
    try {
      const posts = await this.postRepository.find({
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
            postId: false,
            file: {
              fileId: false,
              fileCloudId: false,
              fileType: true,
              createdAt: true
            }
          }
        },
        where: { ownerId: customer.customerId, status: status, postId: MoreThan(cursor) },
        relations: {
          multimediaFiles: {
            file: true
          }
        },
        take: limit
      })
      return Result.ok(posts)
    } catch (e) {
      console.log(e)
      return Result.fail(500, 'Get post failure')
    }
  }
  createPost = async (
    customer: Customer,
    dto: CreatePostDto,
    imgs: Express.Multer.File[],
    video?: Express.Multer.File
  ) => {
    const listId = await this.cloudService.uploadFiles(video ? [...imgs, video] : imgs)
    if (!listId) {
      throw new Error('Cannot upload files')
    }
    try {
      const mediaFile = listId.map((id) => {
        const file = new MultimediaFile()
        file.fileCloudId = id.fileId
        file.fileType = id.fileType.startsWith('image/') ? MultimediaType.IMAGE : MultimediaType.VIDEO
        return file
      })
      const post = new Post()
      post.ownerId = customer.customerId
      post.title = dto.title
      post.description = dto.description
      post.price = Number(dto.price)
      post.streetNumber = dto.streetNumber
      post.street = dto.street
      post.city = dto.city
      post.district = dto.district
      post.ward = dto.ward
      post.interiorCondition = dto.interiorStatus
      post.acreage = Number(dto.acreage)
      await this.postRepository.createPost(post, mediaFile)
      return Result.ok('Upload successfully')
    } catch (e) {
      console.log(e)
      return Result.fail(500, 'Uploaded failure')
    }
  }
}
