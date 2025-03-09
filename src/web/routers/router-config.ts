import express from 'express'
import exampleRouter from './example.router'
import { errorHandler, notFoundHandler } from '../middlewares/error.middleware'

const routerConfig = express.Router()

// API versioning prefix
const API_PREFIX = '/api/'

// Register all routes with appropriate prefixes
routerConfig.use(`${API_PREFIX}/examples`, exampleRouter)

// Define more routers here

routerConfig.use('*', notFoundHandler)

export default routerConfig
