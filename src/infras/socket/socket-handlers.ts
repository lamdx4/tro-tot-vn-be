import { Socket } from 'socket.io'
import { SOCKET_EVENTS, MessageSentEvent, MessageReadEvent, TypingEvent, FileUploadEvent, FileSentEvent, FileSentEventInput } from '@/utils/types/socket-events'
import { ChatService, MessageService, FileService } from '@/services'
import ResponseData from '@/utils/data-types/response'

/**
 * Socket event handlers for chat functionality
 */
export class SocketHandlers {
  private chatService: ChatService
  private messageService: MessageService
  private fileService: FileService

  constructor() {
    this.chatService = new ChatService()
    this.messageService = new MessageService()
    this.fileService = new FileService()
  }

  /**
   * Wrap payload in REST-style envelope: { status, data }
   */
  private wrap<T>(data: T, status = 200): { status: number; data: T } {
    return { status, data }
  }

  /**
   * Emit error to socket (direct reply to sender)
   */
  private emitError(socket: Socket, code: string, message: string, status = 500): void {
    const response = ResponseData.error(status, message, code)
    socket.emit('error', {
      code: response.error[0] || code,
      message: response.message,
      status: response.status
    })
  }

  /**
   * Handle user connection
   */
  handleConnection(socket: Socket): void {
    const userId = socket.data.userId as number

    console.log(`[Socket] User connected: ${userId}`)

    // Join user's personal room
    socket.join(`user:${userId}`)

    // Emit online status
    socket.broadcast.emit(SOCKET_EVENTS.USER_ONLINE, {
      userId,
      isOnline: true,
      timestamp: new Date()
    })
  }

  /**
   * Handle user disconnection
   */
  async handleDisconnect(socket: Socket): Promise<void> {
    const userId = socket.data.userId as number

    console.log(`[Socket] User disconnected: ${userId}`)

    // Emit offline status
    socket.broadcast.emit(SOCKET_EVENTS.USER_OFFLINE, {
      userId,
      isOnline: false,
      timestamp: new Date()
    })
  }

  /**
   * Handle sending a message
   */
  async handleMessageSent(socket: Socket, data: MessageSentEvent): Promise<void> {
    try {
      const userId = socket.data.userId as number
      const { conversationId, content, messageType = 'Text' } = data

      // Verify user is in conversation
      // TODO: using cache user<->conversation to avoid DB call
      const isMember = await this.chatService.isCustomerInConversation(conversationId, userId)

      if (!isMember) {
        this.emitError(socket, 'NOT_MEMBER', 'You are not a member of this conversation', 403)
        return
      }

      // Create message
      const message = await this.messageService.sendMessage(
        conversationId,
        userId,
        { content, messageType, conversationId }
      )

      const eventData: MessageSentEvent = {
        messageId: message.messageId,
        conversationId: message.conversationId,
        senderId: message.senderId,
        content: message.content,
        messageType: message.messageType,
        createdAt: message.createdAt
      }

      // Broadcast to room (exclude sender — raw, no wrap)
      socket.to(`conversation:${conversationId}`).emit(
        SOCKET_EVENTS.MESSAGE_RECEIVED,
        eventData
      )

      // Acknowledge to sender (direct reply — wrapped)
      socket.emit(SOCKET_EVENTS.MESSAGE_SENT, this.wrap(eventData))
    } catch (error: any) {
      console.error('[Socket] Error sending message:', error)
      this.emitError(socket, 'MESSAGE_SEND_ERROR', error.message)
    }
  }

  /**
   * Handle marking a message as read
   */
  async handleMessageRead(socket: Socket, data: MessageReadEvent): Promise<void> {
    try {
      const userId = socket.data.userId as number
      const { messageId, conversationId } = data

      // Mark as read
      await this.messageService.markMessageAsRead(messageId)

      // Notify other participants in conversation (broadcast — raw, no wrap)
      socket.to(`conversation:${conversationId}`).emit(
        SOCKET_EVENTS.MESSAGE_READ,
        {
          messageId,
          conversationId,
          readBy: userId,
          readAt: new Date()
        }
      )
    } catch (error: any) {
      console.error('[Socket] Error marking message as read:', error)
      this.emitError(socket, 'MESSAGE_READ_ERROR', error.message)
    }
  }

  /**
   * Handle typing indicator start
   */
  handleTypingStart(socket: Socket, data: TypingEvent): void {
    const userId = socket.data.userId as number
    const { conversationId } = data

    socket.to(`conversation:${conversationId}`).emit(
      SOCKET_EVENTS.TYPING_START,
      {
        conversationId,
        userId,
        isTyping: true
      }
    )
  }

