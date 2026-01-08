import { Request, Response } from 'express'
import { searchService } from '../../services/search.service'
import { HttpStatus } from '../../utils/data-types/http-status-code'

export class SearchController {
  /**
   * POST /api/search
   * Hybrid vector search with pagination
   */
  async search(req: Request, res: Response): Promise<void> {
    try {
      console.log('[Search Controller] Raw query params:', req.query)

      const {
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
      } = req.query

      // Validate required query parameter
      if (!query || typeof query !== 'string') {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: 'Query parameter is required'
        })
        return
      }

      // Parse and validate parameters
      const searchParams = {
        query: query as string,
        city: city as string | undefined,
        district: district as string | undefined,
        ward: ward as string | undefined,
        priceMin: priceMin ? parseInt(priceMin as string) : undefined,
        priceMax: priceMax ? parseInt(priceMax as string) : undefined,
        acreageMin: acreageMin ? parseInt(acreageMin as string) : undefined,
        acreageMax: acreageMax ? parseInt(acreageMax as string) : undefined,
        interiorCondition: interiorCondition as string | undefined,
        page: page ? parseInt(page as string) : 1,
        pageSize: pageSize ? parseInt(pageSize as string) : 20
      }

      console.log('[Search Controller] Parsed params:', JSON.stringify(searchParams, null, 2))

      // Perform search
      const result = await searchService.search(searchParams)

      res.status(HttpStatus.OK).json({
        success: true,
        searchLogId: result.searchLogId,  // NEW: for feedback/click tracking
        data: result.posts,
        pagination: result.pagination,
        searchTimeMs: result.searchTimeMs
      })
    } catch (error) {
      console.error('[Search Controller] Error:', error)
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error instanceof Error ? error.message : 'Search failed'
      })
    }
  }

  /**
   * GET /api/search/health
   * Health check for search service
   */
  async health(req: Request, res: Response): Promise<void> {
    try {
      const isHealthy = await searchService.healthCheck()

      if (isHealthy) {
        res.status(HttpStatus.OK).json({
          success: true,
          status: 'healthy',
          searchService: 'connected'
        })
      } else {
        res.status(HttpStatus.SERVICE_UNAVAILABLE).json({
          success: false,
          status: 'unhealthy',
          searchService: 'disconnected'
        })
      }
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        status: 'error',
        message: error instanceof Error ? error.message : 'Health check failed'
      })
    }
  }

  /**
   * POST /api/search/feedback
   * Submit user feedback on search quality
   */
  async submitFeedback(req: Request, res: Response): Promise<void> {
    try {
      const { searchLogId, isHelpful, issues, comment } = req.body

      // Validate required fields
      if (!searchLogId || typeof isHelpful !== 'boolean') {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: 'searchLogId and isHelpful are required'
        })
        return
      }

      // Import and save feedback
      const { SearchFeedbackRepository } = await import('../../infras/repositories/search-feedback.repository')
      const feedbackRepo = new SearchFeedbackRepository()

      await feedbackRepo.saveFeedback({
        searchLogId,
        isHelpful,
        issues,
        comment
      })

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Feedback submitted successfully'
      })
    } catch (error) {
      console.error('[Search Controller] Feedback error:', error)
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to submit feedback'
      })
    }
  }

  /**
   * POST /api/search/click
   * Log user click on search result
   */
  async logClick(req: Request, res: Response): Promise<void> {
    try {
      const { searchLogId, searchLogItemId } = req.body

      console.log('[Search Controller] Received click tracking request:', { searchLogId, searchLogItemId })

      if (!searchLogId || !searchLogItemId) {
        console.log('[Search Controller] Missing required fields')
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: 'searchLogId and searchLogItemId are required'
        })
        return
      }

      // Import and save click
      const { SearchClickRepository } = await import('../../infras/repositories/search-click.repository')
      const clickRepo = new SearchClickRepository()

      const click = await clickRepo.logClick({
        searchLogId,
        searchLogItemId
      })

      console.log(`[Search Controller] ✅ Successfully logged click ${click.clickId}`)

      res.status(HttpStatus.OK).json({
        success: true,
        clickId: click.clickId
      })
    } catch (error) {
      console.error('[Search Controller] ❌ Click logging error:', error)
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to log click'
      })
    }
  }
}

