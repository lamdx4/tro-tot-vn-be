import { ModerationLog } from '../../domains/entities/moderation-log.entity'
import { BaseRepository } from './base.repository'

export class ModerationLogRepository extends BaseRepository<ModerationLog> {
  constructor() {
    super(ModerationLog)
  }

  /**
   * Log AI auto-rejection
   */
  async logAIReject(data: {
    title: string
    description: string
    aiScore: number
    aiThreshold: number
  }): Promise<ModerationLog> {
    const log = this.create({
      capturedTitle: data.title,
      capturedDescription: data.description,
      aiScore: data.aiScore,
      aiThreshold: data.aiThreshold,
      moderationType: 'AI_REJECT'
    })

    return this.save(log)
  }

  /**
   * Log admin rejection (hate content)
   */
  async logAdminReject(data: {
    title: string
    description: string
    aiScore: number
    aiThreshold: number
  }): Promise<ModerationLog> {
    const log = this.create({
      capturedTitle: data.title,
      capturedDescription: data.description,
      aiScore: data.aiScore,
      aiThreshold: data.aiThreshold,
      moderationType: 'ADMIN_REJECT'
    })

    return this.save(log)
  }

  /**
   * Get all moderation logs for export (training data)
   */
  async getTrainingData(limit: number = 1000): Promise<ModerationLog[]> {
    return this.find({
      order: { moderatedAt: 'DESC' },
      take: limit
    })
  }

  /**
   * Get statistics by type
   */
  async getStatsByType(): Promise<any> {
    return this.createQueryBuilder('log')
      .select('log.moderationType', 'type')
      .addSelect('COUNT(*)', 'count')
      .addSelect('AVG(log.aiScore)', 'avgScore')
      .groupBy('log.moderationType')
      .getRawMany()
  }
}

