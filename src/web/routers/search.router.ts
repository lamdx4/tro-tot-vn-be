import { Router } from 'express'
import { SearchController } from '../controllers/search.controller'

const router = Router()
const searchController = new SearchController()

/**
 * @route   GET /api/search
 * @desc    Hybrid vector search with filters and pagination
 * @access  Public
 * @query   query, city, district, ward, priceMin, priceMax, acreageMin, acreageMax, interiorCondition, page, pageSize
 */
router.get('/', searchController.search.bind(searchController))

/**
 * @route   GET /api/search/health
 * @desc    Health check for search service
 * @access  Public
 */
router.get('/health', searchController.health.bind(searchController))

/**
 * @route   POST /api/search/feedback
 * @desc    Submit user feedback on search quality
 * @access  Public
 * @body    searchLogId, isHelpful, issues?, comment?
 */
router.post('/feedback', searchController.submitFeedback.bind(searchController))

/**
 * @route   POST /api/search/click
 * @desc    Log user click on search result
 * @access  Public
 * @body    searchLogId, searchLogItemId
 */
router.post('/click', searchController.logClick.bind(searchController))

export default router

