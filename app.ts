// Preload environment variables BEFORE any other imports
import './src/preload-env'

import 'reflect-metadata'

import cors from 'cors'

import express from 'express'
import { createServer } from 'http'

import routerConfig from '@/web/routers/router-config.js'

import '@/web/routers/router-config'

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
    console.log('Database connected')
  } catch (e) {
    console.error(e)
    process.exit(1)
  }

  // Temporarily disabled seed data for testing
  // try {
  //   await seedData()
  // } catch (e) {
  //   console.error(e)
  // }

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

  app.use('/api', routerConfig)

  app.use('*', notFoundHandler)

  app.use(errorHandler)

  httpServer.listen(Number(process.env.PORT), '0.0.0.0', () => {
    console.log(`Server is running on http://localhost:${process.env.PORT}`)
    console.log(`WebSocket available at ws://localhost:${process.env.PORT}`)
  })
}
startApp()

