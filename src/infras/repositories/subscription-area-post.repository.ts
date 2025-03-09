import { SubscriptionAreaPost } from '@/domains/entities/subscription-area-post.entity'
import { BaseRepository } from './base.repository'

export class SubscriptionAreaPostRepository extends BaseRepository<SubscriptionAreaPost> {
  constructor() {
    super(SubscriptionAreaPost)
  }
}