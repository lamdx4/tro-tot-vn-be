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

      // Perform search
      const result = await searchService.search(searchParams)

      res.status(HttpStatus.OK).json({
        success: true,
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
}

