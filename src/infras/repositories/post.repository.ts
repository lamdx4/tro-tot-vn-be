import { Post } from '@/domains/entities/post.entity'
import { DataSource, Repository } from 'typeorm'

export class PostRepository extends Repository<Post> {
  constructor(private datasource: DataSource) {
    super(Post, datasource.manager)
  }
}