import { PostViewHistory } from '@/domains/entities/post-view-history.entity'
import { DataSource, Repository } from 'typeorm'

export class PostViewHistoryRepository extends Repository<PostViewHistory> {
  constructor(private datasource: DataSource) {
    super(PostViewHistory, datasource.manager)
  }
}