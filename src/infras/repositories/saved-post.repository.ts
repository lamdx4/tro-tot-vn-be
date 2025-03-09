import { SavedPost } from '@/domains/entities/saved-post.entity'
import { DataSource, Repository } from 'typeorm'

export class SavedPostRepository extends Repository<SavedPost> {
  constructor(private datasource: DataSource) {
    super(SavedPost, datasource.manager)
  }
}