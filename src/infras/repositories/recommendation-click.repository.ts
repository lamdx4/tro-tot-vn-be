import { RecommendationClick } from '../../domains/entities/recommendation-click.entity'
import { BaseRepository } from './base.repository'

export class RecommendationClickRepository extends BaseRepository<RecommendationClick> {
  constructor() {
    super(RecommendationClick)
  }

  /**
   * Log a recommendation click
   */
  async logClick(data: {
    recommendationLogId: number
    recommendationLogItemId: number
  }): Promise<RecommendationClick> {
    const click = this.create({
      recommendationLogId: data.recommendationLogId,
      recommendationLogItemId: data.recommendationLogItemId
    })

    return this.save(click)
  }

  /**
   * Calculate recommendation CTR
   */
  async getRecommendationCTR(): Promise<any> {
    const result = await this.manager.query(`
      SELECT 
        COUNT(DISTINCT rl.logId) as totalRecommendations,
        COUNT(rc.clickId) as totalClicks,
        CAST(COUNT(rc.clickId) AS FLOAT) / NULLIF(COUNT(DISTINCT rl.logId), 0) as ctr
      FROM RecommendationLog rl
      LEFT JOIN RecommendationClick rc ON rl.logId = rc.recommendationLogId
    `)
    
    return result[0]
  }

  /**
   * Get CTR by algorithm
   */
  async getCTRByAlgorithm(): Promise<any[]> {
    return this.manager.query(`
      SELECT 
        rl.algorithm,
        COUNT(DISTINCT rl.logId) as impressions,
        COUNT(rc.clickId) as clicks,
        CAST(COUNT(rc.clickId) AS FLOAT) / NULLIF(COUNT(DISTINCT rl.logId), 0) as ctr
      FROM RecommendationLog rl
      LEFT JOIN RecommendationLogItem rli ON rl.logId = rli.recommendationLogId
      LEFT JOIN RecommendationClick rc ON rli.itemId = rc.recommendationLogItemId
      GROUP BY rl.algorithm
      ORDER BY ctr DESC
    `)
  }

  /**
   * Get CTR by position
   */
  async getCTRByPosition(): Promise<any[]> {
    return this.manager.query(`
      SELECT 
        rli.position,
        COUNT(rli.itemId) as impressions,
        COUNT(rc.clickId) as clicks,
        CAST(COUNT(rc.clickId) AS FLOAT) / NULLIF(COUNT(rli.itemId), 0) as ctr
      FROM RecommendationLogItem rli
      LEFT JOIN RecommendationClick rc ON rli.itemId = rc.recommendationLogItemId
      GROUP BY rli.position
      ORDER BY rli.position
    `)
  }
}

