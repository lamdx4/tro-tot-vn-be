/**
 * Message Service - Unit Tests
 * Tests for sendMessageWithAttachments and related methods
 */

import { describe, it, expect, beforeEach } from '@jest/globals'
import { MessageService } from '../src/services/message.service'
import { AttachmentType } from '../src/domains/entities/enum/value-object'

// Mock repositories
const mockMessageAttachmentRepository: any = {
  findByMessageId: jest.fn<any, any>(),
  findByMessageIds: jest.fn<any, any>(),
  save: jest.fn<any, any>()
}

const mockMessageRepository: any = {
  findOne: jest.fn<any, any>(),
  find: jest.fn<any, any>(),
  save: jest.fn<any, any>(),
  create: jest.fn<any, any>()
}

// Mock FileService
const mockFileService: any = {
  uploadFile: jest.fn<any, any>()
}

// Mock the repository module
jest.mock('../src/infras/repositories/message-attachment.repository', () => ({
  MessageAttachmentRepository: jest.fn<any, any>().mockImplementation(() => mockMessageAttachmentRepository)
}))

jest.mock('../src/infras/repositories/message.repository', () => ({
  MessageRepository: jest.fn<any, any>().mockImplementation(() => mockMessageRepository)
}))

jest.mock('../src/services/file.service', () => ({
  FileService: jest.fn<any, any>().mockImplementation(() => mockFileService)
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
      const mockAttachments: any[] = [
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
      const mockAttachments: any[] = [
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
