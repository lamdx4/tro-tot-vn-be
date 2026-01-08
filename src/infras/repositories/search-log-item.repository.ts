import { SearchLogItem } from '../../domains/entities/search-log-item.entity'
import { BaseRepository } from './base.repository'

export class SearchLogItemRepository extends BaseRepository<SearchLogItem> {
  constructor() {
    super(SearchLogItem)
  }

  /**
   * Bulk log search result items
   */
  async logSearchItems(data: Array<{
    searchLogId: number
    postId: number | null
    position: number
    relevanceScore?: number | null
    capturedTitle: string
    capturedDescription: string
    capturedPrice: number
    capturedAcreage: number
    capturedCity: string
    capturedDistrict: string
  }>): Promise<SearchLogItem[]> {
    const items = data.map(item => this.create({
      searchLogId: item.searchLogId,
      postId: item.postId,
      position: item.position,
      relevanceScore: item.relevanceScore || null,
      capturedTitle: item.capturedTitle,
      capturedDescription: item.capturedDescription,
      capturedPrice: item.capturedPrice,
      capturedAcreage: item.capturedAcreage,
      capturedCity: item.capturedCity,
      capturedDistrict: item.capturedDistrict
    }))

    return this.save(items)
  }
}

