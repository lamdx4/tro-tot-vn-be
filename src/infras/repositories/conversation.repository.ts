import { BaseRepository } from './base.repository'
import { Conversation } from '@/domains/entities/conversation.entity'
import { Brackets } from 'typeorm'

export class ConversationRepository extends BaseRepository<Conversation> {
  constructor() {
    super(Conversation)
  }

  async findConversationsByUser(customerId: number, search?: string, limit: number = 20, offset: number = 0) {
    // 1. Get conversation IDs the user is part of
    const qb = this.createQueryBuilder('c')
      .select(['c.conversationId', 'c.updatedAt'])
      .innerJoin('c.participants', 'p')
      .where('p.customerId = :customerId', { customerId })
      .andWhere('p.leftAt IS NULL')

    if (search) {
      qb.leftJoin('c.participants', 'other_p')
        .leftJoin('other_p.customer', 'customer')
        .andWhere(
          new Brackets(b => {
            b.where('c.groupName LIKE :search', { search: `%${search}%` })
             .orWhere('(customer.firstName LIKE :search AND customer.customerId != :customerId)', { search: `%${search}%`, customerId })
             .orWhere('(customer.lastName LIKE :search AND customer.customerId != :customerId)', { search: `%${search}%`, customerId })
          })
        )
    }

    const userConvs = await qb
      .groupBy('c.conversationId, c.updatedAt')
      .orderBy('c.updatedAt', 'DESC')
      .skip(offset)
      .take(limit)
      .getRawMany()

    if (userConvs.length === 0) return []

    const convIds = userConvs.map(c => c.conversationId || c.c_conversationId)

    // 2. Fetch full data for those conversations (including ALL participants and ONLY the LATEST message)
    return this.createQueryBuilder('conv')
      .leftJoinAndSelect('conv.participants', 'participant')
      .leftJoinAndSelect('participant.customer', 'customer')
      .leftJoinAndSelect('conv.creator', 'creator')
      // Join only the latest message
      .leftJoinAndSelect('conv.messages', 'message', 'message.messageId = (SELECT TOP 1 m2.messageId FROM Message m2 WHERE m2.conversationId = conv.conversationId ORDER BY m2.createdAt DESC)')
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

  async getUserActiveConversationIds(customerId: number): Promise<number[]> {
    const results = await this.createQueryBuilder('conv')
      .select('conv.conversationId')
      .innerJoin('conv.participants', 'p')
      .where('p.customerId = :customerId', { customerId })
      .andWhere('p.leftAt IS NULL')
      .getRawMany()

    return results.map(r => r.conv_conversationId)
  }
}

