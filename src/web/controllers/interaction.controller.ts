import { 
  Body, 
  Post, 
  Route, 
  Security, 
  Tags, 
  Controller,
  Request
} from '@tsoa/runtime'
import InteractionLogService from '../../services/interaction-log.service'
import { ContactLogRequest } from './dto/interaction.dto'
import ResponseData from '@/utils/data-types/response'

@Route("interactions")
@Tags("Interaction")
export class InteractionController extends Controller {
  private interactionLogService = InteractionLogService.gI()

  constructor() {
    super()
  }

  /**
   * Log contact interaction when user views phone number.
   * This is used for tracking user interest and improving recommendations.
   */
  @Post("contact")
  @Security("jwt")
  public async logContact(
    @Body() body: ContactLogRequest,
    @Request() req: any
  ): Promise<ResponseData<null>> {
    try {
      const customerId = req.user?.customer?.customerId

      if (!customerId) {
        this.setStatus(401)
        return ResponseData.error(401, 'UNAUTHORIZED', 'Customer authentication required') as any
      }

      await this.interactionLogService.logContact(customerId, body.postId)

      return ResponseData.success(null)
    } catch (error: any) {
      this.setStatus(500)
      return ResponseData.error(500, 'INTERNAL_SERVER_ERROR', error.message) as any
    }
  }
}
