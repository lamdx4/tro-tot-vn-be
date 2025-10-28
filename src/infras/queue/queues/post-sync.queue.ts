import { Queue } from 'bullmq'
import { queueConfig } from '../queue.config'

export enum SyncOperation {
  INSERT = 'insert',
  UPDATE = 'update',
  DELETE = 'delete'
}

export interface PostSyncJob {
  operation: SyncOperation
  postId: number
  data?: {
    title: string
    description: string
    price: number
    acreage: number
    city: string
    district: string
    ward: string
    street: string
    streetNumber: string
    interiorCondition: string
    ownerId: number
    createdAt: Date | number
    extendedAt: Date | number
  }
}

export const postSyncQueue = new Queue<PostSyncJob>('post-sync', queueConfig)


