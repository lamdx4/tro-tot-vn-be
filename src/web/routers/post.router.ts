import express from 'express'
const postRouter = express.Router()
import postController from '../controllers/post.controller'
import uploadMiddleware from '../middlewares/create-post.middleware'
import createPostValidate from '../validator/create-post.validate'
import authenticateMiddleware from '../middlewares/authenticate.middleware'
import getPostValidate from '../validator/get-post.validate'
import getDetailPostValidate from '../validator/get-detail-post.validate'
import { param } from 'express-validator'
import hideMyPostValidate from '../validator/hide-my-post.validate'
import { requireRoleMiddleware } from '../middlewares/authority.middlewarer'
import { RoleType } from '@/domains/entities/enum/value-object'
import { validateRequest } from '../middlewares/validateRequest.middleware'
import updatePostMiddleware from '../middlewares/update-post.middleware'
import updatePostValidate from '../validator/update-post.validate'

postRouter.post(
  '/create',
  authenticateMiddleware,
  requireRoleMiddleware([RoleType.CUSTOMER]),
  uploadMiddleware,
  createPostValidate,
  postController.createPost.bind(postController)
)

postRouter.get('/list', authenticateMiddleware, getPostValidate, postController.getMyPosts.bind(postController))

postRouter.get('/:postId/detail', getDetailPostValidate, postController.getDetailPost.bind(postController))

postRouter.get('/latest-post', postController.getLastPost.bind(postController))

postRouter.post(
  '/hide-post',
  hideMyPostValidate,
  authenticateMiddleware,
  requireRoleMiddleware([RoleType.CUSTOMER]),
  postController.hideMyPost.bind(postController)
)
postRouter.get(
  '/:postId/my-post',
  authenticateMiddleware,
  requireRoleMiddleware([RoleType.CUSTOMER]),
  param('postId').exists().withMessage('PostId is required'),
  validateRequest,
  postController.getDetailMyPost.bind(postController)
)

postRouter.post(
  '/:postId/edit',
  authenticateMiddleware,
  requireRoleMiddleware([RoleType.CUSTOMER]),
  updatePostMiddleware,
  updatePostValidate,
  postController.editPost.bind(postController)
)

postRouter.post(
  '/un-hide-post',
  hideMyPostValidate,
  authenticateMiddleware,
  requireRoleMiddleware([RoleType.CUSTOMER]),
  postController.unHideMyPost.bind(postController)
)

export default postRouter
