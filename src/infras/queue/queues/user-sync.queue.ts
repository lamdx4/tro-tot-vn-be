import { Queue } from 'bullmq'
import { queueConfig } from '../queue.config'

export enum UserSyncOperation {
  INSERT = 'insert',
  UPDATE = 'update',
  DELETE = 'delete'
}

export interface UserSyncJob {
  operation: UserSyncOperation
  customerId: number
  data?: {
    firstName: string
    lastName: string
    gender: string
    birthday?: Date
    address?: string
    bio?: string
    currentJob?: string
  }
}

export const userSyncQueue = new Queue<UserSyncJob>('user-sync', queueConfig)


