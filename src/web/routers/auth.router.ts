import express from 'express'
import authController from '../controllers/auth.controller'
import validateRegister from '../validator/register-account.validate'
import validateLogin from '../validator/login.validate'
import { forgotPasswordValidation, resetPasswordValidation, verifyOtpValidation } from '../validator/auth.validation'
import { validateRequest } from '../middlewares/validateRequest'

const authRouter = express.Router()

authRouter.post('/register', validateRegister, authController.registerAccount.bind(authController))

authRouter.post('/forgot-password', authController.forgotPassword.bind(authController))

authRouter.post(
  '/forgot-password',
  forgotPasswordValidation,
   // Middleware kiểm tra dữ liệu đầu vào
  authController.forgotPassword.bind(authController)
)

//verify-otp
authRouter.post('/verify-otp', verifyOtpValidation, authController.verifyOtp.bind(authController))

//reset-password
authRouter.post(
  '/reset-password',
  resetPasswordValidation,
  authController.resetPassword.bind(authController)
)

authRouter.post('/login', validateLogin, authController.login.bind(authController))

export default authRouter
