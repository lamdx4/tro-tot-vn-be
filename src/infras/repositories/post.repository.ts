import { Post } from '@/domains/entities/post.entity'
import { BaseRepository } from './base.repository'

export class PostRepository extends BaseRepository<Post> {
  constructor() {
    super(Post)
  }
}