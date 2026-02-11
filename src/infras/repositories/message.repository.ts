import { Message } from '@/domains/entities/message.entity'
import { BaseRepository } from './base.repository'

export class MessageRepository extends BaseRepository<Message> {
  constructor() {
    super(Message)
  }

  async getConversationMessages(conversationId: number, limit: number = 20, offset: number = 0) {
    return this.createQueryBuilder('msg')
      .leftJoinAndSelect('msg.sender', 'sender')
      .where('msg.conversationId = :conversationId', { conversationId })
      .andWhere('msg.deletedAt IS NULL')
      .orderBy('msg.createdAt', 'DESC')
      .skip(offset)
      .take(limit)
      .getMany()
  }

  async getMessagesByIds(messageIds: number[]) {
    return this.createQueryBuilder('msg')
      .where('msg.messageId IN (:...ids)', { ids: messageIds })
      .getMany()
  }

  async markMessageAsRead(messageId: number) {
    return this.update({ messageId }, { status: 'Read' })
  }

  async softDeleteMessage(messageId: number) {
    return this.update({ messageId }, { deletedAt: new Date() })
  }

  async updateMessageContent(messageId: number, newContent: string) {
    return this.update({ messageId }, { content: newContent })
  }

  async createMessage(data: Partial<Message>) {
    const message = this.create(data)
    return this.save(message)
  }

  async findById(messageId: number) {
    return this.createQueryBuilder('msg')
      .leftJoinAndSelect('msg.sender', 'sender')
      .leftJoinAndSelect('msg.conversation', 'conversation')
      .where('msg.messageId = :messageId', { messageId })
      .getOne()
  }
}