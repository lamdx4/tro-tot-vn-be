import express from 'express'
import adminController from '../controllers/admin.controller'
import validatePostStatus from '../validator/admin.validate'
import { requireRoleMiddleware } from '../middlewares/authority.middlewarer'
import { RoleType } from '@/domains/entities/enum/value-object'
import authenticateMiddleware from '../middlewares/authenticate.middleware'

const adminRouter = express.Router()

adminRouter.get(
  '/posts/review-post',
  authenticateMiddleware,
  requireRoleMiddleware([RoleType.MANAGER, RoleType.MODERATOR]),
  adminController.reviewPost.bind(adminController)
)

adminRouter.post(
  '/posts/review-post/:id',
  authenticateMiddleware,
  requireRoleMiddleware([RoleType.MANAGER, RoleType.MODERATOR]),
  validatePostStatus,
  adminController.moderatePost.bind(adminController)
)

export default adminRouter
