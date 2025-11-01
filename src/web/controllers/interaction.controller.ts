import { Request, Response } from 'express'
import InteractionLogService from '../../services/interaction-log.service'
import { HttpStatus } from '../../utils/data-types/http-status-code'

export class InteractionController {
  private interactionLogService: InteractionLogService

  constructor() {
    this.interactionLogService = InteractionLogService.gI()
  }

  /**
   * POST /api/interactions/contact
   * Log contact interaction when user views phone number
   */
  async logContact(req: Request, res: Response): Promise<void> {
    try {
      // Get customer ID from authenticated user
      // @ts-ignore - customer is set by auth middleware
      const customerId = req.user?.customer?.customerId

      if (!customerId) {
        res.status(HttpStatus.UNAUTHORIZED).json({
          success: false,
          message: 'Customer authentication required'
        })
        return
      }

      const { postId } = req.body

      if (!postId) {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: 'postId is required'
        })
        return
      }

      // Validate postId is a number
      const postIdNum = parseInt(postId)
      if (isNaN(postIdNum)) {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: 'postId must be a number'
        })
        return
      }

      await this.interactionLogService.logContact(customerId, postIdNum)

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Contact interaction logged'
      })
    } catch (error) {
      console.error('[Interaction Controller] Error:', error)
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to log interaction'
      })
    }
  }
}

