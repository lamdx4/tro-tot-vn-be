import { RecommendationLog } from '../../domains/entities/recommendation-log.entity'
import { BaseRepository } from './base.repository'

export class RecommendationLogRepository extends BaseRepository<RecommendationLog> {
  constructor() {
    super(RecommendationLog)
  }

  /**
   * Create a new recommendation log
   */
  async logRecommendation(data: {
    customerId: number
    algorithm: string
    processingTimeMs: number
    dinEnabled: boolean
  }): Promise<RecommendationLog> {
    const log = this.create({
      customerId: data.customerId,
      algorithm: data.algorithm,
      processingTimeMs: data.processingTimeMs,
      dinEnabled: data.dinEnabled
    })

    return this.save(log)
  }

  /**
   * Get recommendation statistics by algorithm
   */
  async getStatsByAlgorithm(): Promise<any[]> {
    return this.createQueryBuilder('log')
      .select('log.algorithm', 'algorithm')
      .addSelect('COUNT(*)', 'count')
      .addSelect('AVG(log.processingTimeMs)', 'avgProcessingTimeMs')
      .groupBy('log.algorithm')
      .getRawMany()
  }
}

