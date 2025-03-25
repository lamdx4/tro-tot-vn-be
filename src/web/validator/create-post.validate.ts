import { body } from 'express-validator'
import { validateRequest } from '../middlewares/validateRequest.middleware'

const createPostValidate = [
  body('title').notEmpty().withMessage('Title is required'),
  body('price').notEmpty().withMessage('Price is required'),
  body('acreage').notEmpty().withMessage('Acreage is required'),
  body('interiorStatus').notEmpty().withMessage('Interior status is required'),
  body('city').notEmpty().withMessage('City is required'),
  body('ward').notEmpty().withMessage('Ward is required'),
  body('district').notEmpty().withMessage('District is required'),
  body('houseNumber').notEmpty().withMessage('House number is required'),
  body('streetName').notEmpty().withMessage('Street name is required'),
  body('description').notEmpty().withMessage('Description is required'),
  validateRequest
]
export default createPostValidate
