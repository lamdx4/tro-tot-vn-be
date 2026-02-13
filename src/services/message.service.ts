import { MessageRepository } from '@/infras/repositories'
import { Message } from '@/domains/entities/message.entity'
import { SendMessageInput, MessageDTO, EditMessageInput, MessageQuery } from '@/utils/types/chat.types'
import { MessageStatus, MessageType } from '@/domains/entities/enum/value-object'

export class MessageService {
  private messageRepo: MessageRepository

  constructor() {
    this.messageRepo = new MessageRepository()
  }

  /**
   * Send a new message
   */
  async sendMessage(
    conversationId: number,
    senderId: number,
    input: SendMessageInput
  ): Promise<MessageDTO> {
    const { content, messageType = MessageType.TEXT } = input

    const message = await this.messageRepo.createMessage({
      conversationId,
      senderId,
      content,
      messageType,
      status: MessageStatus.SENT
    })

    // Fetch full message with relationships
    const fullMessage = await this.messageRepo.findById(message.messageId)

    return this.toMessageDTO(fullMessage!)
  }

  /**
   * Get messages for a conversation with pagination
   */
  async getConversationMessages(query: MessageQuery): Promise<MessageDTO[]> {
    const { conversationId, limit = 20, offset = 0 } = query

    const messages = await this.messageRepo.getConversationMessages(
      conversationId,
      limit,
      offset
    )

    return messages.map(msg => this.toMessageDTO(msg))
  }

  /**
   * Get a single message by ID
   */
  async getMessageById(messageId: number): Promise<MessageDTO | null> {
    const message = await this.messageRepo.findById(messageId)

    if (!message) {
      return null
    }

    return this.toMessageDTO(message)
  }

  /**
   * Mark a message as read
   */
  async markMessageAsRead(messageId: number): Promise<void> {
    await this.messageRepo.markMessageAsRead(messageId)
  }

  /**
   * Mark multiple messages as read
   */
  async markMessagesAsRead(messageIds: number[]): Promise<void> {
    for (const messageId of messageIds) {
      await this.messageRepo.markMessageAsRead(messageId)
    }
  }

  /**
   * Edit a message
   */
  async editMessage(messageId: number, input: EditMessageInput): Promise<MessageDTO> {
    const { content } = input

    await this.messageRepo.updateMessageContent(messageId, content)

    const message = await this.messageRepo.findById(messageId)

    if (!message) {
      throw new Error('Message not found')
    }

    return this.toMessageDTO(message)
  }

  /**
   * Soft delete a message
   */
  async deleteMessage(messageId: number): Promise<void> {
    await this.messageRepo.softDeleteMessage(messageId)
  }

  /**
   * Get messages by IDs
   */
  async getMessagesByIds(messageIds: number[]): Promise<MessageDTO[]> {
    const messages = await this.messageRepo.getMessagesByIds(messageIds)

    return messages.map(msg => this.toMessageDTO(msg))
  }

  /**
   * Convert Message entity to DTO
   */
  private toMessageDTO(message: Message): MessageDTO {
    return {
      messageId: message.messageId,
      conversationId: message.conversationId,
      senderId: message.senderId,
      content: message.content,
      messageType: message.messageType,
      status: message.status,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
      deletedAt: message.deletedAt
    }
  }
}

