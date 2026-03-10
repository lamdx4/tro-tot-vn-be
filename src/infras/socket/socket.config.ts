import { Server as HttpServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import { Socket } from 'socket.io'
import { SOCKET_EVENTS, FileUploadEvent, FileSentEvent } from '@/utils/types/socket-events'
import { SocketHandlers } from './socket-handlers'
import { VideoCallHandler } from './video-call-handler'
import { VIDEO_CALL_EVENTS } from '@/utils/types/webrtc-signaling'

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
  private videoCallHandler: VideoCallHandler

  constructor(httpServer: HttpServer) {
    // Initialize handlers FIRST
    this.handlers = new SocketHandlers()
    this.videoCallHandler = new VideoCallHandler()

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

      // Convert to number for consistent comparison with database IDs
      socket.data.userId = parseInt(String(userId), 10)
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

      // File upload events
      socket.on(SOCKET_EVENTS.FILE_UPLOAD, (data) =>
        this.handlers.handleFileUpload(socket, data)
      )

      socket.on(SOCKET_EVENTS.FILE_SENT, (data) =>
        this.handlers.handleFileSent(socket, data)
      )

      // Video call events
      socket.on(VIDEO_CALL_EVENTS.GET_ICE_CONFIG, () =>
        this.videoCallHandler.handleGetIceConfig(socket)
      )

      socket.on(VIDEO_CALL_EVENTS.CREATE_ROOM, (data) =>
        this.videoCallHandler.handleCreateRoom(socket, data)
      )

      socket.on(VIDEO_CALL_EVENTS.JOIN_ROOM, (data) =>
        this.videoCallHandler.handleJoinRoom(socket, data)
      )

      socket.on(VIDEO_CALL_EVENTS.LEAVE_ROOM, (data) =>
        this.videoCallHandler.handleLeaveRoom(socket, data)
      )

      socket.on(VIDEO_CALL_EVENTS.OFFER, (data) =>
        this.videoCallHandler.handleOffer(socket, data)
      )

      socket.on(VIDEO_CALL_EVENTS.ANSWER, (data) =>
        this.videoCallHandler.handleAnswer(socket, data)
      )

      socket.on(VIDEO_CALL_EVENTS.ICE_CANDIDATE, (data) =>
        this.videoCallHandler.handleIceCandidate(socket, data)
      )

      socket.on(VIDEO_CALL_EVENTS.CALL_ACCEPTED, (data) =>
        this.videoCallHandler.handleCallAccepted(socket, data)
      )

      socket.on(VIDEO_CALL_EVENTS.CALL_REJECTED, (data) =>
        this.videoCallHandler.handleCallRejected(socket, data)
      )

      socket.on(VIDEO_CALL_EVENTS.CALL_ENDED, (data) =>
        this.videoCallHandler.handleCallEnded(socket, data)
      )

      // Connection state monitoring events
      socket.on('video:call:iceStateChange', (data) =>
        this.videoCallHandler.handleIceStateChange(socket, data)
      )

      socket.on('video:call:connectionStats', (data) =>
        this.videoCallHandler.handleConnectionStats(socket, data)
      )

      // Disconnect event
      socket.on(SOCKET_EVENTS.DISCONNECT, () => {
        console.log(`[SocketConfig] User ${userId} disconnected`)
        this.handlers.handleDisconnect(socket)
        this.videoCallHandler.handleDisconnect(socket)
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
