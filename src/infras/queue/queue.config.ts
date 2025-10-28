import { QueueOptions } from 'bullmq'
import Redis from 'ioredis'

export const redisConnection = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT) || 5555,
  maxRetriesPerRequest: null
})

export const queueConfig: QueueOptions = {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    },
    removeOnComplete: 1000,
    removeOnFail: 100
  }
}


