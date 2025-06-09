import { Customer } from '@/domains/entities/customer.entity'
import { Post } from '@/domains/entities/post.entity'
import { AccountRepository, PostRepository, PostViewHistoryRepository } from '@/infras/repositories'
import { CreatePostDto } from '@/web/controllers/dto/create-post.dto'
import CloudDriveService from './google-drive.service'
import { MultimediaFile } from '@/domains/entities/multimedia-file.entity'
import { MultimediaType, PostStatus, RoleType } from '@/domains/entities/enum/value-object'
import { Result } from '@/utils/data-types/result'
import { MoreThan } from 'typeorm'
import { UpdatePostDto } from '@/web/controllers/dto/update-post.dto'
import JWTService from './jwt.service'

export default class PostService {
  private postRepository: PostRepository
  private cloudService: CloudDriveService
  private postViewHistoryRepository: PostViewHistoryRepository
  constructor() {
    this.postRepository = new PostRepository()
    this.cloudService = CloudDriveService.gI()
    this.postViewHistoryRepository = new PostViewHistoryRepository()
  }

  async searchPost(
    search: string,
    city?: string,
    district?: string,
    ward?: string,
    interiorCondition?: string,
    acreage?: number[],
    price?: number[],
    cursor?: Date,
    limit: number = 10
  ) {
    const formattedAcreage = acreage ? ([acreage[0], acreage[1]] as [number, number]) : undefined
    const formattedPrice = price ? ([price[0], price[1]] as [number, number]) : undefined
    const posts = await this.postRepository.searchPost(
      search,
      city,
      district,
      ward,
      interiorCondition,
      formattedAcreage,
      formattedPrice,
      cursor,
      limit
    )
    return Result.ok(posts)
  }

  async unHidePost(postId: number, customerId: number) {
    const isOwner = await this.postRepository.findOne({
      where: { postId, ownerId: customerId },
      select: { postId: true, ownerId: true }
    })
    if (!isOwner) {
      return Result.fail(403, 'CUSTOMER_NOT_OWNER')
    }
    const post = await this.postRepository.findOne({
      where: { postId },
      select: { postId: true, status: true, extendedAt: true }
    })
    if (!post) {
      return Result.fail(404, 'POST_NOT_FOUND')
    }
    if (post.status !== PostStatus.HIDDEN) {
      return Result.fail(400, 'STATE_NOT_ALLOW')
    }
    post.status = PostStatus.APPROVED
    const sixtyDaysAgo = new Date()
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)
    if (post.extendedAt < sixtyDaysAgo) {
      post.extendedAt = new Date()
    }
    await this.postRepository.save(post)
    return Result.ok({})
  }

  async editPost(
    customerId: number,
    postId: number,
    dto: UpdatePostDto,
    newImgs: Express.Multer.File[],
    newVideo: Express.Multer.File
  ) {
    try {
      const post = await this.postRepository.findOne({
        where: { postId, ownerId: customerId },
        relations: {
          multimediaFiles: {
            file: true
          }
        },
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
          multimediaFiles: {
            fileId: true,
            file: {
              fileId: true,
              fileCloudId: true,
              fileType: true,
              createdAt: true
            }
          }
        }
      })
      if (!post) {
        return Result.fail(403, 'CUSTOMER_NOT_OWNER')
      }
      if (!post) {
        return Result.fail(404, 'POST_NOT_FOUND')
      }
      const listId = await this.cloudService.uploadFiles(newVideo ? [...newImgs, newVideo] : newImgs)
      if (!listId) {
        throw new Error('Cannot upload files')
      }
      console.log(dto)
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
      post.extendedAt = new Date()
      const mediaFile = listId.map((id) => {
        const file = new MultimediaFile()
        file.fileCloudId = id.fileId
        file.fileType = id.fileType.startsWith('image/') ? MultimediaType.IMAGE : MultimediaType.VIDEO
        return file
      })
      const deletedFileIds = post.multimediaFiles.filter((v) => {
        return !dto.oldFiles.find((i) => Number(i) === v.fileId)
      })
      console.log(deletedFileIds)
      console.log(post.multimediaFiles)

      if (deletedFileIds.length > 0) {
        for (const file of deletedFileIds) {
          if (file) {
            console.log(file.file.fileCloudId)
            await this.cloudService.delete(file.file.fileCloudId)
            const isDeletedFile = await this.postRepository.removeFileFromPost(post.postId, file.fileId)
            if (!isDeletedFile) {
              return Result.fail(500, 'DELETED_FAILURE')
            }
          }
        }
      }
      const isSuccess = await this.postRepository.editPost(post, mediaFile)
      console.log(isSuccess)
      if (!isSuccess) {
        return Result.fail(500, '"Uploaded failure"')
      }
      return Result.ok('Upload successfully')
    } catch (e) {
      console.log(e)
      return Result.fail(500, 'Uploaded failure')
    }
  }

  async getDetailMyPost(postId: number, customerId: number) {
    const post = await this.postRepository.findOne({
      where: { postId, ownerId: customerId },
      relations: {
        multimediaFiles: {
          file: true
        }
      },
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
        multimediaFiles: {
          fileId: true,
          file: {
            fileId: true,
            fileType: true,
            createdAt: true
          }
        }
      }
    })
    if (!post) {
      return Result.fail(404, 'POST_NOT_FOUND')
    }
    return Result.ok(post)
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

  async getPostDetail(postId: number, authorizationToken?: string) {
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

      try {
        if (authorizationToken) {
          const token = (authorizationToken.startsWith('Bearer ') ?? '') ? authorizationToken.split(' ')[1] : undefined
          if (token) {
            const jwtService = new JWTService()
            const result = jwtService.verifyAccessToken(token)
            const account = result.getValue() ?? undefined
            if (account) {
              if (account.role.roleName === RoleType.CUSTOMER) {
                const isViewHistory = await this.postViewHistoryRepository.findOne({
                  where: {
                    customerId: account.customer.customerId,
                    postId: postId
                  }
                })
                if (!isViewHistory) {
                  await this.postViewHistoryRepository.save({
                    customerId: account.customer.customerId,
                    postId: postId,
                    viewedAt: new Date()
                  })
                } else
                  await this.postViewHistoryRepository.update(
                    {
                      historyId: isViewHistory?.historyId
                    },
                    {
                      customerId: account.customer.customerId,
                      postId: postId,
                      viewedAt: new Date()
                    }
                  )
              }
            }
          }
        }
      } catch (e) {
        console.log(e)
      }

      return Result.ok(post)
    } catch (e) {
      console.log(e)
      return Result.fail(500, 'Get post failure')
    }
  }

  async getPosts(customer: Customer, status: string, cursor: number, limit: number) {
    try {
      console.log('customer', customer)
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
          },
          moderationHistories: true
        },
        where: { ownerId: customer.customerId, status: status, postId: MoreThan(cursor) },
        relations: {
          moderationHistories: true,
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

  async createPost(customer: Customer, dto: CreatePostDto, imgs: Express.Multer.File[], video?: Express.Multer.File) {
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
      for (const id of listId) {
        this.cloudService.delete(id.fileId)
      }
      return Result.fail(500, 'Uploaded failure')
    }
  }
}
