import express from 'express'
const postRouter = express.Router()
import postController from '../controllers/post.controller'
import uploadMiddleware from '../middlewares/create-post.middleware'
import createPostValidate from '../validator/create-post.validate'
import authenticateMiddleware from '../middlewares/authenticate.middleware'
import getPostValidate from '../validator/get-post.validate'

postRouter.post(
  '/create',
  authenticateMiddleware,
  uploadMiddleware,
  createPostValidate,
  postController.createPost.bind(postController)
)

postRouter.get('/list', authenticateMiddleware, getPostValidate, postController.getPost.bind(postController))

export default postRouter
