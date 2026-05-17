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
    console.log(`[FCM-Debug] Starting initializeFirebase. admin.apps.length: ${admin.apps.length}`)
    if (admin.apps.length) return

    try {
      // 1. Ưu tiên load từ file JSON nếu được cấu hình
      const jsonPath = this.config.get('FIREBASE_SERVICE_ACCOUNT_PATH')
      const absolutePath = jsonPath ? path.resolve(process.cwd(), jsonPath) : null

      console.log(`[FCM-Debug] FIREBASE_SERVICE_ACCOUNT_PATH from config: "${jsonPath}"`)
      console.log(`[FCM-Debug] process.cwd(): "${process.cwd()}"`)
      console.log(`[FCM-Debug] Resolved absolutePath: "${absolutePath}"`)
      
      const fileExists = absolutePath ? fs.existsSync(absolutePath) : false
      console.log(`[FCM-Debug] File exists at absolutePath: ${fileExists}`)

      if (absolutePath && fileExists) {
        console.log(`[FCM-Debug] Attempting to initialize Firebase Admin using JSON file...`)
        admin.initializeApp({
          credential: admin.credential.cert(absolutePath),
        })
        console.log(`[FCM] Initialized successfully using JSON file at: ${absolutePath}`)
        return
      }

      console.log(`[FCM-Debug] JSON file method skipped or file not found. Falling back to individual ENV variables...`)

      // 2. Fallback: Load từ các biến ENV cá lẻ
      const projectId = this.config.get('FIREBASE_PROJECT_ID')
      const clientEmail = this.config.get('FIREBASE_CLIENT_EMAIL')
      let privateKey = this.config.get('FIREBASE_PRIVATE_KEY')

      console.log(`[FCM-Debug] Fallback Env check: projectId="${projectId}", clientEmail="${clientEmail}", hasPrivateKey=${!!privateKey}`)

      if (projectId && clientEmail && privateKey) {
        // Làm sạch Private Key (Xử lý lỗi JWT Signature)
        privateKey = privateKey.replace(/\\n/g, '\n')
        if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
          privateKey = privateKey.substring(1, privateKey.length - 1)
        }

        console.log(`[FCM-Debug] Attempting to initialize Firebase Admin using individual ENV variables...`)
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId,
            clientEmail,
            privateKey,
          }),
        })
        console.log('[FCM] Initialized successfully using individual ENV variables')
      } else {
        console.warn('[FCM] Skipping initialization: No Firebase credentials provided (neither valid JSON path nor complete individual ENV variables exist)')
      }
    } catch (error) {
      console.error('[FCMService] Initialization failed with error:', error)
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
            errorCode === 'messaging/registration-token-not-registered') {
          invalidTokens.push(tokens[index])
        }
      }
    })
    return invalidTokens
  }
}
