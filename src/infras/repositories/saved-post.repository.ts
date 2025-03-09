import { SavedPost } from '@/domains/entities/saved-post.entity'
import { BaseRepository } from './base.repository'

export class SavedPostRepository extends BaseRepository<SavedPost> {
  constructor() {
    super(SavedPost)
  }
}