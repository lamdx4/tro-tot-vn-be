import express from 'express'
import customerController from '../controllers/customer.controller'
import authenticateMiddleware from '../middlewares/authenticate.middleware'
import validateGetInformation from '../validator/get-information.validate'
const customerRouter = express.Router()

customerRouter.get('/my-profile', authenticateMiddleware, customerController.getMyProfile.bind(customerController))

customerRouter.put('/my-profile', authenticateMiddleware, customerController.updateMyProfile.bind(customerController))

customerRouter.get(
  '/:customerId/profile',
  validateGetInformation,
  customerController.getInformation.bind(customerController)
)

export default customerRouter
