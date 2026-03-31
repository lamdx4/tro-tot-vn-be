import { Request, Response, NextFunction } from 'express'
import ResponseData from '@/utils/data-types/response'
import { ConfigService } from '@/services/config.service'

class VideoCallController {

  private config = ConfigService.gI()
  /**
   * Get ICE server configuration for WebRTC
   * Public endpoint - no authentication required
   */
  async getIceConfig(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const iceServers = this.buildIceServers()
      res.status(200).json(ResponseData.success({ iceServers }))
    } catch (error) {
      next(error)
    }
  }

  /**
   * Build ICE servers configuration from environment variables
   */
  private buildIceServers() {
    const iceServers: { urls: string; username?: string; credential?: string }[] = [];

    // 1. Xử lý STUN Servers
    const rawStunUrls = this.config.get("STUN_SERVER_URLS");
    if (rawStunUrls) {
      const stunServers = rawStunUrls
        .split(',')
        .map(url => url.trim())
        .filter(url => url.length > 0)
        .map(url => ({ urls: url }));
      
      iceServers.push(...stunServers);
    }

    // 2. Xử lý TURN Servers
    const turnIp = this.config.get("TURN_SERVER_IP");
    const turnUser = this.config.get("TURN_USERNAME");
    const turnCred = this.config.get("TURN_CREDENTIAL");

    if (turnIp && turnUser && turnCred) {
      const port = this.config.get("TURN_SERVER_PORT");
      const tlsPort = this.config.get("TURN_SERVER_TLS_PORT");

      const turnUrls = [
        `turn:${turnIp}:${port}?transport=udp`,
        `turn:${turnIp}:${port}?transport=tcp`,
        `turn:${turnIp}:${tlsPort}?transport=tcp`
      ];

      for (const url of turnUrls) {
        iceServers.push({
          urls: url,
          username: turnUser,
          credential: turnCred
        });
      }

      // STUN đi kèm TURN
      iceServers.push({ urls: `stun:${turnIp}:${port}` });
    }

    return iceServers;
  }
}

// Create and export controller instance
export default new VideoCallController()
