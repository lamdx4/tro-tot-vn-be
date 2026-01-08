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
    console.log(`[RecommendationLogItemRepository] Logging ${items.length} items`)
    console.log(`[RecommendationLogItemRepository] Sample item:`, items[0])

    const entities = items.map(item => this.create(item))
    console.log(`[RecommendationLogItemRepository] Created ${entities.length} entities`)

    const saved = await this.save(entities)
    console.log(`[RecommendationLogItemRepository] Saved ${saved.length} items, first itemId: ${saved[0]?.itemId}`)

    return saved
  }
}

