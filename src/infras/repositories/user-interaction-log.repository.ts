import { UserInteractionLog } from '../../domains/entities/user-interaction-log.entity'
import { BaseRepository } from './base.repository'

export class UserInteractionLogRepository extends BaseRepository<UserInteractionLog> {
  constructor() {
    super(UserInteractionLog)
  }

  /**
   * Get recent interactions for a customer
   */
  async findRecentByCustomer(customerId: number, limit: number = 200): Promise<UserInteractionLog[]> {
    return this.find({
      where: { customerId },
      order: { createdAt: 'DESC' },
      take: limit
    })
  }

  /**
   * Get interactions by type for a customer
   */
  async findByCustomerAndType(
    customerId: number, 
    typeAction: 1 | 2 | 3, 
    limit?: number
  ): Promise<UserInteractionLog[]> {
    return this.find({
      where: { customerId, typeAction },
      order: { createdAt: 'DESC' },
      take: limit
    })
  }
}

