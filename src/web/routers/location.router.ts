import { Router } from 'express'
import { LocationController } from '../controllers/location.controller'

const router = Router()
const locationController = new LocationController()

/**
 * @route   GET /api/location/wards/:districtId
 * @desc    Proxy to Chợ Tốt wards API (avoid CORS)
 * @access  Public
 */
router.get('/wards/:districtId', locationController.getWards.bind(locationController))

export default router

