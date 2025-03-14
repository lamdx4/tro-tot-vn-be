import express from 'express'
import authController from '../controllers/auth.controller'
import { body } from 'express-validator'
import validateExpressRequest from '../middlewares/validate.middleware'

const authRouter = express.Router()

const validateRegister = [
  body('phone').isMobilePhone('vi-VN').withMessage('Invalid phone number'),
  body('mail').isEmail().withMessage('Invalid email'),
  body('firstName').matches(/^[a-zA-Z]+$/).withMessage('First name must not contain special characters'),
  body('lastName').matches(/^[a-zA-Z]+$/).withMessage('Last name must not contain special characters'),
  body('birthday').isISO8601().withMessage('Invalid date of birth'),
  body('gender').isIn(['Male', 'Female']).withMessage('Gender can only be Male or Female'),
  body('password').isLength({ min: 8 }).withMessage('Password is required')
]

authRouter.post('/register', validateRegister, validateExpressRequest, authController.registerAccount.bind(authController))

authRouter.post('/forgot-password', authController.forgotPassword.bind(authController))

authRouter.post(
  '/login',
  body('identifier').notEmpty(),
  body('password').notEmpty(),
  validateExpressRequest,
  authController.login.bind(authController)
)

export default authRouter
