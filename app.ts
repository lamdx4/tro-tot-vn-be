// Preload environment variables BEFORE any other imports
import './src/preload-env'

import 'reflect-metadata'

import cors from 'cors'

import express from 'express'
import { createServer } from 'http'

// import routerConfig from '@/web/routers/router-config.js'
// import '@/web/routers/router-config'

import AppDataSource from '@/infras/db/datasource'

import compression from 'compression'
import morgan from 'morgan'
import { notFoundHandler, errorHandler } from '@/web/middlewares/error.middleware'
import seedData from '@/infras/db/seed-data/seed-data'

// Import Socket.IO configuration
import { SocketConfig } from '@/infras/socket'



async function startApp() {
  try {
    await AppDataSource.initialize()
    console.log('[Database] Connected successfully')
  } catch (e) {
    console.error(e)
    process.exit(1)
  }

  // Seed initial data
  try {
    console.log('[Seed] Seeding initial data...')
    await seedData()
  } catch (e) {
    console.error('Seed data error:', e)
  }

  import('@/infras/redis/redis');

  const app = express()

  // Create HTTP server for Socket.IO
  const httpServer = createServer(app)

  // Initialize Socket.IO with SocketConfig
  const socketConfig = new SocketConfig(httpServer)
  const io = socketConfig.getIO()

  // Store io in app locals for access in controllers
  app.locals.io = io
  app.locals.socketConfig = socketConfig

  app.use(cors())

  app.use(compression())

  app.use(morgan('dev'))

  app.use(express.json())

  app.use(express.urlencoded({extended:true})) //*******

  // Serve test files
  app.use('/tests', express.static('tests'))
  const path = require('path')

  // Scalar API Reference
  const { apiReference } = require('@scalar/express-api-reference')

  // Load Swagger Spec
  const fs = require('fs')
  const swaggerSpec = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'docs', 'swagger.json'), 'utf8'))

  app.use(
    '/api-docs',
    apiReference({
      spec: {
        content: swaggerSpec,
      },
      authentication: {
        preferredSecurityScheme: 'jwt',
      }
    })
  )

  // Configure Multer for TSOA
  const multer = require('multer')
  const upload = multer({ dest: 'uploads/' })
  app.set('multer', upload)

  // Register TSOA routes
  const { RegisterRoutes } = require('./src/web/routers/routes')
  const apiRouter = express.Router()
  RegisterRoutes(apiRouter)
  app.use('/api', apiRouter)

  app.use('*', notFoundHandler)

  app.use(errorHandler)

  httpServer.listen(Number(process.env.PORT), '0.0.0.0', () => {
    console.log('\n---------------------------------------------------------')
    console.log(`[Server] Running on http://localhost:${process.env.PORT}`)
    console.log(`[Socket] WebSocket available at ws://localhost:${process.env.PORT}`)
    console.log(`[Docs] API Reference available at http://localhost:${process.env.PORT}/api-docs`)
    console.log('---------------------------------------------------------\n')
  })
}
startApp()

