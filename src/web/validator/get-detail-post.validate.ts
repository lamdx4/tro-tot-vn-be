import { param } from 'express-validator'
import { validateRequest } from '../middlewares/validateRequest.middleware'

const getDetailPostValidate = [
  param('postId').isInt().withMessage('postId must be an integer').toInt(),
  param('postId').exists().withMessage('postId must be existed'),
  validateRequest
]
export default getDetailPostValidate
