import express from 'express'
const postRouter = express.Router()
import postController from '../controllers/post.controller'
import uploadMiddleware from '../middlewares/create-post.middleware'

postRouter.post('/create', uploadMiddleware, postController.createPost.bind(postController))

export default postRouter
