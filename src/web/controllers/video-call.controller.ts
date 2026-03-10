import { Request, Response, NextFunction } from 'express'
import { IceServersResponse } from '@/utils/types/webrtc-signaling'
import { env } from '@/preload-env'

class VideoCallController {
  /**
   * Get ICE server configuration for WebRTC
   * Public endpoint - no authentication required
   */
  async getIceConfig(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const iceServers = this.buildIceServers()

      const response: IceServersResponse = { iceServers }
      res.status(200).json({
        success: true,
        data: response
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Build ICE servers configuration from environment variables
   */
  private buildIceServers() {
    const iceServers: { urls: string; username?: string; credential?: string }[] = []

    // Add STUN servers from config
    if (env.STUN_SERVER_URLS) {
      const stunUrls = env.STUN_SERVER_URLS.split(',')
      for (const url of stunUrls) {
        const trimmed = url.trim()
        if (trimmed) {
          iceServers.push({ urls: trimmed })
        }
      }
    }

    // Add TURN server if configured
    if (env.TURN_SERVER_IP && env.TURN_USERNAME && env.TURN_CREDENTIAL) {
      const turnUrls = [
        `turn:${env.TURN_SERVER_IP}:${env.TURN_SERVER_PORT}?transport=udp`,
        `turn:${env.TURN_SERVER_IP}:${env.TURN_SERVER_PORT}?transport=tcp`,
        `turn:${env.TURN_SERVER_IP}:${env.TURN_SERVER_TLS_PORT}?transport=tcp`
      ]

      for (const url of turnUrls) {
        iceServers.push({
          urls: url,
          username: env.TURN_USERNAME,
          credential: env.TURN_CREDENTIAL
        })
      }

      // Also add STUN for this server
      iceServers.push({
        urls: `stun:${env.TURN_SERVER_IP}:${env.TURN_SERVER_PORT}`
      })
    }

    return iceServers
  }
}

// Create and export controller instance
export default new VideoCallController()

