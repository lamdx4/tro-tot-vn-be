import { PostModerationHistory } from '@/domains/entities/post-moderator-history.entity'
import { BaseRepository } from './base.repository'
import { PostStatus } from '@/domains/entities/enum/value-object'
import { Post } from '@/domains/entities/post.entity'

export class PostModerationHistoryRepository extends BaseRepository<PostModerationHistory> {


  constructor() {
    super(PostModerationHistory)
  }

  async moderatePost(reviewerId: number, postId: number, actionType: string, reason: string) {
    try {
      return this.manager.transaction(async (transactionalEntityManager) => {
        console.log('moderatePost', reviewerId, postId, actionType, reason)
        const postRepository = transactionalEntityManager.getRepository(Post)
        await postRepository.save(
          {
            postId: postId,
            status: actionType
          },
        )
        
        const postModerateHistoryRepository = transactionalEntityManager.getRepository(PostModerationHistory)
        const postModerateHistory = await postModerateHistoryRepository.create()
        postModerateHistory.postId = postId
        postModerateHistory.adminId = reviewerId
        postModerateHistory.actionType = actionType
        postModerateHistory.reason = reason
        postModerateHistory.execAt = new Date()

        await postModerateHistoryRepository.save(postModerateHistory)
        return true
      })
    }
    catch (error) {
      console.error('Error in moderatePost:', error)
      return false
    }
  }
}