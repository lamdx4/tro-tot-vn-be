import { Server as HttpServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import { Socket } from 'socket.io'
import { SOCKET_EVENTS } from '@/utils/types/socket-events'
import { SocketHandlers } from './socket-handlers'

/**
 * Socket.IO Configuration and Setup
 *
 * Responsibilities:
 * - Initialize Socket.IO server on HTTP server
 * - Setup authentication middleware
 * - Register event handlers via SocketHandlers class
 * - Provide access to Socket.IO instance
 */
export class SocketConfig {
  private io: SocketIOServer
  private handlers: SocketHandlers

  constructor(httpServer: HttpServer) {
    // Initialize handlers FIRST
    this.handlers = new SocketHandlers()

    // Initialize Socket.IO server
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
        credentials: true
      },
      transports: ['websocket', 'polling'],
      allowEIO3: true
    })

    console.log('[SocketConfig] Initializing Socket.IO server...')
    this.setupMiddleware()
    this.setupEventHandlers()
    console.log('[SocketConfig] Socket.IO setup complete')
  }

  /**
   * Setup authentication middleware
   */
  private setupMiddleware(): void {
    this.io.use((socket: Socket, next: Function) => {
      // TODO: jwt handler here
      const userId = socket.handshake.auth.userId || socket.handshake.query.userId

      if (!userId) {
        return next(new Error('Authentication error: User ID required'))
      }

      socket.data.userId = userId
      next()
    })
  }

  /**
   * Setup all WebSocket event handlers
   * Delegates to SocketHandlers class
   */
  private setupEventHandlers(): void {
    this.io.on(SOCKET_EVENTS.CONNECTION, (socket: Socket) => {
      const userId = socket.data.userId as number
      console.log(`[SocketConfig] User ${userId} connected`)

      // Use SocketHandlers for logic
      this.handlers.handleConnection(socket)

      // Message events
      socket.on(SOCKET_EVENTS.MESSAGE_SENT, (data) =>
        this.handlers.handleMessageSent(socket, data)
      )

      socket.on(SOCKET_EVENTS.MESSAGE_READ, (data) =>
        this.handlers.handleMessageRead(socket, data)
      )

      // Typing events
      socket.on(SOCKET_EVENTS.TYPING_START, (data) =>
        this.handlers.handleTypingStart(socket, data)
      )

      socket.on(SOCKET_EVENTS.TYPING_STOP, (data) =>
        this.handlers.handleTypingStop(socket, data)
      )

      // Conversation events
      socket.on('join:conversation', (conversationId: number) =>
        // TODO: check really in conversation in DB
        this.handlers.handleJoinConversation(socket, conversationId)
      )

      socket.on('leave:conversation', (conversationId: number) =>
         // TODO: check really in conversation in DB
        this.handlers.handleLeaveConversation(socket, conversationId)
      )

      // Disconnect event
      socket.on(SOCKET_EVENTS.DISCONNECT, () => {
        console.log(`[SocketConfig] User ${userId} disconnected`)
        this.handlers.handleDisconnect(socket)
      })
    })
  }

  /**
   * Get Socket.IO instance
   */
  public getIO(): SocketIOServer {
    return this.io
  }

  /**
   * Get handlers instance
   */
  public getHandlers(): SocketHandlers {
    return this.handlers
  }
}
