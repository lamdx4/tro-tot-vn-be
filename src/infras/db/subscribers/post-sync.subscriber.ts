import { EntitySubscriberInterface, EventSubscriber, InsertEvent, UpdateEvent, RemoveEvent } from 'typeorm'
import { Post } from '@/domains/entities/post.entity'
import { PostStatus } from '@/domains/entities/enum/value-object'
import { postSyncQueue, SyncOperation } from '@/infras/queue/queues/post-sync.queue'
import { QueueBridge } from '@/infras/queue/queue-bridge'

@EventSubscriber()
export class PostSyncSubscriber implements EntitySubscriberInterface<Post> {
  listenTo() {
    return Post
  }

  async afterInsert(event: InsertEvent<Post>) {
    // Only sync approved posts
    if (event.entity?.status === PostStatus.APPROVED) {
      await this.syncToMilvus(SyncOperation.INSERT, event.entity)
    }
  }

  async afterUpdate(event: UpdateEvent<Post>) {
    if (!event.entity) return

    const oldStatus = event.databaseEntity?.status
    const newStatus = event.entity.status

    // Case 1: Pending → Approved (new approved post)
    if (oldStatus !== PostStatus.APPROVED && newStatus === PostStatus.APPROVED) {
      await this.syncToMilvus(SyncOperation.INSERT, event.entity as Post)
    }
    // Case 2: Approved → Approved (update existing)
    else if (oldStatus === PostStatus.APPROVED && newStatus === PostStatus.APPROVED) {
      await this.syncToMilvus(SyncOperation.UPDATE, event.entity as Post)
    }
    // Case 3: Approved → Hidden/Rejected/Suspended (remove from Milvus)
    else if (oldStatus === PostStatus.APPROVED && newStatus !== PostStatus.APPROVED) {
      await this.syncToMilvus(SyncOperation.DELETE, event.entity as Post)
    }
  }

  async afterRemove(event: RemoveEvent<Post>) {
    if (event.entityId) {
      await postSyncQueue.add('delete-post', {
        operation: SyncOperation.DELETE,
        postId: Number(event.entityId)
      })
    }
  }

  private async syncToMilvus(operation: SyncOperation, post: Post) {
    try {
      const jobData: any = {
        operation,
        postId: post.postId
      }

      if (operation !== SyncOperation.DELETE) {
        jobData.data = {
          title: post.title,
          description: post.description,
          price: post.price,
          acreage: post.acreage,
          city: post.city,
          district: post.district,
          ward: post.ward,
          street: post.street,
          streetNumber: post.streetNumber,
          interiorCondition: post.interiorCondition,
          ownerId: post.ownerId,
          createdAt: post.createdAt,
          extendedAt: post.extendedAt
        }
      }

      // Push to BullMQ queue
      await postSyncQueue.add(`${operation}-${post.postId}`, jobData, {
        jobId: `${operation}-${post.postId}-${Date.now()}`
      })

      // Also push to simple list for Python workers
      await QueueBridge.pushToSimpleQueue('post-sync', jobData)

      console.log(`✅ [Milvus Sync] Queued ${operation} for post ${post.postId}`)
    } catch (error) {
      console.error(`❌ [Milvus Sync] Failed to queue ${operation} for post ${post.postId}:`, error)
    }
  }
}

