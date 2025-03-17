import express from 'express'
import authController from '../controllers/auth.controller'
import validateRegister from '../validator/register-account.validate'
import validateLogin from '../validator/login.validate'

const authRouter = express.Router()

authRouter.post('/register', validateRegister, authController.registerAccount.bind(authController))

authRouter.post('/forgot-password', authController.forgotPassword.bind(authController))

authRouter.post('/login', validateLogin, authController.login.bind(authController))

export default authRouter
