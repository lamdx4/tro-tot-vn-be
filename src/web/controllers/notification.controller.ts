import {
  Body,
  Get,
  Post,
  Put,
  Route,
  Security,
  Middlewares,
  Response,
  SuccessResponse,
  Tags,
  Request,
  Controller,
} from '@tsoa/runtime'
import { DeviceTokenRepository } from '@/infras/repositories'
import ResponseData from '@/utils/data-types/response'

interface TokenRequest {
  fcmToken: string
  platform: 'android' | 'ios' | 'web'
}

interface UnregisterTokenRequest {
  fcmToken: string
}

@Route("notifications")
@Tags("Notifications")
@Security("jwt")
export class NotificationController extends Controller {
  private deviceTokenRepo: DeviceTokenRepository

  constructor() {
    super()
    this.deviceTokenRepo = new DeviceTokenRepository()
  }

  /**
   * Register or update an FCM token for the current user
   */
  @Post("tokens")
  @SuccessResponse("200", "Token registered successfully")
  public async registerToken(
    @Body() body: TokenRequest,
    @Request() req: any
  ): Promise<ResponseData<any>> {
    try {
      const customerId = req.user?.customer?.customerId || req.user?.customerId
      const { fcmToken, platform } = body

      if (!fcmToken) {
        this.setStatus(400)
        return ResponseData.error(400, 'BAD_REQUEST', 'FCM token is required') as any
      }

      const token = await this.deviceTokenRepo.upsertToken(customerId, fcmToken, platform)

      return new ResponseData(200, 'Token registered successfully', [], token)
    } catch (error: any) {
      this.setStatus(500)
      return ResponseData.error(500, 'INTERNAL_SERVER_ERROR', error.message) as any
    }
  }

  /**
   * Unregister an FCM token (e.g., on logout)
   */
  @Post("tokens/unregister")
  @SuccessResponse("200", "Token unregistered successfully")
  public async unregisterToken(
    @Body() body: UnregisterTokenRequest
  ): Promise<ResponseData<any>> {
    try {
      const { fcmToken } = body

      if (!fcmToken) {
        this.setStatus(400)
        return ResponseData.error(400, 'BAD_REQUEST', 'FCM token is required') as any
      }

      await this.deviceTokenRepo.deleteByToken(fcmToken)

      return new ResponseData(200, 'Token unregistered successfully', [], null)
    } catch (error: any) {
      this.setStatus(500)
      return ResponseData.error(500, 'INTERNAL_SERVER_ERROR', error.message) as any
    }
  }

  /**
   * Get all registered tokens for the current user
   */
  @Get("tokens")
  @SuccessResponse("200", "Tokens retrieved successfully")
  public async getMyTokens(
    @Request() req: any
  ): Promise<ResponseData<any>> {
    try {
      const customerId = req.user?.customer?.customerId || req.user?.customerId
      const tokens = await this.deviceTokenRepo.findByCustomerId(customerId)

      return new ResponseData(200, 'Tokens retrieved successfully', [], tokens)
    } catch (error: any) {
      this.setStatus(500)
      return ResponseData.error(500, 'INTERNAL_SERVER_ERROR', error.message) as any
    }
  }
}
