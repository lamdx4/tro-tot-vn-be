import express from 'express'
import customerController from '../controllers/customer.controller'
import authenticateMiddleware from '../middlewares/authenticate.middleware'
import validateGetInformation from '../validator/get-information.validate'
import savePostValidate from '../validator/save-post-validate'
import updateMyProfile from '../validator/update-my-profile'
import addRateValidate from '../validator/add-rate.validate'
import { param } from 'express-validator'
import { validateRequest } from '../middlewares/validateRequest.middleware'
import createSubscriptionValidate from '../validator/create-subscription.validate'
const customerRouter = express.Router()

customerRouter.get('/my-profile', authenticateMiddleware, customerController.getMyProfile.bind(customerController))

customerRouter.put(
  '/my-profile',
  updateMyProfile,
  authenticateMiddleware,
  customerController.updateMyProfile.bind(customerController)
)

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
  '/post/:postId/rate',
  addRateValidate,
  authenticateMiddleware,
  customerController.addRate.bind(customerController)
)

customerRouter.get(
  '/post/:postId/rate',
  param('postId').exists().withMessage('POST_ID_IS_REQUIRED'),
  validateRequest,
  customerController.getRateFromPost.bind(customerController)
)

customerRouter.get(
  '/post/:postId/avg-rate',
  param('postId').exists().withMessage('POST_ID_IS_REQUIRED'),
  validateRequest,
  customerController.getAvgRateFromPost.bind(customerController)
)

customerRouter.get(
  '/post/:postId/my-rate',
  param('postId').exists().withMessage('POST_ID_IS_REQUIRED'),
  validateRequest,
  authenticateMiddleware,
  customerController.getMyRateOnPost.bind(customerController)
)

customerRouter.delete(
  '/post/:postId/my-rate',
  param('postId').exists().withMessage('POST_ID_IS_REQUIRED'),
  validateRequest,
  authenticateMiddleware,
  customerController.delMyRateOnPost.bind(customerController)
)

customerRouter.delete(
  '/saved-post',
  savePostValidate,
  authenticateMiddleware,
  customerController.deleteSavedPost.bind(customerController)
)

customerRouter.get('/subscription', authenticateMiddleware, customerController.getSubscription.bind(customerController))

customerRouter.post(
  '/subscription',
  createSubscriptionValidate,
  authenticateMiddleware,
  customerController.createSubscription.bind(customerController)
)
customerRouter.delete(
  '/subscription/:subscriptionId',
  param('subscriptionId').exists().withMessage('SUBSCRIPTION_ID_IS_REQUIRED'),
  authenticateMiddleware,
  customerController.deleteSubscription.bind(customerController)
)
export default customerRouter
