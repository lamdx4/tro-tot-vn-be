import express from 'express'
import exampleRouter from './example.router'
import authRouter from './auth.router'
import multiMediaRouter from './multimedia.router'
import adminRouter from './admin.router'

const routerConfig = express.Router()

routerConfig.use('/files', multiMediaRouter)

// Register all routes with appropriate prefixes
routerConfig.use(`/examples`, exampleRouter)

routerConfig.use('/auth', authRouter)

routerConfig.use('/admin', adminRouter)

export default routerConfig
