import { ConfigService } from './config.service'

export interface ModerationResult {
  label: 'valid' | 'invalid'
  prob_invalid: number
  threshold: number
  latency_ms: number
}

export default class ModerationService {
  private static instance: ModerationService
  private configService: ConfigService
  private serviceUrl: string

  private constructor() {
    this.configService = ConfigService.gI()
    this.serviceUrl = this.configService.getOrThrow('MODERATION_SERVICE_URL')
  }

  public static gI(): ModerationService {
    return this.instance || (this.instance = new this())
  }

  async checkContent(text: string, threshold: number = 0.5): Promise<ModerationResult> {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10s timeout

      const response = await fetch(`${this.serviceUrl}/moderate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text, threshold }),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`Moderation service error: ${response.status}`)
      }

      const result = await response.json()
      return result as ModerationResult
    } catch (error) {
      console.error('Moderation service error:', error)
      // Fallback: nếu service lỗi, cho qua để admin review thủ công
      return {
        label: 'valid',
        prob_invalid: 0,
        threshold: threshold,
        latency_ms: 0
      }
    }
  }
}

