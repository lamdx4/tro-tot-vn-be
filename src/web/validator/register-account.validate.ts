import { body } from 'express-validator'
import { validateRequest } from '../middlewares/validateRequest.middleware'

const validateRegister = [
  body('phone').isMobilePhone('vi-VN').withMessage('Invalid phone number'),
  body('email').isEmail().withMessage('Invalid email'),
  body('firstName')
    .matches(/^[a-zA-Z]+$/)
    .withMessage('First name must not contain special characters'),
  body('lastName')
    .matches(/^[a-zA-Z]+$/)
    .withMessage('Last name must not contain special characters'),
  body('gender').isIn(['Male', 'Female']).withMessage('Gender can only be Male or Female'),
  body('password').isLength({ min: 8 }).withMessage('Password is required'),
  validateRequest
]
export default validateRegister
