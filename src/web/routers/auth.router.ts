import express from 'express'
import authController from '../controllers/auth.controller'
import validateRegister from '../validator/register-account.validate'
import validateLogin from '../validator/login.validate'
import { forgotPasswordValidation, resetPasswordValidation, verifyOtpValidation } from '../validator/auth.validation'
import { validateRequest } from '../middlewares/validateRequest.middleware'
import { refreshTokenValidator } from '../validator/refresh-token.validate'

const authRouter = express.Router()

authRouter.post('/register', validateRegister, authController.registerAccount.bind(authController))
authRouter.post('/send-otp-register', authController.sendOTPRegister.bind(authController))
authRouter.post('/verify-otp-register', authController.verifyOTPRegister.bind(authController))

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
authRouter.post('/reset-password', resetPasswordValidation, authController.resetPassword.bind(authController))

authRouter.post('/login', validateLogin, authController.login.bind(authController))

authRouter.post('/refresh-token', refreshTokenValidator, authController.refreshToken.bind(authController))

authRouter.post('/logout', refreshTokenValidator, authController.logout.bind(authController))

export default authRouter
