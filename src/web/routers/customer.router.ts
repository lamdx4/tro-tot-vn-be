import express from 'express'
import customerController from '../controllers/customer.controller'
import authenticateMiddleware from '../middlewares/authenticate.middleware'
const userRouter = express.Router()

userRouter.get('/my-profile', authenticateMiddleware, customerController.getMyProfile.bind(customerController))

userRouter.put('/my-profile', authenticateMiddleware, customerController.updateMyProfile.bind(customerController))

userRouter.get('/customer/information', customerController.getInformation.bind(customerController))

export default userRouter
