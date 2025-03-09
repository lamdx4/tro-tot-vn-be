import { PostModerationHistory } from '@/domains/entities/post-moderator-history.entity'
import { BaseRepository } from './base.repository'

export class PostModerationHistoryRepository extends BaseRepository<PostModerationHistory> {
  constructor() {
    super(PostModerationHistory)
  }
}