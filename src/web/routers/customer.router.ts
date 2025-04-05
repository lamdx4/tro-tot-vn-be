import express from 'express'
import customerController from '../controllers/customer.controller'
import authenticateMiddleware from '../middlewares/authenticate.middleware'
import validateGetInformation from '../validator/get-information.validate'
import savePostValidate from '../validator/save-post-validate'
import updateMyProfile from '../validator/update-my-profile'
const customerRouter = express.Router()

customerRouter.get('/my-profile', authenticateMiddleware, customerController.getMyProfile.bind(customerController))

customerRouter.put('/my-profile', updateMyProfile, authenticateMiddleware, customerController.updateMyProfile.bind(customerController))

customerRouter.get(
  '/:customerId/profile',
  validateGetInformation,
  customerController.getInformation.bind(customerController)
)

customerRouter.post(
  '/save-post',
  authenticateMiddleware,
  savePostValidate,
  customerController.savePost.bind(customerController)
)

customerRouter.get('/saved-post', authenticateMiddleware, customerController.getSavedPost.bind(customerController))

customerRouter.post(
  '/appointment',
  authenticateMiddleware,
  customerController.createAppointment.bind(customerController)
)
customerRouter.get('/appointment', authenticateMiddleware, customerController.getAppointments.bind(customerController))

customerRouter.delete(
  '/save-post',
  savePostValidate,
  authenticateMiddleware,
  customerController.deleteSavedPost.bind(customerController)
)

export default customerRouter
