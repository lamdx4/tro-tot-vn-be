import { BaseRepository } from './base.repository'
import { Conversation } from '@/domains/entities/conversation.entity'

export class ConversationRepository extends BaseRepository<Conversation> {
  constructor() {
    super(Conversation)
  }

  async findConversationsByUser(customerId: number, limit: number = 20, offset: number = 0) {
    return this.createQueryBuilder('conv')
      .leftJoinAndSelect('conv.participants', 'participant')
      .leftJoinAndSelect('participant.customer', 'customer')
      .leftJoinAndSelect('customer.avatarFile', 'avatarFile')
      .leftJoinAndSelect('conv.messages', 'message')
      .leftJoinAndSelect('conv.creator', 'creator')
      .where('participant.customerId = :customerId', { customerId })
      .andWhere('participant.leftAt IS NULL')
      .orderBy('conv.updatedAt', 'DESC')
      .skip(offset)
      .take(limit)
      .getMany()
  }

  /**
   * Find an existing 1:1 Direct conversation between two customers.
   * Uses a scalar subquery for participant count so we avoid GROUP BY + Conversation.* (invalid on SQL Server).
   */
  async findDirectConversation(customerId1: number, customerId2: number) {
    const conv = await this.createQueryBuilder('conv')
      .innerJoin('conv.participants', 'pa', 'pa.customerId = :c1 AND pa.leftAt IS NULL', { c1: customerId1 })
      .innerJoin('conv.participants', 'pb', 'pb.customerId = :c2 AND pb.leftAt IS NULL', { c2: customerId2 })
      .where('conv.conversationType = :type', { type: 'Direct' })
      .andWhere(
        `(SELECT COUNT(*) FROM ConversationParticipant pc WHERE pc.conversationId = conv.conversationId AND pc.leftAt IS NULL) = 2`
      )
      .getOne()

    if (!conv) {
      return null
    }

    return this.findById(conv.conversationId)
  }

  async getConversationWithMessages(conversationId: number, limit: number = 20, offset: number = 0) {
    return this.createQueryBuilder('conv')
      .leftJoinAndSelect('conv.participants', 'participant')
      .leftJoinAndSelect('conv.messages', 'message')
      .leftJoinAndSelect('message.sender', 'sender')
      .where('conv.conversationId = :conversationId', { conversationId })
      .andWhere('message.deletedAt IS NULL')
      .orderBy('message.createdAt', 'DESC')
      .skip(offset)
      .take(limit)
      .getMany()
  }

  async findById(conversationId: number) {
    return this.createQueryBuilder('conv')
      .leftJoinAndSelect('conv.participants', 'participant')
      .leftJoinAndSelect('participant.customer', 'customer')
      .leftJoinAndSelect('customer.avatarFile', 'avatarFile')
      .leftJoinAndSelect('conv.creator', 'creator')
      .where('conv.conversationId = :conversationId', { conversationId })
      .getOne()
  }

  async createConversation(data: Partial<Conversation>) {
    const conversation = this.create(data)
    return this.save(conversation)
  }
}

