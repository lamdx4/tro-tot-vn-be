import { EntitySubscriberInterface, EventSubscriber, InsertEvent, UpdateEvent, RemoveEvent } from 'typeorm'
import { Customer } from '@/domains/entities/customer.entity'
import { userSyncQueue, UserSyncOperation } from '@/infras/queue/queues/user-sync.queue'
import { QueueBridge } from '@/infras/queue/queue-bridge'

@EventSubscriber()
export class UserSyncSubscriber implements EntitySubscriberInterface<Customer> {
  listenTo() {
    return Customer
  }

  async afterInsert(event: InsertEvent<Customer>) {
    if (event.entity) {
      await this.syncToMilvus(UserSyncOperation.INSERT, event.entity)
    }
  }

  async afterUpdate(event: UpdateEvent<Customer>) {
    if (event.entity) {
      await this.syncToMilvus(UserSyncOperation.UPDATE, event.entity as Customer)
    }
  }

  async afterRemove(event: RemoveEvent<Customer>) {
    if (event.entityId) {
      await userSyncQueue.add('delete-user', {
        operation: UserSyncOperation.DELETE,
        customerId: Number(event.entityId)
      })
    }
  }

  private async syncToMilvus(operation: UserSyncOperation, customer: Customer) {
    try {
      const jobData = {
        operation,
        customerId: customer.customerId,
        data: {
          firstName: customer.firstName,
          lastName: customer.lastName,
          gender: customer.gender,
          birthday: customer.birthday,
          address: customer.address,
          bio: customer.bio,
          currentJob: customer.currentJob
        }
      }

      // Push to BullMQ queue
      await userSyncQueue.add(`${operation}-${customer.customerId}`, jobData)

      // Also push to simple list for Python workers
      await QueueBridge.pushToSimpleQueue('user-sync', jobData)

      console.log(`✅ [Milvus Sync] Queued ${operation} for user ${customer.customerId}`)
    } catch (error) {
      console.error(`❌ [Milvus Sync] Failed to queue ${operation} for user ${customer.customerId}:`, error)
    }
  }
}