  /**
   * Handle typing indicator stop
   */
  handleTypingStop(socket: Socket, data: TypingEvent): void {
    const userId = socket.data.userId as number
    const { conversationId } = data

    socket.to(`conversation:${conversationId}`).emit(
      SOCKET_EVENTS.TYPING_STOP,
      {
        conversationId,
        userId,
        isTyping: false
      }
    )
  }

  /**
   * Handle joining a conversation room
   */
  handleJoinConversation(socket: Socket, conversationId: number): void {
    const userId = socket.data.userId as number

    socket.join(`conversation:${conversationId}`)
    console.log(`[Socket] User ${userId} joined conversation:${conversationId}`)

    // Notify others in conversation (broadcast — raw, no wrap)
    socket.to(`conversation:${conversationId}`).emit(
      SOCKET_EVENTS.PARTICIPANT_JOINED,
      {
        conversationId,
        userId,
        timestamp: new Date()
      }
    )
  }

  /**
   * Handle leaving a conversation room
   */
  handleLeaveConversation(socket: Socket, conversationId: number): void {
    const userId = socket.data.userId as number

    socket.leave(`conversation:${conversationId}`)
    console.log(`[Socket] User ${userId} left conversation:${conversationId}`)

    // Notify others in conversation (broadcast — raw, no wrap)
    socket.to(`conversation:${conversationId}`).emit(
      SOCKET_EVENTS.PARTICIPANT_LEFT,
      {
        conversationId,
        userId,
        timestamp: new Date()
      }
    )
  }

  /**
   * Handle file upload via socket
   * For small files sent directly through socket
   */
  async handleFileUpload(socket: Socket, data: FileUploadEvent): Promise<void> {
    try {
      const userId = socket.data.userId as number
      const { conversationId, fileName, fileSize, mimeType, fileType } = data

      // Verify user is in conversation
      const isMember = await this.chatService.isCustomerInConversation(conversationId, userId)
      if (!isMember) {
        this.emitError(socket, 'NOT_MEMBER', 'You are not a member of this conversation', 403)
        return
      }

      // Generate file URL (in production, this would upload to cloud storage)
      // For now, we'll use a local path
      const fileUrl = `/uploads/messages/${Date.now()}-${fileName}`

      // Acknowledge to sender (direct reply — wrapped)
      socket.emit(SOCKET_EVENTS.FILE_UPLOADED, this.wrap({
        fileName,
        fileUrl,
        fileSize,
        mimeType,
        fileType,
        uploadStatus: 'pending' // Client should now send the actual file via HTTP
      }))
    } catch (error: any) {
      console.error('[Socket] Error handling file upload:', error)
      this.emitError(socket, 'FILE_UPLOAD_ERROR', error.message)
    }
  }

  /**
   * Handle file message sent (after HTTP upload completes)
   */
  async handleFileSent(socket: Socket, data: FileSentEventInput): Promise<void> {
    try {
      const userId = socket.data.userId as number
      const { conversationId, content, attachments } = data

      // Verify user is in conversation
      const isMember = await this.chatService.isCustomerInConversation(conversationId, userId)
      if (!isMember) {
        this.emitError(socket, 'NOT_MEMBER', 'You are not a member of this conversation', 403)
        return
      }

      // Determine message type based on attachments
      const messageType = attachments?.[0]?.fileType === 'Image' ? 'Image' : 'File'

      // Get file name from first attachment for content fallback
      const firstFileName = attachments?.[0]?.fileName || 'File'

      // Create message with attachments using the service
      const message = await this.messageService.sendMessageWithAttachments(
        conversationId,
        userId,
        { conversationId, content: content || firstFileName, messageType },
        attachments.map(att => ({
          fileName: att.fileName,
          fileUrl: att.fileUrl,
          fileType: att.fileType,
          fileSize: att.fileSize,
          mimeType: att.mimeType
        }))
      )

      const eventData: FileSentEvent = {
        messageId: message.messageId,
        conversationId: message.conversationId,
        senderId: message.senderId,
        content: message.content,
        messageType: message.messageType,
        attachments: message.attachments || [],
        createdAt: message.createdAt
      }

      // Broadcast to room (exclude sender — raw, no wrap)
      socket.to(`conversation:${conversationId}`).emit(
        SOCKET_EVENTS.FILE_RECEIVED,
        eventData
      )

      // Acknowledge to sender (direct reply — wrapped)
      socket.emit(SOCKET_EVENTS.FILE_SENT, this.wrap(eventData))
    } catch (error: any) {
      console.error('[Socket] Error sending file message:', error)
      this.emitError(socket, 'FILE_SEND_ERROR', error.message)
    }
  }
}