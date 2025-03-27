import express from 'express'
import adminController from '../controllers/admin.controller'
import validatePostStatus from '../validator/admin.validate';

const adminRouter = express.Router()

adminRouter.get('/posts/review-post', adminController.reviewPost.bind(adminController));

adminRouter.post('/posts/review-post/:id',validatePostStatus, adminController.changStatusPost.bind(adminController));

export default adminRouter