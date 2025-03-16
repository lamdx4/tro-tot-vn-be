import express from 'express'
import authController from '../controllers/auth.controller'
import { forgotPasswordValidation, resetPasswordValidation, verifyOtpValidation } from '../validator/auth.validation'
import { validateRequest } from '../middlewares/validateRequest'

const authRouter = express.Router()

// Use controller instance methods (with proper binding)
authRouter.post(
    "/forgot-password",
    forgotPasswordValidation,
    validateRequest, // Middleware kiểm tra dữ liệu đầu vào
    authController.forgotPassword.bind(authController)
  );

//verify-otp
authRouter.post(
    '/verify-otp',
    verifyOtpValidation,
    validateRequest,
    authController.verifyOtp.bind(authController)
)

//reset-password
authRouter.post(
    '/reset-password',
    resetPasswordValidation,
    validateRequest,
    authController.resetPassword.bind(authController)
)


export default authRouter