import { body, param } from 'express-validator'
import { validateRequest } from '../middlewares/validateRequest.middleware'

const addRateValidate = [
  param('postId').exists().withMessage('POST_ID_IS_REQUIRED'),
  param('postId').isNumeric().withMessage('POST_ID_MUST_BE_NUMERIC'),
  body('numStar').exists().withMessage('RATE_IS_REQUIRED'),
  body('numStar').isNumeric().withMessage('NUM_STAR_MUST_BE_NUMERIC'),
  body('comment').exists().withMessage('RATE_IS_REQUIRED'),
  body('comment').isString().withMessage('NUM_STAR_MUST_BE_NUMERIC'),
  validateRequest
]

export default addRateValidate
