import express from 'express'
import { NotificationController } from '../controllers'
import { authMiddleware } from '../middlewares'

const notificationRouter = express.Router()

// All notification routes require authentication
notificationRouter.use(authMiddleware)

/**
 * @route POST /api/v1/notifications/tokens
 * @desc Register or update an FCM token
 */
notificationRouter.post('/tokens', (req, res) => NotificationController.registerToken(req, res))

/**
 * @route DELETE /api/v1/notifications/tokens
 * @desc Unregister an FCM token
 */
notificationRouter.delete('/tokens', (req, res) => NotificationController.unregisterToken(req, res))

/**
 * @route GET /api/v1/notifications/tokens
 * @desc Get all registered tokens for current user
 */
notificationRouter.get('/tokens', (req, res) => NotificationController.getMyTokens(req, res))

export default notificationRouter
