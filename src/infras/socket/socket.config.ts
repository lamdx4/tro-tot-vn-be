import { Server as HttpServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import { SOCKET_EVENTS } from '@/utils/types/socket-events'
import { ChatService, MessageService } from '@/services'

export class SocketConfig {
  private io: SocketIOServer
  private chatService: ChatService
  private messageService: MessageService

  constructor(httpServer: HttpServer) {
    this.chatService = new ChatService()
    this.messageService = new MessageService()

    // Initialize Socket.IO server
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: '*', // Allow all origins for testing
        methods: ['GET', 'POST'],
        credentials: true
      },
      transports: ['websocket', 'polling'],
      allowEIO3: true // Allow Engine.IO v3 clients
    })

    this.setupMiddleware()
    this.setupEventHandlers()
  }

  /**
   * Setup authentication middleware
   */
  private setupMiddleware() {
    this.io.use((socket, next) => {
      // TODO: Add JWT authentication here
      // For now, we'll pass through
      const userId = socket.handshake.auth.userId || socket.handshake.query.userId

      if (!userId) {
        return next(new Error('Authentication error: User ID required'))
      }

      socket.data.userId = userId
      next()
    })
  }

  /**
   * Setup all event handlers
   */
  private setupEventHandlers() {
    this.io.on(SOCKET_EVENTS.CONNECTION, (socket) => {
      const userId = socket.data.userId as number

      console.log(`User connected: ${userId}, Socket ID: ${socket.id}`)

      // Join user's personal room for direct messages
      socket.join(`user:${userId}`)

      // Broadcast user online status
      this.io.emit(SOCKET_EVENTS.USER_ONLINE, {
        userId,
        timestamp: new Date()
      })

      // Handle disconnect
      socket.on(SOCKET_EVENTS.DISCONNECT, () => {
        console.log(`User disconnected: ${userId}, Socket ID: ${socket.id}`)

        this.io.emit(SOCKET_EVENTS.USER_OFFLINE, {
          userId,
          timestamp: new Date()
        })
      })

      // Handle sending messages
      socket.on(SOCKET_EVENTS.MESSAGE_SENT, async (data) => {
        await this.handleMessageSent(socket, data)
      })

      // Handle message read
      socket.on(SOCKET_EVENTS.MESSAGE_READ, async (data) => {
        await this.handleMessageRead(socket, data)
      })

      // Handle typing start
      socket.on(SOCKET_EVENTS.TYPING_START, (data) => {
        this.handleTypingStart(socket, data)
      })

      // Handle typing stop
      socket.on(SOCKET_EVENTS.TYPING_STOP, (data) => {
        this.handleTypingStop(socket, data)
      })

      // Handle joining a conversation room
      socket.on('join:conversation', (conversationId: number) => {
        socket.join(`conversation:${conversationId}`)
        console.log(`User ${userId} joined conversation:${conversationId}`)
      })

      // Handle leaving a conversation room
      socket.on('leave:conversation', (conversationId: number) => {
        socket.leave(`conversation:${conversationId}`)
        console.log(`User ${userId} left conversation:${conversationId}`)
      })
    })
  }

  /**
   * Handle message sent event
   */
  private async handleMessageSent(socket: any, data: any) {
    try {
      const userId = socket.data.userId as number
      const { conversationId, content, messageType = 'Text' } = data

      // Create message
      const message = await this.messageService.sendMessage(
        conversationId,
        userId,
        { content, messageType, conversationId }
      )

      // Get conversation participants
      const participants = await this.chatService.getConversationParticipants(conversationId)

      // Send to all participants in the conversation
      for (const participant of participants) {
        const participantSocketId = this.getSocketIdByUserId(participant.customerId)
        if (participantSocketId) {
          this.io.to(`user:${participant.customerId}`).emit(
            SOCKET_EVENTS.MESSAGE_RECEIVED,
            {
              ...message,
              conversationId
            }
          )
        }
      }

      // Acknowledge to sender
      socket.emit('message:ack', { success: true, message })
    } catch (error: any) {
      socket.emit('message:error', { error: error.message })
    }
  }

  /**
   * Handle message read event
   */
  private async handleMessageRead(socket: any, data: any) {
    try {
      const { messageId, conversationId } = data

      await this.messageService.markMessageAsRead(messageId)

      // Notify other participants
      socket.to(`conversation:${conversationId}`).emit(SOCKET_EVENTS.MESSAGE_READ, {
        messageId,
        conversationId,
        readAt: new Date()
      })
    } catch (error: any) {
      socket.emit('message:error', { error: error.message })
    }
  }

  /**
   * Handle typing start event
   */
  private handleTypingStart(socket: any, data: any) {
    const { conversationId } = data
    const userId = socket.data.userId as number

    socket.to(`conversation:${conversationId}`).emit(SOCKET_EVENTS.TYPING_START, {
      conversationId,
      userId,
      isTyping: true
    })
  }

  /**
   * Handle typing stop event
   */
  private handleTypingStop(socket: any, data: any) {
    const { conversationId } = data
    const userId = socket.data.userId as number

    socket.to(`conversation:${conversationId}`).emit(SOCKET_EVENTS.TYPING_STOP, {
      conversationId,
      userId,
      isTyping: false
    })
  }

  /**
   * Helper to get socket ID by user ID (simplified)
   */
  private getSocketIdByUserId(userId: number): string | null {
    // In production, you'd maintain a userId -> socketId mapping
    // For now, we use Socket.IO rooms
    return `user:${userId}`
  }

  /**
   * Get the Socket.IO server instance
   */
  public getIO(): SocketIOServer {
    return this.io
  }
}

