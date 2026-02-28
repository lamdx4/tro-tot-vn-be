/**
 * Socket Handlers - Unit Tests
 * Tests for file upload and file sent socket events
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import { SocketHandlers } from '../src/infras/socket/socket-handlers'
import { Socket } from 'socket.io'
import { SOCKET_EVENTS } from '../src/utils/types/socket-events'

// Mock dependencies
const mockChatService = {
  isCustomerInConversation: jest.fn()
}

const mockMessageService = {
  sendMessage: jest.fn(),
  sendMessageWithAttachments: jest.fn(),
  markMessageAsRead: jest.fn()
}

const mockFileService = {
  uploadFile: jest.fn()
}

jest.mock('../src/services/chat.service', () => ({
  ChatService: jest.fn().mockImplementation(() => mockChatService)
}))

jest.mock('../src/services/message.service', () => ({
  MessageService: jest.fn().mockImplementation(() => mockMessageService)
}))

jest.mock('../src/services/file.service', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => mockFileService),
  FileService: jest.fn().mockImplementation(() => mockFileService)
}))

describe('SocketHandlers - File Events', () => {
  let handlers: SocketHandlers
  let mockSocket: Partial<Socket>
  let emitSpy: jest.SpyInstance
  let toSpy: jest.MockInstance<any, any>

  beforeEach(() => {
    jest.clearAllMocks()
    handlers = new SocketHandlers()

    // Mock socket
    emitSpy = jest.fn()
    toSpy = jest.fn().mockReturnValue({ emit: jest.fn() })
    
    mockSocket = {
      id: 'socket-123',
      data: { userId: 100 },
      emit: emitSpy,
      to: toSpy,
      join: jest.fn(),
      leave: jest.fn()
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
      expect(emitSpy).toHaveBeenCalledWith(
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

      expect(emitSpy).toHaveBeenCalledWith('error', {
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

      expect(emitSpy).toHaveBeenCalledWith(
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
        attachments: [{
          fileName: 'document.pdf',
          fileUrl: '/uploads/doc.pdf',
          fileType: 'File',
          fileSize: 2048,
          mimeType: 'application/pdf'
        }]
      }

      await handlers.handleFileSent(mockSocket as Socket, fileSentData)

      expect(toSpy).toHaveBeenCalledWith('conversation:1')
    })

    it('should reject if user is not a conversation member', async () => {
      mockChatService.isCustomerInConversation.mockResolvedValue(false)

      const fileSentData = {
        conversationId: 1,
        content: 'test',
        attachments: []
      }

      await handlers.handleFileSent(mockSocket as Socket, fileSentData)

      expect(emitSpy).toHaveBeenCalledWith('error', {
        code: 'NOT_MEMBER',
        message: 'You are not a member of this conversation'
      })
    })
  })
})

describe('Socket Events Types', () => {
  it('should have FILE_UPLOAD event defined', () => {
    expect(SOCKET_EVENTS.FILE_UPLOAD).toBe('file:upload')
  })

  it('should have FILE_UPLOADED event defined', () => {
    expect(SOCKET_EVENTS.FILE_UPLOADED).toBe('file:uploaded')
  })

  it('should have FILE_SENT event defined', () => {
    expect(SOCKET_EVENTS.FILE_SENT).toBe('file:sent')
  })

  it('should have FILE_RECEIVED event defined', () => {
    expect(SOCKET_EVENTS.FILE_RECEIVED).toBe('file:received')
  })
})

