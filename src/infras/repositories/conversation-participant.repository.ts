import { BaseRepository } from './base.repository'
import { ConversationParticipant } from '@/domains/entities/conversation-participant.entity'

export class ConversationParticipantRepository extends BaseRepository<ConversationParticipant> {
  constructor() {
    super(ConversationParticipant)
  }

  async addParticipant(conversationId: number, customerId: number) {
    const participant = this.create({
      conversationId,
      customerId,
      role: 'Member'
    })
    return this.save(participant)
  }

  async removeParticipant(conversationId: number, customerId: number) {
    return this.update(
      { conversationId, customerId },
      { leftAt: new Date() }
    )
  }

  async getConversationParticipants(conversationId: number) {
    return this.createQueryBuilder('p')
      .leftJoinAndSelect('p.customer', 'customer')
      .where('p.conversationId = :conversationId', { conversationId })
      .andWhere('p.leftAt IS NULL')
      .getMany()
  }

  async findByCustomerAndConversation(customerId: number, conversationId: number) {
    return this.createQueryBuilder('p')
      .where('p.customerId = :customerId', { customerId })
      .andWhere('p.conversationId = :conversationId', { conversationId })
      .andWhere('p.leftAt IS NULL')
      .getOne()
  }

  async createParticipant(data: Partial<ConversationParticipant>) {
    const participant = this.create(data)
    return this.save(participant)
  }
}

