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

      // Parse limit parameter
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20
      console.log(`[Recommend Controller ${requestId}] ✅ Customer ${customerId} requesting ${limit} recommendations`)

      if (isNaN(limit) || limit < 1 || limit > 100) {
        console.log(`[Recommend Controller ${requestId}] ❌ Invalid limit: ${limit}`)
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: 'Limit must be between 1 and 100'
        })
        return
      }

      console.log(`[Recommend Controller ${requestId}] 🔄 Calling recommendService.getRecommendations...`)

      // Get recommendations
      const result = await recommendService.getRecommendations({
        customerId,
        limit
      })

      console.log(
        `[Recommend Controller ${requestId}] ✅ Success! Returning ${result.posts.length} posts (total: ${result.total}, time: ${result.processingTimeMs}ms)`
      )
      console.log(`========== [Recommend Controller] END REQUEST ${requestId} ==========\n`)

      res.status(HttpStatus.OK).json({
        success: true,
        data: result.posts,
        total: result.total,
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
}
