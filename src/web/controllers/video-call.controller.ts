import { 
  Get, 
  Route, 
  Tags, 
  Controller,
  Response
} from '@tsoa/runtime'
import ResponseData from '@/utils/data-types/response'
import { ConfigService } from '@/services/config.service'
import { redisClient } from '@/infras/redis/redis'
import { IceConfigResponse, IceServer } from './dto/videocall.dto'

@Route("video-call")
@Tags("VideoCall")
export class VideoCallController extends Controller {
  private config = ConfigService.gI()

  constructor() {
    super()
  }

  /**
   * Get ICE server configuration for WebRTC.
   * This is used by the frontend to establish peer-to-peer connections.
   */
  @Get("ice-config")
  @Response<ResponseData<any>>(500, "Internal Server Error")
  public async getIceConfig(): Promise<ResponseData<IceConfigResponse>> {
    try {
      const iceServers = await this.buildIceServers()
      return ResponseData.success({ iceServers })
    } catch (error: any) {
      this.setStatus(500)
      return ResponseData.error(500, 'INTERNAL_SERVER_ERROR', error.message) as any
    }
  }

  /**
   * Build ICE servers configuration from environment variables
   */
  private async buildIceServers(): Promise<IceServer[]> {
    const iceServers: IceServer[] = [];

    // 1. Process STUN Servers
    const rawStunUrls = this.config.get("STUN_SERVER_URLS");
    if (rawStunUrls) {
      const stunServers = rawStunUrls
        .split(',')
        .map(url => url.trim())
        .filter(url => url.length > 0)
        .map(url => ({ urls: url }));
      
      iceServers.push(...stunServers);
    }

    // 2. Process TURN Servers
    // Try to get TURN IP from Config first, then fallback to Redis
    let turnIp = this.config.get("TURN_SERVER_IP");
    if (!turnIp) {
      turnIp = (await redisClient.get('coturn:ip')) || ''
    }

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

      // STUN included with TURN
      iceServers.push({ urls: `stun:${turnIp}:${port}` });
    }

    return iceServers;
  }
}
