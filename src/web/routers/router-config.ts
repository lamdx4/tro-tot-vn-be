import express from 'express'
import exampleRouter from './example.router'
import authRouter from './auth.router'

const routerConfig = express.Router()

// Register all routes with appropriate prefixes
routerConfig.use(`/examples`, exampleRouter)

routerConfig.use('/auth', authRouter)

export default routerConfig
