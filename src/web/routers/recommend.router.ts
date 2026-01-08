import { Router } from 'express'
import { RecommendController } from '../controllers/recommend.controller'
import authenticateMiddleware from '../middlewares/authenticate.middleware'

const router = Router()
const recommendController = new RecommendController()

/**
 * @route   GET /api/recommend
 * @desc    Get personalized recommendations for authenticated customer
 * @access  Private (requires authentication)
 * @query   limit (optional, default: 20, max: 100)
 */
router.get(
  '/',
  authenticateMiddleware,
  recommendController.getRecommendations.bind(recommendController)
)

/**
 * @route   GET /api/recommend/health
 * @desc    Health check for recommend service
 * @access  Public
 */
router.get('/health', recommendController.health.bind(recommendController))

/**
 * @route   POST /api/recommend/click
 * @desc    Log user click on recommendation
 * @access  Private
 */
router.post(
  '/click',
  authenticateMiddleware,
  recommendController.logClick.bind(recommendController)
)

export default router

