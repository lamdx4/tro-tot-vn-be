import { Post } from '@/domains/entities/post.entity'
import { BaseRepository } from './base.repository'
import { MultimediaFile } from '@/domains/entities/multimedia-file.entity'
import { PostMultimediaFile } from '@/domains/entities/post-multimedia-file.entity'

export class PostRepository extends BaseRepository<Post> {
  constructor() {
    super(Post)
  }
  async createPost(post: Post, listFile: MultimediaFile[]): Promise<void> {
    await this.manager.transaction(async (transactionalEntityManager) => {
      await transactionalEntityManager.getRepository(Post).save(post)
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
}
