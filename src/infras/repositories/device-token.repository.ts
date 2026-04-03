import { DeviceToken } from '@/domains/entities/device-token.entity'
import { BaseRepository } from './base.repository'

export class DeviceTokenRepository extends BaseRepository<DeviceToken> {
  constructor() {
    super(DeviceToken)
  }

  async findByCustomerId(customerId: number): Promise<DeviceToken[]> {
    return this.find({ where: { customerId } })
  }

  async findByToken(fcmToken: string): Promise<DeviceToken | null> {
    return this.findOne({ where: { fcmToken } })
  }

  async deleteByToken(fcmToken: string): Promise<void> {
    await this.delete({ fcmToken })
  }

  async upsertToken(customerId: number, fcmToken: string, platform?: string): Promise<DeviceToken> {
    const existing = await this.findByToken(fcmToken)
    
    if (existing) {
      existing.customerId = customerId
      existing.platform = platform || existing.platform
      existing.lastUsedAt = new Date()
      return this.save(existing)
    }

    const newToken = this.create({
      customerId,
      fcmToken,
      platform,
    })
    return this.save(newToken)
  }
}
