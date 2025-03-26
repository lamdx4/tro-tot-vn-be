import express from 'express'
import exampleRouter from './example.router'
import authRouter from './auth.router'
import multiMediaRouter from './multimedia.router'
import adminRouter from './admin.router'
import postController from '../controllers/post.controller'
import postRouter from './post.router'

const routerConfig = express.Router()

routerConfig.use('/files', multiMediaRouter)

// Register all routes with appropriate prefixes
routerConfig.use(`/examples`, exampleRouter)

routerConfig.use('/auth', authRouter)

routerConfig.use('/admin', adminRouter)

routerConfig.use('/post', postRouter)

export default routerConfig
