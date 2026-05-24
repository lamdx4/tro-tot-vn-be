import * as admin from 'firebase-admin'
import { ConfigService } from './config.service'
import * as path from 'path'
import * as fs from 'fs'

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
    if (admin.apps.length) return

    try {
      const jsonPath = this.config.get('FIREBASE_SERVICE_ACCOUNT_PATH')
      if (!jsonPath) {
        console.error('[FCM] FIREBASE_SERVICE_ACCOUNT_PATH is not configured in environment variables')
        return
      }

      // Xác định đường dẫn tuyệt đối
      let absolutePath = path.isAbsolute(jsonPath) ? jsonPath : null

      if (!absolutePath) {
        // Thử tìm tương đối so với process.cwd()
        const path1 = path.resolve(process.cwd(), jsonPath)
        if (fs.existsSync(path1)) {
          absolutePath = path1
        } else {
          // Thử tìm tương đối so với thư mục chứa code hiện tại (__dirname là src/services/ nên lùi 2 cấp về root)
          const path2 = path.resolve(__dirname, '../../', jsonPath)
          if (fs.existsSync(path2)) {
            absolutePath = path2
          }
        }
      }

      if (absolutePath && fs.existsSync(absolutePath)) {
        admin.initializeApp({
          credential: admin.credential.cert(absolutePath),
        })
        console.log(`[FCM] Initialized successfully using JSON file at: ${absolutePath}`)
      } else {
        console.error(`[FCM] Service account file not found. Configured path was: "${jsonPath}". Searched locations: [${path.resolve(process.cwd(), jsonPath)}] and [${path.resolve(__dirname, '../../', jsonPath)}]`)
      }
    } catch (error) {
      console.error('[FCMService] Initialization failed:', error)
    }
  }

  /**
   * Send a multicast message to multiple tokens
   */
  async sendMulticast(
    tokens: string[],
    message: Omit<admin.messaging.MulticastMessage, 'tokens'>
  ): Promise<admin.messaging.BatchResponse | null> {
    if (!tokens || tokens.length === 0) return null

    try {
      const multicastMessage: admin.messaging.MulticastMessage = {
        ...message,
        tokens,
      }

      // FCM v1 API - Send messages to multiple devices
      return await admin.messaging().sendEachForMulticast(multicastMessage)
    } catch (error) {
      console.error('[FCMService] Error sending multicast notification:', error)
      return null
    }
  }

  /**
   * Extract invalid tokens from response
   */
  getInvalidTokens(tokens: string[], response: admin.messaging.BatchResponse): string[] {
    const invalidTokens: string[] = []
    response.responses.forEach((resp, index) => {
      if (!resp.success && resp.error) {
        const errorCode = resp.error.code
        if (errorCode === 'messaging/invalid-registration-token' ||
            errorCode === 'messaging/registration-token-not-registered' ||
            errorCode === 'messaging/invalid-argument') {
          invalidTokens.push(tokens[index])
        }
      }
    })
    return invalidTokens
  }
}
