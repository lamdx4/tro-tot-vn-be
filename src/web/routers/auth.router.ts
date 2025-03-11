import express from 'express'
import authController from '../controllers/auth.controller'

const authRouter = express.Router()

// Use controller instance methods (with proper binding)
authRouter.post('/forgot-password', authController.forgotPassword.bind(authController))

export default authRouter