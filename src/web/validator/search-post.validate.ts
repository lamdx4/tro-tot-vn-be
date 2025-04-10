import { query } from 'express-validator'

const searchPostValidate = [
  query('keyword').notEmpty().withMessage('Keyword is required').isString().withMessage('Keyword must be a string'),
  query('city').optional().isString().withMessage('City must be a string'),
  query('district').optional().isString().withMessage('District must be a string'),
  query('ward').optional().isString().withMessage('Ward must be a string'),
  query('interiorCondition').optional().isString().withMessage('Interior condition must be a string'),
  query('acreage').optional().matches(/^\d+-\d+$/).withMessage('Acreage must be in the format x-y'),
  query('price').optional().matches(/^\d+-\d+$/).withMessage('Price must be in the format x-y'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be an integer between 1 and 100'),
  query('cursor').optional().isInt().withMessage('Cursor must be an integer').toInt()
]
export default searchPostValidate
