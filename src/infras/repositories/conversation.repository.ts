import { BaseRepository } from './base.repository'
import { Conversation } from '@/domains/entities/conversation.entity'

export class ConversationRepository extends BaseRepository<Conversation> {
  constructor() {
    super(Conversation)
  }

  async findConversationsByUser(customerId: number, limit: number = 20, offset: number = 0) {
    return this.createQueryBuilder('conv')
      .leftJoinAndSelect('conv.participants', 'participant')
      .leftJoinAndSelect('conv.messages', 'message')
      .leftJoinAndSelect('conv.creator', 'creator')
      .where('participant.customerId = :customerId', { customerId })
      .andWhere('participant.leftAt IS NULL')
      .orderBy('conv.updatedAt', 'DESC')
      .skip(offset)
      .take(limit)
      .getMany()
  }

  async findDirectConversation(customerId1: number, customerId2: number) {
    return this.createQueryBuilder('conv')
      .leftJoinAndSelect('conv.participants', 'p1')
      .where('conv.conversationType = :type', { type: 'Direct' })
      .andWhere('p1.customerId IN (:...customerIds)', { customerIds: [customerId1, customerId2] })
      .groupBy('conv.conversationId')
      .having('COUNT(p1.participantId) = 2')
      .getOne()
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
      .leftJoinAndSelect('conv.creator', 'creator')
      .where('conv.conversationId = :conversationId', { conversationId })
      .getOne()
  }

  async createConversation(data: Partial<Conversation>) {
    const conversation = this.create(data)
    return this.save(conversation)
  }
}

