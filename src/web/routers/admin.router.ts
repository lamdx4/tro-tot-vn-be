import express from 'express'
import adminController from '../controllers/admin.controller'
import { requireRoleMiddleware } from '../middlewares/authority.middlewarer'
import { RoleType } from '@/domains/entities/enum/value-object'
import authenticateMiddleware from '../middlewares/authenticate.middleware'
import { ad } from '@faker-js/faker/dist/airline-CBNP41sR'
import getProfileModerator from '../validator/get-profile-moderator.validate'
import getHistoryOfPostValidate from '../validator/get-history-of-post.validate'
import { RequestHandlerParams, ParamsDictionary } from 'express-serve-static-core'
import setModeratorStatusValidate from '../validator/set-moderator-status.validate'
import validatePostStatus from '../validator/admin-moderate-post.validate'
import getHistoryByModeratorIdValidate from '../validator/get-history-by-moderator-id.validate'
import resetPasswordOfModerator from '../validator/reset-password.validate'

const adminRouter = express.Router()

adminRouter.get(
  '/posts/review-post',
  authenticateMiddleware,
  requireRoleMiddleware([RoleType.MANAGER, RoleType.MODERATOR]),
  adminController.getReviewPost.bind(adminController)
)

adminRouter.post(
  '/posts/review-post/:postId/moderate',
  validatePostStatus,
  authenticateMiddleware,
  requireRoleMiddleware([RoleType.MANAGER, RoleType.MODERATOR]),
  adminController.moderatePost.bind(adminController)
)


adminRouter.get(
  `/posts/review-post/:postId/moderate-history`,
  getHistoryOfPostValidate,
  authenticateMiddleware,
  requireRoleMiddleware([RoleType.MANAGER, RoleType.MODERATOR]),
  adminController.getHistoryOfPost.bind(adminController)
)

adminRouter.get(
  '/manager/moderators',
  authenticateMiddleware,
  requireRoleMiddleware([RoleType.MANAGER]),
  adminController.getModerators.bind(adminController));


adminRouter.post(
  '/manager/add-moderators',
  authenticateMiddleware,
  requireRoleMiddleware([RoleType.MANAGER]),
  adminController.addModerator.bind(adminController));

adminRouter.put(
  '/manager/:moderatorId/update-status-moderators',
  setModeratorStatusValidate,
  authenticateMiddleware,
  requireRoleMiddleware([RoleType.MANAGER]),
  adminController.setModeratorStatus.bind(adminController));

adminRouter.get(
  `/manager/moderators/:moderatorId/moderator-history`,
  getHistoryByModeratorIdValidate,
  authenticateMiddleware,
  requireRoleMiddleware([RoleType.MANAGER]),
  adminController.getHistoryByModeratorId.bind(adminController)
)
adminRouter.get(
  `/manager/moderators/:moderatorId/profile`,
  authenticateMiddleware,
  requireRoleMiddleware([RoleType.MANAGER, RoleType.MODERATOR]),
  adminController.getProfileModerator.bind(adminController)
)
adminRouter.get(
  `/get-my-profile`,
  authenticateMiddleware,
  requireRoleMiddleware([RoleType.MANAGER, RoleType.MODERATOR]),
  adminController.getMyProfile.bind(adminController)
)
adminRouter.patch(
  `/update-my-profile`,
  authenticateMiddleware,
  requireRoleMiddleware([RoleType.MANAGER]),
  adminController.updateMyProfile.bind(adminController)
)

adminRouter.get("/moderators/:moderatorId/profile",
  getProfileModerator,
  authenticateMiddleware,
  requireRoleMiddleware([RoleType.MANAGER]),
  adminController.getProfileModerator.bind(adminController)
)

adminRouter.put("/manager/:moderatorId/reset-password",
  getProfileModerator,
  resetPasswordOfModerator,
  authenticateMiddleware,
  requireRoleMiddleware([RoleType.MANAGER]),
  adminController.resetPasswordOfModerator.bind(adminController)
)

export default adminRouter
