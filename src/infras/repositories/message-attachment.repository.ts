import { MessageAttachment } from '@/domains/entities/message-attachment.entity'
import { BaseRepository } from './base.repository'

export class MessageAttachmentRepository extends BaseRepository<MessageAttachment> {
  constructor() {
    super(MessageAttachment)
  }

  async findByMessageId(messageId: number) {
    return this.find({
      where: { messageId },
      order: { createdAt: 'ASC' }
    })
  }

  async findByMessageIds(messageIds: number[]) {
    return this.createQueryBuilder('attachment')
      .where('attachment.messageId IN (:...messageIds)', { messageIds })
      .orderBy('attachment.messageId', 'ASC')
      .addOrderBy('attachment.createdAt', 'ASC')
      .getMany()
  }
}

