import express from 'express'
import authController from '../controllers/auth.controller'
import { body } from 'express-validator'
import { email } from 'envalid'

const authRouter = express.Router()

authRouter.post(
  '/login',
  body('identifier').exists().notEmpty(),
  authController.login.bind(authController)
)

export default authRouter
