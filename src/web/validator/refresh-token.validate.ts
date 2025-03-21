import { body } from 'express-validator'
import { validateRequest } from '../middlewares/validateRequest.middleware'

export const refreshTokenValidator = [
  body('refreshToken').notEmpty().withMessage('Refresh token must be a string'),
  validateRequest
]
