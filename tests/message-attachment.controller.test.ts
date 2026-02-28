/**
 * Message Controller - Unit Tests
 * Tests for file upload and download endpoints
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import { MessageController } from '../src/web/controllers/message.controller'
import { Request, Response } from 'express'
import { AttachmentType } from '../src/domains/entities/enum/value-object'

// Mock dependencies
const mockMessageService: any = {
  sendMessage: jest.fn(),
  sendMessageWithAttachments: jest.fn(),
  getConversationMessages: jest.fn(),
  getMessageById: jest.fn(),
  editMessage: jest.fn(),
  deleteMessage: jest.fn(),
  markMessagesAsRead: jest.fn(),
  getMessageAttachments: jest.fn()
}

// Mock CloudDriveService singleton
const mockCloudDriveService: any = {
  uploadFile: jest.fn(),
  getFileUrl: jest.fn()
}

// Mock the service modules - need to handle singleton pattern
jest.mock('../src/services/message.service', () => ({
  MessageService: jest.fn().mockImplementation(() => mockMessageService)
}))

jest.mock('../src/services/google-drive.service', () => {
  const MockCloudDriveService = jest.fn().mockImplementation(() => mockCloudDriveService)
  MockCloudDriveService.gI = jest.fn(() => mockCloudDriveService)
  return {
    __esModule: true,
    default: MockCloudDriveService
  }
})

describe('MessageController - File Upload/Download', () => {
  let controller: MessageController
  let mockReq: Partial<Request>
  let mockRes: Partial<Response>
  let jsonSpy: jest.SpyInstance
  let statusSpy: jest.SpyInstance

  beforeEach(() => {
    jest.clearAllMocks()
    controller = new MessageController()

    jsonSpy = jest.fn()
    statusSpy = jest.fn().mockReturnValue({ json: jsonSpy })

    mockReq = {
      params: { conversationId: '1', fileId: '1' },
      body: { content: 'Test file' },
      user: { customerId: 100, userId: 100 },
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
        content: 'test-image.jpg',
        messageType: 'Image',
        createdAt: new Date(),
        attachments: [{
          attachmentId: 1,
          fileName: 'test-image.jpg',
          fileUrl: '/uploads/test-image.jpg',
          fileType: AttachmentType.IMAGE,
          fileSize: 1024,
          mimeType: 'image/jpeg'
        }]
      }

      mockMessageService.sendMessageWithAttachments.mockResolvedValue(mockMessage)

      await controller.uploadFile(mockReq as Request, mockRes as Response)

      expect(mockCloudDriveService.uploadFile).toHaveBeenCalled()
      expect(mockMessageService.sendMessageWithAttachments).toHaveBeenCalledWith(
        1,
        100,
        expect.objectContaining({ messageType: AttachmentType.IMAGE }),
        expect.arrayContaining([
          expect.objectContaining({
            fileName: 'test-image.jpg',
            fileType: AttachmentType.IMAGE
          })
        ])
      )
      expect(statusSpy).toHaveBeenCalledWith(201)
    })

    it('should return 401 if user is not authenticated', async () => {
      mockReq.user = undefined

      await controller.uploadFile(mockReq as Request, mockRes as Response)

      expect(statusSpy).toHaveBeenCalledWith(401)
      expect(jsonSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({ code: 'UNAUTHORIZED' })
        })
      )
    })

    it('should return 400 if no file uploaded', async () => {
      mockReq.file = undefined

      await controller.uploadFile(mockReq as Request, mockRes as Response)

      expect(statusSpy).toHaveBeenCalledWith(400)
      expect(jsonSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({ code: 'NO_FILE' })
        })
      )
    })

    it('should handle video file type', async () => {
      mockCloudDriveService.uploadFile.mockResolvedValue('cloud-video-123')
      mockReq.file = {
        originalname: 'video.mp4',
        mimetype: 'video/mp4',
        size: 5000000,
        path: '/uploads/video.mp4'
      } as any

      const mockMessage = {
        messageId: 1,
        messageType: 'Video',
        attachments: []
      } as any

      mockMessageService.sendMessageWithAttachments.mockResolvedValue(mockMessage)

      await controller.uploadFile(mockReq as Request, mockRes as Response)

      expect(mockMessageService.sendMessageWithAttachments).toHaveBeenCalledWith(
        expect.any(Number),
        expect.any(Number),
        expect.objectContaining({ messageType: AttachmentType.VIDEO }),
        expect.any(Array)
      )
    })

    it('should handle generic file type for non-media files', async () => {
      mockCloudDriveService.uploadFile.mockResolvedValue('cloud-doc-123')
      mockReq.file = {
        originalname: 'document.pdf',
        mimetype: 'application/pdf',
        size: 2048,
        path: '/uploads/document.pdf'
      } as any

      const mockMessage = {
        messageId: 1,
        messageType: 'File',
        attachments: []
      } as any

      mockMessageService.sendMessageWithAttachments.mockResolvedValue(mockMessage)

      await controller.uploadFile(mockReq as Request, mockRes as Response)

      expect(mockMessageService.sendMessageWithAttachments).toHaveBeenCalledWith(
        expect.any(Number),
        expect.any(Number),
        expect.objectContaining({ messageType: AttachmentType.FILE }),
        expect.any(Array)
      )
    })

    it('should return 500 on upload error', async () => {
      mockCloudDriveService.uploadFile.mockRejectedValue(new Error('Upload failed'))

      await controller.uploadFile(mockReq as Request, mockRes as Response)

      expect(statusSpy).toHaveBeenCalledWith(500)
    })
  })

  describe('getFileDownloadUrl', () => {
    it('should return download URL from cloud storage', async () => {
      const mockAttachments = [{
        attachmentId: 1,
        messageId: 1,
        fileName: 'test.jpg',
        fileUrl: '/uploads/test.jpg',
        fileType: AttachmentType.IMAGE,
        fileSize: 1024,
        mimeType: 'image/jpeg',
        cloudFileId: 'cloud-123'
      }]

      mockMessageService.getMessageAttachments.mockResolvedValue(mockAttachments)
      mockCloudDriveService.getFileUrl.mockResolvedValue('https://drive.google.com/uc?id=cloud-123')

      await controller.getFileDownloadUrl(mockReq as Request, mockRes as Response)

      expect(mockCloudDriveService.getFileUrl).toHaveBeenCalledWith('cloud-123')
      expect(statusSpy).toHaveBeenCalledWith(200)
      expect(jsonSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            fileName: 'test.jpg',
            downloadUrl: 'https://drive.google.com/uc?id=cloud-123'
          })
        })
      )
    })

    it('should return local URL if no cloud file ID', async () => {
      const mockAttachments = [{
        attachmentId: 1,
        fileName: 'local-file.pdf',
        fileUrl: '/uploads/local-file.pdf',
        fileType: AttachmentType.FILE,
        fileSize: 2048,
        mimeType: 'application/pdf'
      }]

      mockMessageService.getMessageAttachments.mockResolvedValue(mockAttachments)

      await controller.getFileDownloadUrl(mockReq as Request, mockRes as Response)

      expect(mockCloudDriveService.getFileUrl).not.toHaveBeenCalled()
      expect(jsonSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            downloadUrl: '/uploads/local-file.pdf'
          })
        })
      )
    })

    it('should return 404 if attachment not found', async () => {
      mockMessageService.getMessageAttachments.mockResolvedValue([])

      await controller.getFileDownloadUrl(mockReq as Request, mockRes as Response)

      expect(statusSpy).toHaveBeenCalledWith(404)
    })

    it('should return 500 on error', async () => {
      mockMessageService.getMessageAttachments.mockRejectedValue(new Error('DB error'))

      await controller.getFileDownloadUrl(mockReq as Request, mockRes as Response)

      expect(statusSpy).toHaveBeenCalledWith(500)
    })
  })
})

