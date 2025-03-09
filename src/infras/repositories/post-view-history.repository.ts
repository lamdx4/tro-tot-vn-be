import { PostViewHistory } from '@/domains/entities/post-view-history.entity'
import { BaseRepository } from './base.repository'

export class PostViewHistoryRepository extends BaseRepository<PostViewHistory> {
  constructor() {
    super(PostViewHistory)
  }
}