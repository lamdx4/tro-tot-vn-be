import {
  Body,
  Get,
  Post,
  Route,
  Security,
  Tags,
  Request,
  Controller,
  Response,
} from '@tsoa/runtime'
import { DeviceTokenRepository } from '@/infras/repositories'
import ResponseData from '@/utils/data-types/response'
import { 
  RegisterTokenRequest, 
  UnregisterTokenRequest,
  NotificationErrorResponse
} from './dto/notification.dto'

@Route("notifications")
@Tags("Notifications")
export class NotificationController extends Controller {
  private deviceTokenRepo = new DeviceTokenRepository()

  constructor() {
    super()
  }

  /**
   * Register or update an FCM token for the current user
   */
  @Post("tokens")
  @Security("jwt")
  @Response<NotificationErrorResponse>(400, "Bad Request")
  @Response<NotificationErrorResponse>(500, "Internal Server Error")
  public async registerToken(
    @Body() body: RegisterTokenRequest,
    @Request() req: any
  ): Promise<ResponseData<any>> {
    try {
      const customerId = req.user?.customer?.customerId || req.user?.customerId
      const { fcmToken, platform } = body

      if (!fcmToken) {
        this.setStatus(400)
        return ResponseData.error(400, 'FCM_TOKEN_REQUIRED', 'FCM token is required') as any
      }

      const token = await this.deviceTokenRepo.upsertToken(customerId, fcmToken, platform)

      this.setStatus(200)
      return ResponseData.success(token)
    } catch (error: any) {
      this.setStatus(500)
      return ResponseData.error(500, 'INTERNAL_SERVER_ERROR', error.message) as any
    }
  }

  /**
   * Unregister an FCM token (e.g., on logout)
   */
  @Post("tokens/unregister")
  @Response<NotificationErrorResponse>(400, "Bad Request")
  @Response<NotificationErrorResponse>(500, "Internal Server Error")
  public async unregisterToken(
    @Body() body: UnregisterTokenRequest
  ): Promise<ResponseData<any>> {
    try {
      const { fcmToken } = body

      if (!fcmToken) {
        this.setStatus(400)
        return ResponseData.error(400, 'FCM_TOKEN_REQUIRED', 'FCM token is required') as any
      }

      await this.deviceTokenRepo.deleteByToken(fcmToken)

      this.setStatus(200)
      return ResponseData.success('Token unregistered successfully')
    } catch (error: any) {
      this.setStatus(500)
      return ResponseData.error(500, 'INTERNAL_SERVER_ERROR', error.message) as any
    }
  }

  /**
   * Get all registered tokens for the current user
   */
  @Get("tokens")
  @Security("jwt")
  @Response<ResponseData<any>>(500, "Internal Server Error")
  public async getMyTokens(
    @Request() req: any
  ): Promise<ResponseData<any[]>> {
    try {
      const customerId = req.user?.customer?.customerId || req.user?.customerId
      const tokens = await this.deviceTokenRepo.findByCustomerId(customerId)

      this.setStatus(200)
      return ResponseData.success(tokens)
    } catch (error: any) {
      this.setStatus(500)
      return ResponseData.error(500, 'INTERNAL_SERVER_ERROR', error.message) as any
    }
  }
}
