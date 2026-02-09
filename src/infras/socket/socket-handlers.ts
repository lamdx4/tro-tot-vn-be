import { Socket } from 'socket.io'
import { SOCKET_EVENTS, MessageSentEvent, MessageReadEvent, TypingEvent } from '@/utils/types/socket-events'
import { ChatService, MessageService } from '@/services'

/**
 * Socket event handlers for chat functionality
 */
export class SocketHandlers {
  private chatService: ChatService
  private messageService: MessageService

  constructor() {
    this.chatService = new ChatService()
    this.messageService = new MessageService()
  }

  /**
   * Handle user connection
   */
  handleConnection(socket: Socket): void {
    // TODO: jwt handler here
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
  handleDisconnect(socket: Socket): void {
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
        socket.emit('error', {
          code: 'NOT_MEMBER',
          message: 'You are not a member of this conversation'
        })
        return
      }

      // Create message
      const message = await this.messageService.sendMessage(
        conversationId,
        userId,
        { content, messageType, conversationId }
      )

      // Send to all participants
      const eventData: MessageSentEvent = {
        messageId: message.messageId,
        conversationId: message.conversationId,
        senderId: message.senderId,
        content: message.content,
        messageType: message.messageType,
        createdAt: message.createdAt
      }

      // Emit to conversation room
      socket.to(`conversation:${conversationId}`).emit(
        SOCKET_EVENTS.MESSAGE_RECEIVED,
        eventData
      )

      // Acknowledge to sender
      socket.emit(SOCKET_EVENTS.MESSAGE_SENT, eventData)
    } catch (error: any) {
      console.error('[Socket] Error sending message:', error)
      socket.emit('error', {
        code: 'MESSAGE_SEND_ERROR',
        message: error.message
      })
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

      // Notify other participants in conversation
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
      socket.emit('error', {
        code: 'MESSAGE_READ_ERROR',
        message: error.message
      })
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

    // Notify others in conversation
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

    // Notify others in conversation
    socket.to(`conversation:${conversationId}`).emit(
      SOCKET_EVENTS.PARTICIPANT_LEFT,
      {
        conversationId,
        userId,
        timestamp: new Date()
      }
    )
  }
}

