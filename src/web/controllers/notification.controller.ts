import { Request, Response } from 'express'
import { DeviceTokenRepository } from '@/infras/repositories'
import ResponseData from '@/utils/data-types/response'

class NotificationController {
  private deviceTokenRepo: DeviceTokenRepository

  constructor() {
    this.deviceTokenRepo = new DeviceTokenRepository()
  }

  /**
   * Register or update an FCM token for the current user
   */
  async registerToken(req: Request, res: Response): Promise<void> {
    try {
      const customerId = (req as any).user?.customer?.customerId || (req as any).user?.customerId
      const { fcmToken, platform } = req.body

      if (!fcmToken) {
        res.status(400).json(ResponseData.error(400, 'FCM token is required'))
        return
      }

      const token = await this.deviceTokenRepo.upsertToken(customerId, fcmToken, platform)

      res.status(200).json(new ResponseData(200, 'Token registered successfully', token))
    } catch (error: any) {
      console.error('[NotificationController] Error registering token:', error)
      res.status(500).json(ResponseData.error(500, error.message))
    }
  }

  /**
   * Unregister an FCM token (e.g., on logout)
   */
  async unregisterToken(req: Request, res: Response): Promise<void> {
    try {
      const { fcmToken } = req.body

      if (!fcmToken) {
        res.status(400).json(ResponseData.error(400, 'FCM token is required'))
        return
      }

      await this.deviceTokenRepo.deleteByToken(fcmToken)

      res.status(200).json(new ResponseData(200, 'Token unregistered successfully'))
    } catch (error: any) {
      console.error('[NotificationController] Error unregistering token:', error)
      res.status(500).json(ResponseData.error(500, error.message))
    }
  }

  /**
   * Get all registered tokens for the current user
   */
  async getMyTokens(req: Request, res: Response): Promise<void> {
    try {
      const customerId = (req as any).user?.customer?.customerId || (req as any).user?.customerId
      const tokens = await this.deviceTokenRepo.findByCustomerId(customerId)

      res.status(200).json(new ResponseData(200, 'Tokens retrieved successfully', tokens))
    } catch (error: any) {
      console.error('[NotificationController] Error getting tokens:', error)
      res.status(500).json(ResponseData.error(500, error.message))
    }
  }
}

// Create and export controller instance
export default new NotificationController()
