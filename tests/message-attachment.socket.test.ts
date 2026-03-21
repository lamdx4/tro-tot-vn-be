/**
 * Socket Handlers - Unit Tests
 * Tests for file upload and file sent socket events
 */

import { describe, it, expect, beforeEach } from '@jest/globals'
import { SocketHandlers } from '../src/infras/socket/socket-handlers'
import { Socket } from 'socket.io'
import { SOCKET_EVENTS } from '../src/utils/types/socket-events'

// Mock dependencies
const mockChatService: any = {
  isCustomerInConversation: jest.fn<any, any>()
}

const mockMessageService: any = {
  sendMessage: jest.fn<any, any>(),
  sendMessageWithAttachments: jest.fn<any, any>(),
  markMessageAsRead: jest.fn<any, any>()
}

const mockFileService: any = {
  uploadFile: jest.fn<any, any>()
}

jest.mock('../src/services/chat.service', () => ({
  ChatService: jest.fn<any, any>().mockImplementation(() => mockChatService)
}))

jest.mock('../src/services/message.service', () => ({
  MessageService: jest.fn<any, any>().mockImplementation(() => mockMessageService)
}))

jest.mock('../src/services/file.service', () => ({
  __esModule: true,
  default: jest.fn<any, any>().mockImplementation(() => mockFileService),
  FileService: jest.fn<any, any>().mockImplementation(() => mockFileService)
}))

describe('SocketHandlers - File Events', () => {
  let handlers: SocketHandlers
  let mockSocket: any

  beforeEach(() => {
    jest.clearAllMocks()
    handlers = new SocketHandlers()

    mockSocket = {
      id: 'socket-123',
      data: { userId: 100 },
      emit: jest.fn<any, any>(),
      to: jest.fn<any, any>().mockReturnValue({ emit: jest.fn<any, any>() }),
      join: jest.fn<any, any>(),
      leave: jest.fn<any, any>()
    }
  })

  describe('handleFileUpload', () => {
    it('should emit FILE_UPLOADED event with file info', async () => {
      mockChatService.isCustomerInConversation.mockResolvedValue(true)

      const fileData = {
        conversationId: 1,
        fileName: 'test-image.jpg',
        fileSize: 1024000,
        mimeType: 'image/jpeg',
        fileType: 'Image'
      }

      await handlers.handleFileUpload(mockSocket as Socket, fileData)

      expect(mockChatService.isCustomerInConversation).toHaveBeenCalledWith(1, 100)
      expect(mockSocket.emit).toHaveBeenCalledWith(
        SOCKET_EVENTS.FILE_UPLOADED,
        expect.objectContaining({
          fileName: 'test-image.jpg',
          fileSize: 1024000,
          mimeType: 'image/jpeg',
          fileType: 'Image',
          uploadStatus: 'pending'
        })
      )
    })

    it('should reject if user is not a conversation member', async () => {
      mockChatService.isCustomerInConversation.mockResolvedValue(false)

      const fileData = {
        conversationId: 1,
        fileName: 'test.jpg',
        fileSize: 1000,
        mimeType: 'image/jpeg',
        fileType: 'Image'
      }

      await handlers.handleFileUpload(mockSocket as Socket, fileData)

      expect(mockSocket.emit).toHaveBeenCalledWith('error', {
        code: 'NOT_MEMBER',
        message: 'You are not a member of this conversation'
      })
    })
  })

  describe('handleFileSent', () => {
    it('should create message with attachments and emit FILE_SENT', async () => {
      mockChatService.isCustomerInConversation.mockResolvedValue(true)

      const mockMessage = {
        messageId: 1,
        conversationId: 1,
        senderId: 100,
        content: 'test.jpg',
        messageType: 'Image',
        createdAt: new Date(),
        attachments: [{
          attachmentId: 1,
          fileName: 'test.jpg',
          fileUrl: '/uploads/test.jpg',
          fileType: 'Image',
          fileSize: 1024,
          mimeType: 'image/jpeg'
        }]
      }

      mockMessageService.sendMessageWithAttachments.mockResolvedValue(mockMessage)

      const fileSentData = {
        conversationId: 1,
        content: 'Check this image!',
        messageType: 'Image',
        attachments: [{
          fileName: 'test.jpg',
          fileUrl: '/uploads/test.jpg',
          fileType: 'Image',
          fileSize: 1024,
          mimeType: 'image/jpeg'
        }]
      }

      await handlers.handleFileSent(mockSocket as Socket, fileSentData)

      expect(mockMessageService.sendMessageWithAttachments).toHaveBeenCalledWith(
        1,
        100,
        { conversationId: 1, content: 'Check this image!', messageType: 'Image' },
        expect.arrayContaining([
          expect.objectContaining({
            fileName: 'test.jpg',
            fileType: 'Image'
          })
        ])
      )

      expect(mockSocket.emit).toHaveBeenCalledWith(
        SOCKET_EVENTS.FILE_SENT,
        expect.objectContaining({
          messageId: 1,
          conversationId: 1,
          attachments: expect.any(Array)
        })
      )
    })

    it('should emit FILE_RECEIVED to other participants', async () => {
      mockChatService.isCustomerInConversation.mockResolvedValue(true)

      const mockMessage = {
        messageId: 2,
        conversationId: 1,
        senderId: 100,
        content: 'file.pdf',
        messageType: 'File',
        createdAt: new Date(),
        attachments: []
      }

      mockMessageService.sendMessageWithAttachments.mockResolvedValue(mockMessage)

      const fileSentData = {
        conversationId: 1,
        content: 'Sending a file',
        messageType: 'File',
        attachments: [{
          fileName: 'document.pdf',
          fileUrl: '/uploads/doc.pdf',
          fileType: 'File',
          fileSize: 2048,
          mimeType: 'application/pdf'
        }]
      }

      await handlers.handleFileSent(mockSocket as Socket, fileSentData)

      expect(mockSocket.to).toHaveBeenCalledWith('conversation:1')
    })

    it('should reject if user is not a conversation member', async () => {
      mockChatService.isCustomerInConversation.mockResolvedValue(false)

      const fileSentData = {
        conversationId: 1,
        content: 'test',
        messageType: 'File',
        attachments: []
      }

      await handlers.handleFileSent(mockSocket as Socket, fileSentData)

      expect(mockSocket.emit).toHaveBeenCalledWith('error', {
        code: 'NOT_MEMBER',
        message: 'You are not a member of this conversation'
      })
    })
  })
})
