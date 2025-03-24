import 'reflect-metadata'

import 'dotenv/config'

import cors from 'cors'

import express from 'express'

import routerConfig from '@/web/routers/router-config.js'

import '@/web/routers/router-config'

import AppDataSource from '@/infras/db/datasource'


import compression from 'compression'
import morgan from 'morgan'
import { notFoundHandler, errorHandler } from '@/web/middlewares/error.middleware'
import seedData from '@/infras/db/seed-data/seed-data'

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

  import('@/infras/redis/redis');

  const app = express()

  app.use(cors())

  app.use(compression())

  app.use(morgan('dev'))

  app.use(express.json())
  
  app.use(express.urlencoded({extended:true})) //*******

  app.use('/api', routerConfig)

  app.use('*', notFoundHandler)

  app.use(errorHandler)

  app.listen(Number(process.env.PORT), '0.0.0.0', () => {
    console.log(`Server is running on http://localhost:${process.env.PORT}`)
  })
}
startApp()

