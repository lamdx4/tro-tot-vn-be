import { Customer } from '@/domains/entities/customer.entity'
import { Post } from '@/domains/entities/post.entity'
import { PostRepository } from '@/infras/repositories'
import { CreatePostDto } from '@/web/controllers/dto/create-post.dto'
import CloudDriveService from './google-drive.service'
import { MultimediaFile } from '@/domains/entities/multimedia-file.entity'
import { MultimediaType } from '@/domains/entities/enum/value-object'
import { Result } from '@/utils/data-types/result'

export default class PostService {
  private postRepository: PostRepository
  private cloudService: CloudDriveService
  constructor() {
    this.postRepository = new PostRepository()
    this.cloudService = CloudDriveService.gI()
  }
  createPost = async (
    customer: Customer,
    dto: CreatePostDto,
    imgs: Express.Multer.File[],
    video?: Express.Multer.File
  ) => {
    const fileImgs = imgs.map((value) => {
      return value.stream
    })
    const listId = await this.cloudService.uploadFiles(fileImgs)
    if (!listId) {
      throw new Error('Cannot upload files')
    }
    try {
      const mediaFile = listId.map((id) => {
        const file = new MultimediaFile()
        file.fileCloudId = id
        file.fileType = MultimediaType.IMAGE
        return file
      })
      if (video) {
        const videoId = await this.cloudService.uploadFile(video.stream)
        if (!videoId) {
          throw new Error('Cannot upload files')
        }
        const videoMedia = new MultimediaFile()
        videoMedia.fileCloudId = videoId
        videoMedia.fileType = MultimediaType.VIDEO
        mediaFile.push(videoMedia)
      }
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
