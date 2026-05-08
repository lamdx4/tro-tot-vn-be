import { MessageRepository, MessageAttachmentRepository } from '@/infras/repositories'
import { Message } from '@/domains/entities/message.entity'
import { MessageAttachment } from '@/domains/entities/message-attachment.entity'
import { SendMessageInput, MessageDTO, EditMessageInput, MessageQuery, AttachmentDTO } from '@/utils/types/chat.types'
import { MessageStatus, MessageType, AttachmentType } from '@/domains/entities/enum/value-object'

export class MessageService {
  private messageRepo: MessageRepository
  private attachmentRepo: MessageAttachmentRepository

  constructor() {
    this.messageRepo = new MessageRepository()
    this.attachmentRepo = new MessageAttachmentRepository()
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
   * Get messages since a specific timestamp for a user across all conversations
   */
  async getMessagesSince(customerId: number, since: Date, limit: number = 100): Promise<MessageDTO[]> {
    const messages = await this.messageRepo.findMessagesSince(customerId, since, limit)
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
   * Send a message with attachment(s)
   */
  async sendMessageWithAttachments(
    conversationId: number,
    senderId: number,
    input: SendMessageInput,
    attachments: Omit<AttachmentDTO, 'attachmentId' | 'messageId' | 'createdAt'>[]
  ): Promise<MessageDTO> {
    const { content, messageType = MessageType.TEXT } = input

    // Determine message type based on attachments if not provided
    let finalMessageType = messageType
    if (attachments.length > 0 && messageType === MessageType.TEXT) {
      const firstAttachment = attachments[0]
      if (firstAttachment.fileType === AttachmentType.IMAGE) {
        finalMessageType = MessageType.IMAGE
      } else if (firstAttachment.fileType === AttachmentType.FILE) {
        finalMessageType = MessageType.FILE
      }
    }

    // Create message first
    const message = await this.messageRepo.createMessage({
      conversationId,
      senderId,
      content,
      messageType: finalMessageType,
      status: MessageStatus.SENT
    })

    // Create attachments
    for (const attachment of attachments) {
      await this.attachmentRepo.save({
        messageId: message.messageId,
        fileName: attachment.fileName,
        fileUrl: attachment.fileUrl,
        fileType: attachment.fileType,
        fileSize: attachment.fileSize,
        mimeType: attachment.mimeType,
        cloudFileId: attachment.cloudFileId,
        fileId: attachment.fileId
      })
    }

    // Fetch full message with relationships
    const fullMessage = await this.messageRepo.findById(message.messageId)

    return this.toMessageDTO(fullMessage!)
  }

  /**
   * Get attachments for a message
   */
  async getMessageAttachments(messageId: number): Promise<AttachmentDTO[]> {
    const attachments = await this.attachmentRepo.findByMessageId(messageId)
    return attachments.map(att => this.toAttachmentDTO(att))
  }

  /**
   * Get attachments for multiple messages
   */
  async getMessagesAttachments(messageIds: number[]): Promise<Map<number, AttachmentDTO[]>> {
    const attachments = await this.attachmentRepo.findByMessageIds(messageIds)

    const attachmentMap = new Map<number, AttachmentDTO[]>()
    for (const att of attachments) {
      const list = attachmentMap.get(att.messageId) || []
      list.push(this.toAttachmentDTO(att))
      attachmentMap.set(att.messageId, list)
    }

    return attachmentMap
  }

  /**
   * Convert Attachment entity to DTO
   */
  private toAttachmentDTO(attachment: MessageAttachment): AttachmentDTO {
    return {
      attachmentId: attachment.attachmentId,
      messageId: attachment.messageId,
      fileName: attachment.fileName,
      fileUrl: attachment.fileUrl,
      fileType: attachment.fileType,
      fileSize: attachment.fileSize,
      mimeType: attachment.mimeType,
      cloudFileId: attachment.cloudFileId,
      fileId: attachment.fileId,
      createdAt: attachment.createdAt
    }
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
      deletedAt: message.deletedAt,
      attachments: message.attachments?.map(att => this.toAttachmentDTO(att)) || []
    }
  }
}

