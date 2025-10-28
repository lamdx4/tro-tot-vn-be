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

export default router

