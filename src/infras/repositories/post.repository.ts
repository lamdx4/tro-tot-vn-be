import { Post } from '@/domains/entities/post.entity'
import { BaseRepository } from './base.repository'
import { MultimediaFile } from '@/domains/entities/multimedia-file.entity'
import { PostMultimediaFile } from '@/domains/entities/post-multimedia-file.entity'
import { PostStatus } from '@/domains/entities/enum/value-object'

export class PostRepository extends BaseRepository<Post> {
  constructor() {
    super(Post)
  }
  async createPost(post: Post, listFile: MultimediaFile[]): Promise<void> {
    await this.manager.transaction(async (transactionalEntityManager) => {
      const result = await transactionalEntityManager.getRepository(Post).insert(post)
      const postId = result.identifiers[0].postId
      post.postId = postId
      await transactionalEntityManager.getRepository(MultimediaFile).save(listFile)
      await transactionalEntityManager.getRepository(PostMultimediaFile).save(
        listFile.map((file) => {
          return {
            postId: post.postId,
            fileId: file.fileId
          }
        })
      )
    })
  }
  async editPost(post: Post, listFile: MultimediaFile[]) {
    try {
      return await this.manager.transaction(async (transactionalEntityManager) => {
        await transactionalEntityManager.getRepository(Post).update(
          {
            postId: post.postId
          },
          {
            title: post.title,
            description: post.description,
            price: post.price,
            streetNumber: post.streetNumber,
            street: post.street,
            district: post.district,
            city: post.city,
            ward: post.ward,
            longitude: post.longitude,
            interiorCondition: post.interiorCondition,
            acreage: post.acreage,
            status: PostStatus.PENDING
          }
        )
        listFile = await transactionalEntityManager.getRepository(MultimediaFile).save(listFile)
        console.log(listFile)
        await transactionalEntityManager.getRepository(PostMultimediaFile).save(
          listFile.map((file) => {
            return {
              postId: post.postId,
              fileId: file.fileId
            }
          })
        )
        return true
      })
    } catch (error) {
      console.error('Error editing post:', error)
      return false
    }
  }

  async removeFileFromPost(postId: number, fileId: number): Promise<boolean> {
    try {
      await this.manager.transaction(async (transactionalEntityManager) => {
        await transactionalEntityManager.getRepository(PostMultimediaFile).delete({
          postId,
          fileId
        })
        await transactionalEntityManager.getRepository(MultimediaFile).delete({
          fileId
        })
      })
      return true
    } catch (error) {
      console.error('Error removing file from post:', error)
      return false
    }
  }
}
