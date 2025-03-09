import { PostModerationHistory } from '@/domains/entities/post-moderator-history.entity'
import { DataSource, Repository } from 'typeorm'

export class PostModerationHistoryRepository extends Repository<PostModerationHistory> {
  constructor(private datasource: DataSource) {
    super(PostModerationHistory, datasource.manager)
  }
}