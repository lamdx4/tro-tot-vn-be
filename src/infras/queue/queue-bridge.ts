import { redisConnection } from './queue.config'

/**
 * Bridge to push jobs to simple Redis list
 * (Python workers consume from simple list)
 */
export class QueueBridge {
  /**
   * Push job to simple Redis list for Python consumption
   */
  static async pushToSimpleQueue(queueName: string, jobData: any) {
    const simpleQueueName = `${queueName}-simple`
    await redisConnection.rpush(simpleQueueName, JSON.stringify(jobData))
  }
}


