import 'reflect-metadata'

import 'dotenv/config'

import cors from 'cors'

import express from 'express'

import routerConfig from '@/web/routers/router-config.js'

import '@/web/routers/router-config'

import AppDataSource from '@/infras/db/datasource'


import seedData from '@/infras/db/seed-data'
import compression from 'compression'
import morgan from 'morgan'
import { notFoundHandler, errorHandler } from '@/web/middlewares/error.middleware'

async function startApp() {
  try {
    await AppDataSource.initialize()
    console.log('Database connected')
  } catch (e) {
    console.error(e)
    process.exit(1)
  }

  try {
    await seedData()
  } catch (e) {
    console.error(e)
  }

  const app = express()

  const allowedOrigins = process.env.FRONTEND_ORIGIN?.split(',') || ['http://localhost:3000'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true 
}));


  app.use(compression())

  app.use(morgan('dev'))

  app.use(express.json())

  app.use('/api', routerConfig)

  routerConfig.use('*', notFoundHandler)

  routerConfig.use(errorHandler)

  app.listen(Number(process.env.PORT), '0.0.0.0', () => {
    console.log(`Server is running on http://${process.env.HOST}:${process.env.PORT}`)
  })
}
startApp()
