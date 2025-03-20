import express from 'express'
import exampleRouter from './example.router'
import authRouter from './auth.router'
import multiMediaRouter from './multimedia.router'

const routerConfig = express.Router()

routerConfig.use('/files', multiMediaRouter)

// Register all routes with appropriate prefixes
routerConfig.use(`/examples`, exampleRouter)

routerConfig.use('/auth', authRouter)

export default routerConfig
