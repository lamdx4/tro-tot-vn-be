import { BaseRepository } from './base.repository'
import { Conversation } from '@/domains/entities/conversation.entity'

export class ConversationRepository extends BaseRepository<Conversation> {
  constructor() {
    super(Conversation)
  }

  async findConversationsByUser(customerId: number, limit: number = 20, offset: number = 0) {
    // 1. Get conversation IDs the user is part of
    const userConvs = await this.createQueryBuilder('c')
      .select('c.conversationId')
      .innerJoin('c.participants', 'p')
      .where('p.customerId = :customerId', { customerId })
      .andWhere('p.leftAt IS NULL')
      .orderBy('c.updatedAt', 'DESC')
      .skip(offset)
      .take(limit)
      .getMany()

    if (userConvs.length === 0) return []

    const convIds = userConvs.map(c => c.conversationId)

    // 2. Fetch full data for those conversations (including ALL participants)
    return this.createQueryBuilder('conv')
      .leftJoinAndSelect('conv.participants', 'participant')
      .leftJoinAndSelect('participant.customer', 'customer')
      .leftJoinAndSelect('conv.messages', 'message')
      .leftJoinAndSelect('conv.creator', 'creator')
      .where('conv.conversationId IN (:...convIds)', { convIds })
      .orderBy('conv.updatedAt', 'DESC')
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

