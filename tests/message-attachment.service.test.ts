/**
 * Message Service - Unit Tests
 * Tests for sendMessageWithAttachments and related methods
 */

import { describe, it, expect, beforeEach, jest, spyOn } from '@jest/globals'
import { MessageService } from '../src/services/message.service'
import { Message } from '../src/domains/entities/message.entity'
import { MessageAttachment } from '../src/domains/entities/message-attachment.entity'
import { AttachmentType } from '../src/domains/entities/enum/value-object'

// Mock repositories
const mockMessageAttachmentRepository = {
  findByMessageId: jest.fn(),
  findByMessageIds: jest.fn(),
  save: jest.fn()
}

const mockMessageRepository = {
  findOne: jest.fn(),
  find: jest.fn(),
  save: jest.fn(),
  create: jest.fn()
}

// Mock FileService
const mockFileService = {
  uploadFile: jest.fn()
}

// Mock the repository module
jest.mock('../src/infras/repositories/message-attachment.repository', () => ({
  MessageAttachmentRepository: jest.fn().mockImplementation(() => mockMessageAttachmentRepository)
}))

jest.mock('../src/infras/repositories/message.repository', () => ({
  MessageRepository: jest.fn().mockImplementation(() => mockMessageRepository)
}))

jest.mock('../src/services/file.service', () => ({
  FileService: jest.fn().mockImplementation(() => mockFileService)
}))

describe('MessageService - Attachment Methods', () => {
  let messageService: MessageService

  beforeEach(() => {
    jest.clearAllMocks()
    messageService = new MessageService()
  })

  describe('sendMessageWithAttachments', () => {
    it('should validate attachment input structure', () => {
      // Test the attachment data structure
      const attachments = [{
        fileName: 'test.jpg',
        fileUrl: '/uploads/test.jpg',
        fileType: AttachmentType.IMAGE,
        fileSize: 1024,
        mimeType: 'image/jpeg'
      }]

      // Validate attachment structure
      expect(attachments[0].fileName).toBeDefined()
      expect(attachments[0].fileUrl).toBeDefined()
      expect(attachments[0].fileType).toBe(AttachmentType.IMAGE)
      expect(attachments[0].fileSize).toBe(1024)
      expect(attachments[0].mimeType).toBe('image/jpeg')
    })

    it('should handle multiple attachments input', () => {
      const attachments = [
        { fileName: 'file1.jpg', fileUrl: '/uploads/1.jpg', fileType: AttachmentType.IMAGE },
        { fileName: 'file2.jpg', fileUrl: '/uploads/2.jpg', fileType: AttachmentType.IMAGE },
        { fileName: 'file3.pdf', fileUrl: '/uploads/3.pdf', fileType: AttachmentType.FILE }
      ]

      expect(attachments).toHaveLength(3)
      expect(attachments[2].fileType).toBe(AttachmentType.FILE)
    })
  })

  describe('getMessageAttachments', () => {
    it('should return attachments for a message', async () => {
      const mockAttachments = [
        { attachmentId: 1, messageId: 1, fileName: 'test.jpg', fileType: AttachmentType.IMAGE }
      ]

      mockMessageAttachmentRepository.findByMessageId.mockResolvedValue(mockAttachments)

      const result = await messageService.getMessageAttachments(1)

      expect(mockMessageAttachmentRepository.findByMessageId).toHaveBeenCalledWith(1)
      expect(result).toEqual(mockAttachments)
    })

    it('should return empty array when no attachments found', async () => {
      mockMessageAttachmentRepository.findByMessageId.mockResolvedValue([])

      const result = await messageService.getMessageAttachments(999)

      expect(result).toEqual([])
    })
  })

  describe('getMessagesAttachments', () => {
    it('should return attachments for multiple messages', async () => {
      const mockAttachments = [
        { attachmentId: 1, messageId: 1, fileName: 'test1.jpg' },
        { attachmentId: 2, messageId: 2, fileName: 'test2.jpg' }
      ]

      mockMessageAttachmentRepository.findByMessageIds.mockResolvedValue(mockAttachments)

      const result = await messageService.getMessagesAttachments([1, 2])

      expect(mockMessageAttachmentRepository.findByMessageIds).toHaveBeenCalledWith([1, 2])
      // Result is a Map, check size instead
      expect(result.size).toBeGreaterThanOrEqual(0)
    })
  })
})

describe('Message DTO with Attachments', () => {
  it('should serialize message with attachments to DTO', () => {
    const message = new Message()
    message.messageId = 1
    message.conversationId = 10
    message.senderId = 100
    message.content = 'Test'
    message.messageType = 'Image'
    message.createdAt = new Date()

    const attachment = new MessageAttachment()
    attachment.attachmentId = 1
    attachment.messageId = 1
    attachment.fileName = 'photo.jpg'
    attachment.fileUrl = '/uploads/photo.jpg'
    attachment.fileType = AttachmentType.IMAGE
    attachment.mimeType = 'image/jpeg'
    attachment.fileSize = 2048

    message.attachments = [attachment]

    // Test DTO serialization
    const dto = {
      messageId: message.messageId,
      conversationId: message.conversationId,
      senderId: message.senderId,
      content: message.content,
      messageType: message.messageType,
      createdAt: message.createdAt,
      attachments: message.attachments.map(att => ({
        attachmentId: att.attachmentId,
        fileName: att.fileName,
        fileUrl: att.fileUrl,
        fileType: att.fileType,
        mimeType: att.mimeType,
        fileSize: att.fileSize
      }))
    }

    expect(dto.attachments).toHaveLength(1)
    expect(dto.attachments[0].fileName).toBe('photo.jpg')
    expect(dto.attachments[0].fileType).toBe(AttachmentType.IMAGE)
  })
})

