import { Post } from '@/domains/entities/post.entity'
import { BaseRepository } from './base.repository'
import { MultimediaFile } from '@/domains/entities/multimedia-file.entity'
import { PostMultimediaFile } from '@/domains/entities/post-multimedia-file.entity'
import { PostStatus } from '@/domains/entities/enum/value-object'

export class PostRepository extends BaseRepository<Post> {
  constructor() {
    super(Post)
  }

  async searchPost(
    search: string,
    city?: string,
    district?: string,
    ward?: string,
    interiorCondition?: string | null,
    acreage?: [number, number],
    price?: [number, number],
    cursor?: number | null,
    limit = 20
  ): Promise<Post[]> {
    console.log('search', search)
    console.log('city', city)
    console.log('district', district)
    console.log('ward', ward)
    console.log('interiorCondition', interiorCondition)
    console.log('acreage', acreage)
    console.log('price', price)
    console.log('cursor', cursor)
    console.log('limit', limit)

    const repo = this.manager.getRepository(Post)
    const qb = repo
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.multimediaFiles', 'postFile')
      .leftJoinAndSelect('postFile.file', 'file')

    // Chỉ lấy bài đã duyệt
    qb.where('post.status = :status', { status: PostStatus.APPROVED })

    // Full‑Text Search trên các cột chính
    qb.andWhere(
      `FREETEXT(
         (post.title, post.description, post.street, post.ward, post.district, post.city),
         :search
       )`,
      { search }
    )

    // Các filter bổ sung
    if (city) {
      qb.andWhere('post.city = :city', { city })
    }
    if (district) {
      qb.andWhere('post.district = :district', { district })
    }
    if (interiorCondition) {
      qb.andWhere('post.interiorCondition = :interiorCondition', { interiorCondition })
    }
    if (ward) {
      qb.andWhere('post.ward = :ward', { ward })
    }
    if (acreage) {
      qb.andWhere('post.acreage BETWEEN :minA AND :maxA', {
        minA: acreage[0],
        maxA: acreage[1]
      })
    }
    if (price) {
      qb.andWhere('post.price BETWEEN :minP AND :maxP', {
        minP: price[0],
        maxP: price[1]
      })
    }

    if (cursor) {
      qb.andWhere('post.createdAt < :cursor', { cursor })
    }

    // Giới hạn số kết quả và sắp xếp (ví dụ: mới nhất trước)
    qb.orderBy('post.createdAt', 'DESC').limit(limit)
    console.log('query', qb.getSql())
    console.log('parameters', qb.getParameters())
    const r =  await qb.getMany()
    console.log(r)
    return r
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
