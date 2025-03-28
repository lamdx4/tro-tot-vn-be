import express from 'express'
import exampleRouter from './example.router'
import authRouter from './auth.router'
import multiMediaRouter from './multimedia.router'
import adminRouter from './admin.router'
import postRouter from './post.router'
import customerRouter from './customer.router'

const routerConfig = express.Router()

routerConfig.use('/files', multiMediaRouter)

routerConfig.use(`/examples`, exampleRouter)

routerConfig.use('/auth', authRouter)

routerConfig.use('/admin', adminRouter)

routerConfig.use('/post', postRouter)

routerConfig.use('/user', customerRouter)

export default routerConfig
