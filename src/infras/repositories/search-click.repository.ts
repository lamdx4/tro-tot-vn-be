import { SearchClick } from '../../domains/entities/search-click.entity'
import { BaseRepository } from './base.repository'

export class SearchClickRepository extends BaseRepository<SearchClick> {
  constructor() {
    super(SearchClick)
  }

  async logClick(data: {
    searchLogId: number
    searchLogItemId: number
  }): Promise<SearchClick> {
    console.log('[SearchClickRepository] Creating click:', data)

    const click = this.create({
      searchLogId: data.searchLogId,
      searchLogItemId: data.searchLogItemId
    })

    const saved = await this.save(click)
    console.log(`[SearchClickRepository] Saved click ${saved.clickId}`)

    return saved
  }

  /**
   * Calculate search CTR (Click-Through Rate)
   */
  async getSearchCTR(): Promise<any> {
    const result = await this.manager.query(`
      SELECT 
        COUNT(DISTINCT sl.logId) as totalSearches,
        COUNT(sc.clickId) as totalClicks,
        CAST(COUNT(sc.clickId) AS FLOAT) / NULLIF(COUNT(DISTINCT sl.logId), 0) as ctr
      FROM SearchLog sl
      LEFT JOIN SearchClick sc ON sl.logId = sc.searchLogId
    `)

    return result[0]
  }

  /**
   * Get CTR by position (position bias analysis)
   */
  async getCTRByPosition(): Promise<any[]> {
    return this.manager.query(`
      SELECT 
        sli.position,
        COUNT(sli.itemId) as impressions,
        COUNT(sc.clickId) as clicks,
        CAST(COUNT(sc.clickId) AS FLOAT) / NULLIF(COUNT(sli.itemId), 0) as ctr
      FROM SearchLogItem sli
      LEFT JOIN SearchClick sc ON sli.itemId = sc.searchLogItemId
      GROUP BY sli.position
      ORDER BY sli.position
    `)
  }
}

