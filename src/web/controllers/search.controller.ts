import { 
  Body, 
  Get, 
  Post, 
  Route, 
  Tags, 
  Query, 
  Controller,
  SuccessResponse,
  Response
} from '@tsoa/runtime'
import { searchService } from '../../services/search.service'
import { 
  SearchResponse, 
  SearchFeedbackRequest, 
  SearchClickRequest,
  SearchHealthResponse
} from './dto/search.dto'
import ResponseData from '@/utils/data-types/response'

@Route("search")
@Tags("Search")
export class SearchController extends Controller {
  
  constructor() {
    super()
  }

  /**
   * Hybrid vector search with filters and pagination
   */
  @Get("/")
  @Response(500, "Internal Server Error")
  public async search(
    @Query() query: string,
    @Query() city?: string,
    @Query() district?: string,
    @Query() ward?: string,
    @Query() priceMin?: number,
    @Query() priceMax?: number,
    @Query() acreageMin?: number,
    @Query() acreageMax?: number,
    @Query() interiorCondition?: string,
    @Query() page: number = 1,
    @Query() pageSize: number = 20
  ): Promise<SearchResponse> {
    try {
      const searchParams = {
        query,
        city,
        district,
        ward,
        priceMin,
        priceMax,
        acreageMin,
        acreageMax,
        interiorCondition,
        page,
        pageSize
      }

      const result = await searchService.search(searchParams)

      return {
        success: true,
        searchLogId: result.searchLogId,
        data: result.posts,
        pagination: result.pagination,
        searchTimeMs: result.searchTimeMs
      } as any
    } catch (error: any) {
      this.setStatus(500)
      return {
        success: false,
        message: error.message || 'Search failed'
      } as any
    }
  }

  /**
   * Health check for search service
   */
  @Get("health")
  @Response(500, "Internal Server Error")
  @Response(503, "Service Unavailable")
  public async health(): Promise<SearchHealthResponse> {
    try {
      const isHealthy = await searchService.healthCheck()

      if (isHealthy) {
        return {
          status: 'healthy',
          searchService: 'connected'
        }
      } else {
        this.setStatus(503)
        return {
          status: 'unhealthy',
          searchService: 'disconnected'
        }
      }
    } catch (error: any) {
      this.setStatus(500)
      return {
        status: 'error',
        searchService: 'disconnected'
      } as any
    }
  }

  /**
   * Submit user feedback on search quality
   */
  @Post("feedback")
  @Response(500, "Internal Server Error")
  public async submitFeedback(
    @Body() body: SearchFeedbackRequest
  ): Promise<any> {
    try {
      const { SearchFeedbackRepository } = await import('../../infras/repositories/search-feedback.repository')
      const feedbackRepo = new SearchFeedbackRepository()

      await feedbackRepo.saveFeedback(body)

      return {
        success: true,
        message: 'Feedback submitted successfully'
      }
    } catch (error: any) {
      this.setStatus(500)
      return {
        success: false,
        message: 'Failed to submit feedback'
      }
    }
  }

  /**
   * Log user click on search result
   */
  @Post("click")
  @Response(500, "Internal Server Error")
  public async logClick(
    @Body() body: SearchClickRequest
  ): Promise<any> {
    try {
      const { SearchClickRepository } = await import('../../infras/repositories/search-click.repository')
      const clickRepo = new SearchClickRepository()

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
