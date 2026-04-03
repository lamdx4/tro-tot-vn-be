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
    if (dbTokens.length === 0) return

    const allTokens = dbTokens.map(t => t.fcmToken)

    // 2. Filter out tokens that have active Socket connections (Using Device-level mapping)
    const offlineTokens = await this.filterOfflineTokens(strUserId, allTokens)
    if (offlineTokens.length === 0) return

    // 3. Prepare FCM message
    const message: any = {
      data: payload.data,
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
        clickAction: 'FLUTTER_NOTIFICATION_CLICK'
      }
    }

    // 4. Send via FCMService
    const response = await this.fcmService.sendMulticast(offlineTokens, message)

    // 5. Cleanup stale tokens if any
    if (response && response.failureCount > 0) {
      const invalidTokens = this.fcmService.getInvalidTokens(offlineTokens, response)
      for (const token of invalidTokens) {
        await this.deviceTokenRepo.deleteByToken(token).catch(console.error)
      }
    }
  }

  /**
   * Specific helper for Chat Message
   */
  async notifyChatMessage(recipientId: number, data: any): Promise<void> {
    await this.notifyUser(recipientId, {
      notification: {
        title: 'Bạn có tin nhắn mới',
        body: `${data.senderName}: ${data.content}`,
      },
      data: {
        type: 'CHAT_MESSAGE',
        ...data,
      },
      androidTag: `chat_${data.conversationId}`,
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
