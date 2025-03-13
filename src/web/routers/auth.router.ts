import express from 'express'
import authController from '../controllers/auth.controller'

const authRouter = express.Router()

// Use controller instance methods (with proper binding)
authRouter.post('/forgot-password', authController.forgotPassword.bind(authController))

//verify-otp
authRouter.post('/verify-otp', authController.verifyOtp.bind(authController))

//reset-password
authRouter.post('/reset-password', authController.resetPassword.bind(authController))


export default authRouter