import { Server as HttpServer } from 'http'
import { Server as SocketIOServer, Socket } from 'socket.io'
import { SOCKET_EVENTS } from '@/utils/types/socket-events'
import { SocketHandlers } from './socket-handlers'
import { VideoCallHandler } from './video-call-handler'
import { VIDEO_CALL_EVENTS } from '@/utils/types/webrtc-signaling'
import { saveUserConnection, removeUserConnection } from '@/infras/redis/connection-cache'
import JWTService from '@/services/jwt.service'
import { Account } from '@/domains/entities/account.entity'
import { ConfigService } from '@/services/config.service'

/**
 * Socket.IO Configuration and Setup
 *
 * Responsibilities:
 * - Initialize Socket.IO server on HTTP server
 * - Setup JWT authentication middleware
 * - Register event handlers via SocketHandlers class
 * - Provide access to Socket.IO instance
 */
export class SocketConfig {
  private io: SocketIOServer
  private handlers: SocketHandlers
  private videoCallHandler: VideoCallHandler
  private jwtService: JWTService
  private config = ConfigService.gI()

  constructor(httpServer: HttpServer) {
    // Initialize handlers FIRST
    this.handlers = new SocketHandlers()
    this.videoCallHandler = new VideoCallHandler()
    this.jwtService = new JWTService()

    // Initialize Socket.IO server
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: (origin, callback) => {
          const allowedOrigins = [this.config.get('FRONTEND_URL')]
          // !origin allows mobile apps, postman, and other non-browser clients
          if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true)
          } else {
            callback(new Error('Not allowed by CORS'))
          }
        },
        methods: ['GET', 'POST'],
        credentials: true
      },
      transports: ['websocket', 'polling'],
      allowEIO3: true
    })

    // Set Socket.IO instance for VideoCallHandler to emit to user rooms
    this.videoCallHandler.setIO(this.io)

    console.log('[Socket] Initializing server...')
    this.setupMiddleware()
    this.setupEventHandlers()
    console.log('[Socket] Setup complete')
  }

  /**
   * Extract Bearer token from Socket.IO handshake.
   * Checks handshake.auth.token (Socket.IO v3+), then Authorization header.
   */
  private extractToken(handshake: Socket['handshake']): string | undefined {
    // Primary: handshake.auth.token
    if (handshake.auth?.token && typeof handshake.auth.token === 'string') {
      return handshake.auth.token
    }
    // Fallback: Authorization header (for clients that set it directly)
    const authHeader = handshake.headers['authorization'] as string | undefined
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.slice(7)
    }
    return undefined
  }

  /**
   * Setup JWT authentication middleware — runs during the Socket.IO handshake
   * before the connection is established. Rejects with a handshake error if
   * the token is missing, malformed, or expired.
   */
  private setupMiddleware(): void {
    this.io.use((socket: Socket, next: (err?: Error) => void) => {
      const token = this.extractToken(socket.handshake)

      if (!token) {
        console.warn('[SocketConfig] Handshake rejected: missing token')
        return next(new Error('Authentication error: token is required'))
      }

      const result = this.jwtService.verifyAccessTokenDetailed(token)

      if (!result.isValid) {
        if (result.isExpired) {
          console.warn('[SocketConfig] Handshake rejected: token expired')
          return next(new Error('Authentication error: token has expired'))
        }
        console.warn('[SocketConfig] Handshake rejected: invalid token')
        return next(new Error('Authentication error: invalid token'))
      }

      // Attach decoded payload to socket for downstream event handlers
      const payload = result.payload as Account
      socket.data.user = payload

      // Resolve userId: prefer nested customer.customerId, fall back to top-level
      const userId =
        payload?.customer?.customerId ??
        (payload as any)?.customerId ??
        (payload as any)?.userId ??
        payload?.accountId

      if (!userId) {
        console.warn('[SocketConfig] Handshake rejected: userId could not be resolved from token')
        return next(new Error('Authentication error: user identity could not be resolved'))
      }

      // Keep as string for Redis / video-call handlers (compatible with both numeric and string IDs)
      socket.data.userId = String(userId)

      console.log(`[SocketConfig] Handshake authenticated: userId=${socket.data.userId}`)
      next()
    })
  }

  /**
   * Setup all WebSocket event handlers
   * Delegates to SocketHandlers class
   */
  private setupEventHandlers(): void {
    this.io.on(SOCKET_EVENTS.CONNECTION, async (socket: Socket) => {
      const userId = socket.data.userId as string
      console.log(`[SocketConfig] User ${userId} connected (socketId=${socket.id})`)

      // Use SocketHandlers for logic
      this.handlers.handleConnection(socket)

      // Register socket for video call handler (enables direct notifications to user)
      this.videoCallHandler.handleConnection(socket)

      // Save user connection to Redis for persistent tracking
      try {
        const fcmToken = socket.handshake.headers['x-fcm-token'] as string | undefined
        await saveUserConnection(String(userId), socket.id, undefined, fcmToken)
        console.log(`[SocketConfig] Saved user connection to Redis: userId=${userId}, socketId=${socket.id}, fcmToken=${fcmToken ? 'provided' : 'none'}`)
      } catch (error) {
        console.error(`[SocketConfig] Failed to save user connection to Redis:`, error)
      }

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

      // File upload events
      socket.on(SOCKET_EVENTS.FILE_UPLOAD, (data) =>
        this.handlers.handleFileUpload(socket, data)
      )

      socket.on(SOCKET_EVENTS.FILE_SENT, (data) =>
        this.handlers.handleFileSent(socket, data)
      )

      // Video call events
      socket.on(VIDEO_CALL_EVENTS.GET_ICE_CONFIG, (data) => {
        console.log(`[Socket] Received GET_ICE_CONFIG from user ${userId}`)
        this.videoCallHandler.handleGetIceConfig(socket)
      })

      socket.on(VIDEO_CALL_EVENTS.CREATE_ROOM, (data) => {
        console.log(`[Socket] Received CREATE_ROOM from user ${userId}:`, data)
        this.videoCallHandler.handleCreateRoom(socket, data)
      })

      socket.on(VIDEO_CALL_EVENTS.JOIN_ROOM, (data) => {
        console.log(`[Socket] Received JOIN_ROOM from user ${userId}:`, data)
        this.videoCallHandler.handleJoinRoom(socket, data)
      })

      socket.on(VIDEO_CALL_EVENTS.LEAVE_ROOM, (data) => {
        console.log(`[Socket] Received LEAVE_ROOM from user ${userId}:`, data)
        this.videoCallHandler.handleLeaveRoom(socket, data)
      })

      socket.on(VIDEO_CALL_EVENTS.OFFER, (data) => {
        console.log(`[Socket] Received OFFER from user ${userId}:`, data)
        this.videoCallHandler.handleOffer(socket, data)
      })

      socket.on(VIDEO_CALL_EVENTS.ANSWER, (data) => {
        console.log(`[Socket] Received ANSWER from user ${userId}:`, data)
        this.videoCallHandler.handleAnswer(socket, data)
      })

      socket.on(VIDEO_CALL_EVENTS.ICE_CANDIDATE, (data) => {
        console.log(`[Socket] Received ICE_CANDIDATE from user ${userId}`)
        this.videoCallHandler.handleIceCandidate(socket, data)
      })

      socket.on(VIDEO_CALL_EVENTS.CALL_ACCEPTED, (data) => {
        console.log(`[Socket] Received CALL_ACCEPTED from user ${userId}:`, data)
        this.videoCallHandler.handleCallAccepted(socket, data)
      })

      socket.on(VIDEO_CALL_EVENTS.CALL_REJECTED, async (data) => {
        console.log(`[Socket] Received CALL_REJECTED from user ${userId}:`, data)
        await this.videoCallHandler.handleCallRejected(socket, data)
      })

      socket.on(VIDEO_CALL_EVENTS.CALL_ENDED, async (data) => {
        console.log(`[Socket] Received CALL_ENDED from user ${userId}:`, data)
        await this.videoCallHandler.handleCallEnded(socket, data)
      })

      // Connection state monitoring events
      socket.on('video:call:iceStateChange', (data) => {
        console.log(`[Socket] Received iceStateChange from user ${userId}:`, data)
        this.videoCallHandler.handleIceStateChange(socket, data)
      })

      socket.on('video:call:connectionStats', (data) => {
        this.videoCallHandler.handleConnectionStats(socket, data)
      })

      // Disconnect event
      socket.on(SOCKET_EVENTS.DISCONNECT, async () => {
        console.log(`[SocketConfig] User ${userId} disconnected`)

        // Await async disconnect handlers for proper cleanup
        await this.handlers.handleDisconnect(socket)
        await this.videoCallHandler.handleDisconnect(socket)

        // Remove user connection from Redis (already handled in videoCallHandler but needed for chat-only users)
        try {
          await removeUserConnection(socket.id)
          console.log(`[SocketConfig] Removed user connection from Redis: userId=${userId}, socketId=${socket.id}`)
        } catch (error) {
          console.error(`[SocketConfig] Failed to remove user connection from Redis:`, error)
        }
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

  /**
   * Get video call handler instance
   */
  public getVideoCallHandler(): VideoCallHandler {
    return this.videoCallHandler
  }
}
