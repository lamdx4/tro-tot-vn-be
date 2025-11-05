import { SearchLogItem } from '../../domains/entities/search-log-item.entity'
import { BaseRepository } from './base.repository'

export class SearchLogItemRepository extends BaseRepository<SearchLogItem> {
  constructor() {
    super(SearchLogItem)
  }

  /**
   * Bulk create search log items
   */
  async logItems(items: Array<{
    searchLogId: number
    postId: number | null
    position: number
    capturedTitle: string
    capturedDescription: string
    capturedPrice: number
    capturedAcreage: number
    capturedCity: string
    capturedDistrict: string
  }>): Promise<SearchLogItem[]> {
    const entities = items.map(item => this.create(item))
    return this.save(entities)
  }
}

