import { Request, Response } from 'express'
import { recommendService } from '../../services/recommend.service'
import { HttpStatus } from '../../utils/data-types/http-status-code'
import { Role } from '@/domains/entities/role.entity'
import { RoleType } from '@/domains/entities/enum/value-object'

export class RecommendController {
  /**
   * GET /api/recommend
   * Get personalized recommendations for authenticated customer
   */
  async getRecommendations(req: Request, res: Response): Promise<void> {
    const requestId = Math.random().toString(36).substring(7)
    console.log(`\n========== [Recommend Controller] START REQUEST ${requestId} ==========`)

    try {
      const customerId = req.user?.customer?.customerId
      if (!customerId) {
        res.status(HttpStatus.OK).json({
          success: true,
          data: [],
          total: 0,
          processingTimeMs: 0
        })
        return
      }

      // Parse parameters
      const page = req.query.page ? parseInt(req.query.page as string) : 1
      const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string) : 20
      const logId = req.query.logId ? parseInt(req.query.logId as string) : undefined

      console.log(`[Recommend Controller ${requestId}] ✅ Customer ${customerId} requesting page=${page}, pageSize=${pageSize}, logId=${logId || 'none'}`)

      if (isNaN(page) || page < 1) {
        console.log(`[Recommend Controller ${requestId}] ❌ Invalid page: ${page}`)
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: 'Page must be >= 1'
        })
        return
      }

      if (isNaN(pageSize) || pageSize < 1 || pageSize > 50) {
        console.log(`[Recommend Controller ${requestId}] ❌ Invalid pageSize: ${pageSize}`)
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: 'PageSize must be between 1 and 50'
        })
        return
      }

      console.log(`[Recommend Controller ${requestId}] 🔄 Calling recommendService.getRecommendations...`)

      // Get recommendations
      const result = await recommendService.getRecommendations({
        customerId,
        recommendationLogId: logId,
        page,
        pageSize
      })

      console.log(
        `[Recommend Controller ${requestId}] ✅ Success! Returning ${result.posts.length} posts (page: ${result.pagination.page}, total: ${result.pagination.total}, time: ${result.processingTimeMs}ms)`
      )
      console.log(`========== [Recommend Controller] END REQUEST ${requestId} ==========\n`)

      res.status(HttpStatus.OK).json({
        success: true,
        recommendationLogId: result.recommendationLogId,
        data: result.posts,
        pagination: result.pagination,
        processingTimeMs: result.processingTimeMs
      })
    } catch (error) {
      console.error(`[Recommend Controller ${requestId}] ❌ ERROR:`, error)
      console.error(
        `[Recommend Controller ${requestId}] Error stack:`,
        error instanceof Error ? error.stack : 'No stack'
      )
      console.log(`========== [Recommend Controller] END REQUEST ${requestId} (ERROR) ==========\n`)

      // Handle specific error cases
      if (error instanceof Error) {
        if (error.message.includes('No interaction history')) {
          console.log(`[Recommend Controller ${requestId}] ℹ️ Returning empty - no history`)
          res.status(HttpStatus.OK).json({
            success: true,
            data: [],
            total: 0,
            message: 'No recommendation history yet. Browse some posts first!'
          })
          return
        }

        if (error.message.includes('service unavailable')) {
          console.log(`[Recommend Controller ${requestId}] ⚠️ Python service unavailable`)
          res.status(HttpStatus.SERVICE_UNAVAILABLE).json({
            success: false,
            message: 'Recommendation service is temporarily unavailable'
          })
          return
        }
      }

      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get recommendations'
      })
    }
  }

  /**
   * GET /api/recommend/health
   * Health check for recommend service
   */
  async health(req: Request, res: Response): Promise<void> {
    try {
      const isHealthy = await recommendService.healthCheck()

      if (isHealthy) {
        res.status(HttpStatus.OK).json({
          success: true,
          status: 'healthy',
          recommendService: 'connected'
        })
      } else {
        res.status(HttpStatus.SERVICE_UNAVAILABLE).json({
          success: false,
          status: 'unhealthy',
          recommendService: 'disconnected'
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
   * POST /api/recommend/click
   * Log user click on recommendation
   */
  async logClick(req: Request, res: Response): Promise<void> {
    try {
      const { recommendationLogId, recommendationLogItemId } = req.body

      console.log('[Recommend Controller] Received click:', { recommendationLogId, recommendationLogItemId })

      if (!recommendationLogId || !recommendationLogItemId) {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: 'recommendationLogId and recommendationLogItemId are required'
        })
        return
      }

      const { RecommendationClickRepository } = await import(
        '../../infras/repositories/recommendation-click.repository'
      )
      const clickRepo = new RecommendationClickRepository()

      const click = await clickRepo.logClick({
        recommendationLogId,
        recommendationLogItemId
      })

      console.log(`[Recommend Controller] ✅ Logged click ${click.clickId}`)

      res.status(HttpStatus.OK).json({
        success: true,
        clickId: click.clickId
      })
    } catch (error) {
      console.error('[Recommend Controller] ❌ Click logging error:', error)
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to log click'
      })
    }
  }
}
