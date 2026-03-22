/**
 * Message Controller - Unit Tests
 * Tests for file upload and download endpoints
 */

import { describe, it, expect, beforeEach } from '@jest/globals'
import { MessageController } from '../src/web/controllers/message.controller'
import { Request, Response } from 'express'
import { AttachmentType } from '../src/domains/entities/enum/value-object'

// Mock dependencies
const mockMessageService: any = {
  sendMessage: jest.fn<any, any>(),
  sendMessageWithAttachments: jest.fn<any, any>(),
  getConversationMessages: jest.fn<any, any>(),
  getMessageById: jest.fn<any, any>(),
  editMessage: jest.fn<any, any>(),
  deleteMessage: jest.fn<any, any>(),
  markMessagesAsRead: jest.fn<any, any>(),
  getMessageAttachments: jest.fn<any, any>()
}

// Mock CloudDriveService singleton
const mockCloudDriveService: any = {
  uploadFile: jest.fn<any, any>(),
  getFileUrl: jest.fn<any, any>()
}

// Mock the service modules - need to handle singleton pattern
jest.mock('../src/services/message.service', () => ({
  MessageService: jest.fn<any, any>().mockImplementation(() => mockMessageService)
}))

jest.mock('../src/services/google-drive.service', () => {
  const MockCloudDriveService = jest.fn<any, any>().mockImplementation(() => mockCloudDriveService)
  ;(MockCloudDriveService as any).gI = jest.fn(() => mockCloudDriveService)
  return {
    __esModule: true,
    default: MockCloudDriveService
  }
})

describe('MessageController - File Upload/Download', () => {
  let controller: MessageController
  let mockReq: Partial<Request>
  let mockRes: any
  let jsonSpy: jest.Mock<any, any>
  let statusSpy: jest.Mock<any, any>

  beforeEach(() => {
    jest.clearAllMocks()
    controller = new MessageController()

    jsonSpy = jest.fn<any, any>()
    statusSpy = jest.fn<any, any>().mockReturnValue({ json: jsonSpy })

    mockReq = {
      params: { conversationId: '1', fileId: '1' },
      body: { content: 'Test file' },
      user: { customer: { customerId: 100 }, userId: 100 } as any,
      file: {
        originalname: 'test-image.jpg',
        mimetype: 'image/jpeg',
        size: 1024,
        path: '/uploads/test-image.jpg'
      } as any
    }

    mockRes = {
      status: statusSpy,
      json: jsonSpy
    }
  })

  describe('uploadFile', () => {
    it('should upload file and create message with attachment', async () => {
      mockCloudDriveService.uploadFile.mockResolvedValue('cloud-file-123')

      const mockMessage = {
        messageId: 1,
        conversationId: 1,
        senderId: 100,
        content: 'Test file',
        messageType: AttachmentType.IMAGE,
        attachments: []
      }

      mockMessageService.sendMessageWithAttachments.mockResolvedValue(mockMessage)

      await controller.uploadFile(mockReq as Request, mockRes as Response)

      expect(statusSpy).toHaveBeenCalledWith(201)
      expect(jsonSpy).toHaveBeenCalled()
    })

    it('should return 401 when user is not authenticated', async () => {
      mockReq.user = undefined

      await controller.uploadFile(mockReq as Request, mockRes as Response)

      expect(statusSpy).toHaveBeenCalledWith(401)
    })

    it('should return 400 when no file is uploaded', async () => {
      mockReq.file = undefined

      await controller.uploadFile(mockReq as Request, mockRes as Response)

      expect(statusSpy).toHaveBeenCalledWith(400)
    })
  })

  describe('getFileDownloadUrl', () => {
    it('should return download URL for file with cloud ID', async () => {
      const mockAttachments = [
        {
          attachmentId: 1,
          fileName: 'test.jpg',
          fileUrl: '/uploads/test.jpg',
          fileType: 'Image',
          fileSize: 1024,
          mimeType: 'image/jpeg',
          cloudFileId: 'cloud-123'
        }
      ]

      mockMessageService.getMessageAttachments.mockResolvedValue(mockAttachments)
      mockCloudDriveService.getFileUrl.mockResolvedValue('https://drive.google.com/file')

      await controller.getFileDownloadUrl(mockReq as Request, mockRes as Response)

      expect(statusSpy).toHaveBeenCalledWith(200)
      expect(jsonSpy).toHaveBeenCalled()
    })

    it('should return 404 when file not found', async () => {
      mockMessageService.getMessageAttachments.mockResolvedValue([])

      await controller.getFileDownloadUrl(mockReq as Request, mockRes as Response)

      expect(statusSpy).toHaveBeenCalledWith(404)
    })
  })
})
