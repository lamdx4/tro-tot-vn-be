import { SubscriptionAreaPost } from '@/domains/entities/subscription-area-post.entity'
import { DataSource, Repository } from 'typeorm'

export class SubscriptionAreaPostRepository extends Repository<SubscriptionAreaPost> {
  constructor(private datasource: DataSource) {
    super(SubscriptionAreaPost, datasource.manager)
  }
}