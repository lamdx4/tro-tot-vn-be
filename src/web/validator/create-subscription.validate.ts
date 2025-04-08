import { body } from 'express-validator'
import { validateRequest } from '../middlewares/validateRequest.middleware'

const createSubscriptionValidate = [
  body('city').exists().withMessage('City is required'),
  body('district').exists().withMessage('City is required'),
  validateRequest
]

export default createSubscriptionValidate
