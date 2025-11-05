import { RecommendationLogItem } from '../../domains/entities/recommendation-log-item.entity'
import { BaseRepository } from './base.repository'

export class RecommendationLogItemRepository extends BaseRepository<RecommendationLogItem> {
  constructor() {
    super(RecommendationLogItem)
  }

  /**
   * Bulk create recommendation log items
   */
  async logItems(items: Array<{
    recommendationLogId: number
    postId: number | null
    position: number
    capturedTitle: string
    capturedDescription: string
    capturedPrice: number
    capturedAcreage: number
    capturedCity: string
    capturedDistrict: string
    score: number
    reason: string | null
    explanation: string | null
  }>): Promise<RecommendationLogItem[]> {
    const entities = items.map(item => this.create(item))
    return this.save(entities)
  }
}

