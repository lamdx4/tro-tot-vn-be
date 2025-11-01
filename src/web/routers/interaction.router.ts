import { Router } from 'express'
import { InteractionController } from '../controllers/interaction.controller'
import authenticateMiddleware from '../middlewares/authenticate.middleware'

const router = Router()
const interactionController = new InteractionController()

/**
 * @route   POST /api/interactions/contact
 * @desc    Log contact interaction when user views phone number
 * @access  Private (requires authentication)
 * @body    { postId: number }
 */
router.post(
  '/contact',
  authenticateMiddleware,
  interactionController.logContact.bind(interactionController)
)

export default router

