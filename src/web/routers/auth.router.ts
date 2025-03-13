import express from 'express'
import authController from '../controllers/auth.controller'
import { body } from 'express-validator'
import validateExpressRequest from '../middlewares/validate.middleware'

const authRouter = express.Router()

authRouter.post(
  '/login',
  body('identifier').notEmpty(),
  body('password').notEmpty(),
  validateExpressRequest,
  authController.login.bind(authController)
)

export default authRouter
