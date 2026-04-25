import { 
  Body, 
  Get, 
  Post, 
  Route, 
  Tags, 
  Query, 
  Controller,
  Security,
  Request,
  Response
} from '@tsoa/runtime'
import { recommendService } from '../../services/recommend.service'
import { 
  RecommendationResponse, 
  RecommendationClickRequest,
  RecommendHealthResponse,
  RecommendErrorResponse
} from './dto/recommend.dto'

@Route("recommend")
@Tags("Recommend")
export class RecommendController extends Controller {
  
  constructor() {
    super()
  }

  /**
   * Get personalized recommendations for authenticated customer
   */
  @Get("/")
  @Security("jwt")
  @Response<RecommendErrorResponse>(401, "Unauthorized")
  @Response<RecommendErrorResponse>(500, "Internal Server Error")
  public async getRecommendations(
    @Request() req: any,
    @Query() page: number = 1,
    @Query() pageSize: number = 20,
    @Query() logId?: number
  ): Promise<RecommendationResponse> {
    try {
      const customerId = req.user?.customer?.customerId
      if (!customerId) {
        return {
          success: true,
          data: [],
          pagination: {
            total: 0,
            page,
            pageSize,
            totalPages: 0
          },
          processingTimeMs: 0
        } as any
      }

      const result = await recommendService.getRecommendations({
        customerId,
        recommendationLogId: logId,
        page,
        pageSize
      })

      return {
        success: true,
        recommendationLogId: result.recommendationLogId,
        data: result.posts,
        pagination: result.pagination,
        processingTimeMs: result.processingTimeMs
      } as any
    } catch (error: any) {
      if (error.message.includes('No interaction history')) {
        return {
          success: true,
          data: [],
          pagination: {
            total: 0,
            page,
            pageSize,
            totalPages: 0
          },
          processingTimeMs: 0,
          message: 'No recommendation history yet. Browse some posts first!'
        } as any
      }

      this.setStatus(500)
      return {
        success: false,
        message: error.message || 'Failed to get recommendations'
      } as any
    }
  }

  /**
   * Health check for recommend service
   */
  @Get("health")
  @Response<RecommendErrorResponse>(500, "Internal Server Error")
  @Response<RecommendErrorResponse>(503, "Service Unavailable")
  public async health(): Promise<RecommendHealthResponse> {
    try {
      const isHealthy = await recommendService.healthCheck()

      if (isHealthy) {
        return {
          status: 'healthy',
          recommendService: 'connected'
        }
      } else {
        this.setStatus(503)
        return {
          status: 'unhealthy',
          recommendService: 'disconnected'
        }
      }
    } catch (error: any) {
      this.setStatus(500)
      return {
        status: 'error',
        recommendService: 'disconnected'
      } as any
    }
  }

  /**
   * Log user click on recommendation
   */
  @Post("click")
  @Security("jwt")
  @Response<RecommendErrorResponse>(401, "Unauthorized")
  @Response<RecommendErrorResponse>(500, "Internal Server Error")
  public async logClick(
    @Body() body: RecommendationClickRequest
  ): Promise<any> {
    try {
      const { RecommendationClickRepository } = await import(
        '../../infras/repositories/recommendation-click.repository'
      )
      const clickRepo = new RecommendationClickRepository()

      const click = await clickRepo.logClick(body)

      return {
        success: true,
        clickId: click.clickId
      }
    } catch (error: any) {
      this.setStatus(500)
      return {
        success: false,
        message: 'Failed to log click'
      }
    }
  }
}
