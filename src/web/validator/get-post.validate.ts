import { query } from 'express-validator'
import { validateRequest } from '../middlewares/validateRequest.middleware'
import { PostStatus } from '@/domains/entities/enum/value-object'

export const getPostValidate = [
  query('status').notEmpty().isIn(Object.values(PostStatus)).isString().withMessage('Status is required'),
  query('cursor').optional().isInt().toInt(),
  query('limit').isInt().toInt(),
  validateRequest
]
export default getPostValidate
