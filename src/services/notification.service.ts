import { FCMService } from './fcm.service'
import { DeviceTokenRepository } from '@/infras/repositories'
import { redisClient } from '@/infras/redis/redis'

/**
 * NotificationService - Application layer for user notifications
 * Coordinates between Socket presence, Database tokens, and FCM transport
 */
export class NotificationService {
  private static instance: NotificationService
  private fcmService = FCMService.gI()
  private deviceTokenRepo = new DeviceTokenRepository()

  private constructor() {}

  public static gI(): NotificationService {
    return this.instance || (this.instance = new this())
  }

  /**
   * Check which tokens for a user are NOT active via Sockets in Redis
   * 
   * @param userId - Peer user ID (recipient)
   * @param tokens - All registered tokens for the user
   */
  private async filterOfflineTokens(userId: string, tokens: string[]): Promise<string[]> {
    // Redis key: user:device:socket:userId
    const activeMapping = await redisClient.hgetall(`user:device:socket:${userId}`)
    
    if (!activeMapping) {
      return tokens // All tokens are offline
    }

    const activeTokens = Object.keys(activeMapping)
    return tokens.filter(token => !activeTokens.includes(token))
  }

  /**
   * Send notification to offline devices of a user
   */
  async notifyUser(
    userId: string | number,
    payload: {
      notification?: { title: string; body: string };
      data?: Record<string, string>;
      priority?: 'high' | 'normal';
      ttl?: number;
      androidTag?: string;
    }
  ): Promise<void> {
    const strUserId = String(userId)
    
    // 1. Get all registered tokens for user
    const dbTokens = await this.deviceTokenRepo.findByCustomerId(Number(userId))
    console.log(`[NotificationService] Found ${dbTokens.length} tokens in DB for user ${userId}`)
    if (dbTokens.length === 0) return

    const allTokens = dbTokens.map(t => t.fcmToken)

    // 2. Filter out tokens that have active Socket connections (Using Device-level mapping)
    const offlineTokens = await this.filterOfflineTokens(strUserId, allTokens)
    console.log(`[NotificationService] USER ${userId} CONNECTION PROFILE:`)
    console.log(`  - Total Tokens in DB: ${allTokens.length}`)
    console.log(`  - Target Offline Tokens to Send: ${offlineTokens.length}`)
    
    // Debugging active Socket.IO connections in Redis
    const { redisClient } = await import('@/infras/redis/redis')
    const deviceSockets = await redisClient.hgetall(`user:device:socket:${userId}`).catch(() => ({}))
    const generalSocket = await redisClient.get(`user:socket:${userId}`).catch(() => null)
    console.log(`  - Active Socket Device Hashes:`, deviceSockets)
    console.log(`  - Active General Socket ID:`, generalSocket)
    
    if (offlineTokens.length === 0) {
      console.log(`[NotificationService] User ${userId} is considered fully ONLINE. Skipping FCM.`)
      return
    }

    // 3. Prepare FCM message
    // Firebase data payload MUST be Record<string, string>
    const stringData: Record<string, string> = {}
    if (payload.data) {
      Object.entries(payload.data).forEach(([key, value]) => {
        if (value instanceof Date) {
          stringData[key] = value.toISOString()
        } else if (key === 'createdAt' || key === 'updatedAt') {
          // Ép kiểu các trường ngày tháng chủ động (đề phòng chuỗi thô từ Raw SQL hoặc DTO)
          const parsedDate = new Date(value as any)
          if (!isNaN(parsedDate.getTime())) {
            stringData[key] = parsedDate.toISOString()
          } else {
            stringData[key] = String(value)
          }
        } else {
          stringData[key] = String(value)
        }
      })
    }

    const message: any = {
      data: stringData,
      android: {
        priority: payload.priority || 'normal',
      },
      apns: {
        payload: {
          aps: {
            'content-available': 1,
            sound: 'default',
          }
        }
      }
    }

    if (payload.notification) {
      message.notification = payload.notification
    }

    if (payload.ttl) {
      message.android.ttl = payload.ttl * 1000
    }

    if (payload.androidTag) {
      message.android.notification = {
        tag: payload.androidTag,
        channelId: 'chat_channel', // Mandatory for Android 8.0+
        clickAction: 'OPEN_CHAT_ACTIVITY' // Generic action name
      }
    }

    // 4. Send via FCMService
    console.log(`[NotificationService] 🚀 Dispatching FCM Multicast to ${offlineTokens.length} tokens...`)
    console.log(`  - Payload data:`, JSON.stringify(stringData, null, 2))
    const response = await this.fcmService.sendMulticast(offlineTokens, message)

    if (response) {
      console.log(`[NotificationService] 🟢 FCM Dispatch Completed: Success=${response.successCount}, Failure=${response.failureCount}`)
      if (response.failureCount > 0) {
        console.log(`[NotificationService] ⚠️ Detailed Failure Responses:`, JSON.stringify(response.responses.filter(r => !r.success), null, 2))
      }
    } else {
      console.error(`[NotificationService] 🔴 FCM Dispatch Error: No response received from FCMService`)
    }

    // 5. Cleanup stale tokens if any
    if (response && response.failureCount > 0) {
      const invalidTokens = this.fcmService.getInvalidTokens(offlineTokens, response)
      console.log(`[NotificationService] 🧹 Stale token cleanup started. Found ${invalidTokens.length} expired tokens.`)
      for (const token of invalidTokens) {
        await this.deviceTokenRepo.deleteByToken(token)
          .then(() => console.log(`  - Deleted expired token: "${token.substring(0, 20)}..."`))
          .catch(err => console.error(`  - Failed to delete expired token:`, err))
      }
    }
  }

  async notifyChatMessage(recipientId: number, data: any): Promise<void> {
    console.log(`\n[NotificationService] 💬 Incoming Chat Notification Request:`)
    console.log(`  - Recipient ID: ${recipientId}`)
    console.log(`  - Sender Name: "${data.senderName}"`)
    console.log(`  - Message Content: "${data.content ? data.content.substring(0, 30) : ''}${data.content && data.content.length > 30 ? '...' : ''}"`)
    console.log(`  - Message ID: ${data.messageId}`)
    
    await this.notifyUser(recipientId, {
      data: {
        type: 'chat',
        ...data,
      },
      priority: 'high',
    })
  }

  /**
   * Specific helper for Video Call Request
   */
  async notifyCallRequest(calleeId: string | number, data: any): Promise<void> {
    await this.notifyUser(calleeId, {
      data: {
        type: 'VIDEO_CALL_REQUEST',
        ...data,
      },
      priority: 'high',
      ttl: 30, // Call signaling is short-lived
    })
  }

  /**
   * Specific helper for Call Cancellation
   */
  async notifyCallCancelled(recipientId: string | number, roomId: string): Promise<void> {
    await this.notifyUser(recipientId, {
      data: {
        type: 'VIDEO_CALL_CANCELLED',
        roomId: roomId,
      },
      priority: 'high',
      ttl: 60,
    })
  }
}
