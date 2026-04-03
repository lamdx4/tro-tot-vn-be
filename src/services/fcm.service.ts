import * as admin from 'firebase-admin'
import { ConfigService } from './config.service'

/**
 * FCMService - Infrastructure layer for Firebase Cloud Messaging
 * Only handles low-level transport and Firebase initialization
 */
export class FCMService {
  private static instance: FCMService
  private config = ConfigService.gI()

  private constructor() {
    this.initializeFirebase()
  }

  public static gI(): FCMService {
    return this.instance || (this.instance = new this())
  }

  /**
   * Initialize Firebase Admin SDK
   */
  private initializeFirebase(): void {
    try {
      const projectId = this.config.get('FIREBASE_PROJECT_ID')
      const clientEmail = this.config.get('FIREBASE_CLIENT_EMAIL')
      const privateKey = this.config.get('FIREBASE_PRIVATE_KEY').replace(/\\n/g, '\n')

      if (!admin.apps.length) {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId,
            clientEmail,
            privateKey,
          }),
        })
        console.log('[FCMService] Firebase Admin SDK initialized successfully')
      }
    } catch (error) {
      console.error('[FCMService] Failed to initialize Firebase Admin SDK:', error)
    }
  }

  /**
   * Send a multicast message to multiple tokens
   * 
   * @param tokens - Array of FCM tokens
   * @param message - FCM multicast message object
   */
  async sendMulticast(
    tokens: string[],
    message: Omit<admin.messaging.MulticastMessage, 'tokens'>
  ): Promise<admin.messaging.BatchResponse | null> {
    if (!tokens || tokens.length === 0) {
      return null
    }

    try {
      const multicastMessage: admin.messaging.MulticastMessage = {
        ...message,
        tokens,
      }

      return await admin.messaging().sendEachForMulticast(multicastMessage)
    } catch (error) {
      console.error('[FCMService] Error sending FCM notification:', error)
      return null
    }
  }

  /**
   * Extract tokens that failed due to being invalid or not registered
   */
  getInvalidTokens(tokens: string[], response: admin.messaging.BatchResponse): string[] {
    const invalidTokens: string[] = []
    response.responses.forEach((resp, index) => {
      if (!resp.success && resp.error) {
        const errorCode = resp.error.code
        if (errorCode === 'messaging/invalid-registration-token' ||
            errorCode === 'messaging/registration-token-not-registered') {
          invalidTokens.push(tokens[index])
        }
      }
    })
    return invalidTokens
  }
}
