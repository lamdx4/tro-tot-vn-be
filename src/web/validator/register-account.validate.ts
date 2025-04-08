import { body } from 'express-validator'
import { validateRequest } from '../middlewares/validateRequest.middleware'

const validateRegister = [
  body('phone').isMobilePhone('vi-VN').withMessage('Invalid phone number'),
  body('email').isEmail().withMessage('Invalid email'),
  body('firstName').exists().isString(),
  body('lastName').exists().isString(),
  body('gender').isIn(['Male', 'Female']).withMessage('Gender can only be Male or Female'),
  validateRequest
]
export default validateRegister
