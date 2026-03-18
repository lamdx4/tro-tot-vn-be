import { Socket, Server as SocketIOServer } from 'socket.io'
import {
  VIDEO_CALL_EVENTS,
  IceServerConfig,
  IceServersResponse,
  VideoCallRoom,
  CreateRoomEvent,
  RoomCreatedEvent,
  JoinRoomEvent,
  RoomJoinedEvent,
  LeaveRoomEvent,
  RoomLeftEvent,
  RoomParticipantJoinedEvent,
  OfferEvent,
  AnswerEvent,
  IceCandidateEvent,
  CallRequestEvent,
  CallAcceptedEvent,
  CallRejectedEvent,
  CallEndedEvent,
  CallErrorEvent,
  IceConnectionStateEvent,
  ConnectionStatsEvent
} from '@/utils/types/webrtc-signaling'
import { env } from '@/preload-env'
import {
  saveUserConnection,
  removeUserConnection,
  updateUserRoom,
  removeUserFromRoom,
  getUserBySocket,
  // Room state management - Redis as single source of truth
  saveRoom,
  deleteRoom,
  addUserToRoom,
  removeUserFromRoomParticipants,
  deactivateRoom,
  getVideoCallRoom,
  getAllVideoCallRooms
} from '@/infras/redis/connection-cache'

/**
 * VideoCallHandler - Handles 1-on-1 video call signaling via Socket.IO
 */
export class VideoCallHandler {
  private roomCleanupTimeouts: Map<string, NodeJS.Timeout> = new Map()
  private readonly isDebug: boolean
  private io: SocketIOServer | null = null

  constructor() {
    this.isDebug = process.env.NODE_ENV !== 'production'
  }

  setIO(io: SocketIOServer): void {
    this.io = io
  }

  /**
   * Handle new socket connection - register user socket and join personal room
   */
  async handleConnection(socket: Socket): Promise<void> {
    const userId = socket.data.userId as string
    if (userId !== undefined && userId !== null) {
      // Join user's personal room for direct notifications
      socket.join(`user:${userId}`)

      // Save user-socket mapping to Redis for persistence
      try {
        await saveUserConnection(userId, socket.id)
      } catch (error) {
        console.error('[VideoCallHandler] Failed to save connection to Redis:', error)
      }
    }
  }

  /**
   * Get ICE server configuration for client
   */
  handleGetIceConfig(socket: Socket): void {
    const iceServers = this.buildIceServers()

    const response: IceServersResponse = { iceServers }

    socket.emit(VIDEO_CALL_EVENTS.ICE_CONFIG, response)
    if (this.isDebug) {
      console.log('[VideoCallHandler] Sent ICE config to user')
    }
  }

  /**
   * Build ICE servers configuration from environment variables
   */
  private buildIceServers(): IceServerConfig[] {
    const iceServers: IceServerConfig[] = []

    const stunUrlsEnv = env.STUN_SERVER_URLS
    if (stunUrlsEnv) {
      const stunUrls = stunUrlsEnv.split(',')
      for (const url of stunUrls) {
        const trimmed = url.trim()
        if (trimmed) {
          iceServers.push({ urls: trimmed })
        }
      }
    }

    if (env.TURN_SERVER_IP && env.TURN_USERNAME && env.TURN_CREDENTIAL) {
      const turnUrls = [
        `turn:${env.TURN_SERVER_IP}:${env.TURN_SERVER_PORT}?transport=udp`,
        `turn:${env.TURN_SERVER_IP}:${env.TURN_SERVER_PORT}?transport=tcp`,
        `turn:${env.TURN_SERVER_IP}:${env.TURN_SERVER_TLS_PORT}?transport=tcp`
      ]

      for (const url of turnUrls) {
        iceServers.push({
          urls: url,
          username: env.TURN_USERNAME,
          credential: env.TURN_CREDENTIAL
        })
      }

      iceServers.push({
        urls: `stun:${env.TURN_SERVER_IP}:${env.TURN_SERVER_PORT}`
      })
    }

    if (this.isDebug) {
      console.log('[VideoCallHandler] ICE servers configured with', iceServers.length, 'servers')
    }
    return iceServers
  }

  /**
   * Create a new video call room
   */
  async handleCreateRoom(socket: Socket, data: CreateRoomEvent): Promise<void> {
    const callerId = socket.data.userId as string
    const { calleeId } = data

    if (!callerId) {
      this.emitError(socket, 'UNAUTHORIZED', 'User not authenticated')
      return
    }

    if (this.isDebug) {
      console.log('[VideoCallHandler] CreateRoom request received')
    }

    if (!calleeId) {
      this.emitError(socket, 'INVALID_CALLEE', 'Callee ID is required')
      return
    }

    if (callerId === calleeId) {
      this.emitError(socket, 'INVALID_CALLEE', 'Cannot call yourself')
      return
    }

    if (this.isDebug) {
      console.log(`[VideoCallHandler] CreateRoom - caller: ${callerId}, callee: ${calleeId}`)
    }

    const roomId = this.generateRoomId(callerId, calleeId)

    // Check if room exists in Redis
    const existingRoom = await getVideoCallRoom(roomId)

    if (existingRoom?.isActive) {
      await saveUserConnection(callerId, socket.id, roomId)
      await this.handleJoinRoom(socket, { roomId })
      return
    }

    const createdAt = new Date()

    // Save room to Redis
    try {
      await saveRoom({
        roomId,
        participants: [callerId, calleeId],
        activeParticipants: [callerId],
        isActive: true,
        createdBy: callerId,
        createdAt: createdAt.toISOString()
      })
    } catch (error) {
      console.error('[VideoCallHandler] Failed to save room to Redis:', error)
    }

    // Save user-room relationship to Redis
    try {
      await saveUserConnection(callerId, socket.id, roomId)
    } catch (error) {
      console.error('[VideoCallHandler] Failed to save connection to Redis:', error)
    }

    socket.join(roomId)

    const response: RoomCreatedEvent = {
      roomId,
      callerId,
      calleeId,
      createdAt
    }
    socket.emit(VIDEO_CALL_EVENTS.ROOM_CREATED, response)

    // Create minimal room object for notifyCallee
    const room: VideoCallRoom = {
      roomId,
      participants: [callerId, calleeId],
      activeParticipants: [callerId],
      createdAt,
      createdBy: callerId,
      isActive: true
    }
    this.notifyCallee(room, calleeId, callerId)

    if (this.isDebug) {
      console.log(`[VideoCallHandler] Room created: ${roomId} by caller`)
    }
  }

  /**
   * Join an existing video call room
   */
  async handleJoinRoom(socket: Socket, data: JoinRoomEvent): Promise<void> {
    const userId = socket.data.userId as string

    if (!userId) {
      this.emitError(socket, 'UNAUTHORIZED', 'User not authenticated')
      return
    }

    const { roomId } = data

    if (this.isDebug) {
      console.log(`[VideoCallHandler] JoinRoom - userId: ${userId}, roomId: ${roomId}`)
    }

    // Get room from Redis
    const room = await getVideoCallRoom(roomId)

    if (!room) {
      this.emitError(socket, 'ROOM_NOT_FOUND', 'Room not found')
      return
    }

    if (!room.isActive) {
      this.emitError(socket, 'ROOM_NOT_ACTIVE', 'This call has ended')
      return
    }

    // Only allow users in room.participants
    if (!room.participants.includes(userId)) {
      this.emitError(socket, 'NOT_INVITED', 'You are not invited to this call')
      return
    }

    // Check if user is already in a room via Redis
    try {
      const existingMapping = await getUserBySocket(socket.id)
      if (existingMapping?.roomId && existingMapping.roomId !== roomId) {
        await this.handleLeaveRoom(socket, { roomId: existingMapping.roomId })
      }
    } catch (error) {
      console.error('[VideoCallHandler] Failed to check existing room in Redis:', error)
    }

    const existingTimeout = this.roomCleanupTimeouts.get(roomId)
    if (existingTimeout) {
      clearTimeout(existingTimeout)
      this.roomCleanupTimeouts.delete(roomId)
    }

    // Update Redis with room membership
    try {
      await updateUserRoom(socket.id, roomId)
    } catch (error) {
      console.error(`[VideoCallHandler] Failed to update Redis:`, error)
    }

    // Add user to active participants in Redis
    try {
      await addUserToRoom(roomId, userId)
    } catch (error) {
      console.error('[VideoCallHandler] Failed to sync room to Redis:', error)
    }

    socket.join(roomId)

    if (this.isDebug) {
      console.log(`[VideoCallHandler] User ${userId} joined room ${roomId}. Active participants:`, room.activeParticipants)
    }

    const participantEvent: RoomParticipantJoinedEvent = {
      roomId,
      userId,
      timestamp: new Date()
    }
    socket.to(roomId).emit(VIDEO_CALL_EVENTS.ROOM_PARTICIPANT_JOINED, participantEvent)

    const response: RoomJoinedEvent = {
      roomId,
      participants: room.activeParticipants,
      joinedAt: new Date()
    }
    socket.emit(VIDEO_CALL_EVENTS.ROOM_JOINED, response)

    const otherParticipant = room.activeParticipants.find(p => p !== userId)
    if (otherParticipant) {
      const peerConnectedEvent = {
        roomId,
        peerUserId: userId,
        timestamp: new Date()
      }
      socket.to(roomId).emit(VIDEO_CALL_EVENTS.PEER_CONNECTED, peerConnectedEvent)
      if (this.isDebug) {
        console.log(`[VideoCallHandler] Sent PEER_CONNECTED to room ${roomId}: User ${userId} joined, notifying peer ${otherParticipant}`)
      }

      const existingPeerEvent = {
        roomId,
        peerUserId: otherParticipant,
        timestamp: new Date()
      }
      socket.emit(VIDEO_CALL_EVENTS.PEER_CONNECTED, existingPeerEvent)
      if (this.isDebug) {
        console.log(`[VideoCallHandler] Sent PEER_CONNECTED to User ${userId}: Peer ${otherParticipant} already in room ${roomId}`)
      }
    }

    if (this.isDebug) {
      console.log(`[VideoCallHandler] User joined room ${roomId}`)
    }
  }

  /**
   * Leave a video call room
   */
  async handleLeaveRoom(socket: Socket, data: LeaveRoomEvent): Promise<void> {
    const userId = socket.data.userId as string
    const { roomId } = data

    // Get room from Redis
    const room = await getVideoCallRoom(roomId)

    if (!room) {
      return
    }

    const allParticipants = room.participants

    // Remove user from active participants in Redis
    try {
      await removeUserFromRoomParticipants(roomId, userId)
    } catch (error) {
      console.error('[VideoCallHandler] Failed to sync leave to Redis:', error)
    }

    socket.leave(roomId)

    // Remove user from room in Redis
    try {
      await removeUserFromRoom(socket.id, roomId)
    } catch (error) {
      console.error(`[VideoCallHandler] Failed to update Redis on leave:`, error)
    }

    const callEndedPayload = {
      roomId,
      endedBy: userId,
      reason: 'Participant left - call ended for everyone',
      endedAt: new Date()
    } as CallEndedEvent

    // Delete room from Redis
    try {
      await deleteRoom(roomId)
    } catch (error) {
      console.error('[VideoCallHandler] Failed to delete room from Redis:', error)
    }

    const existingTimeout = this.roomCleanupTimeouts.get(roomId)
    if (existingTimeout) {
      clearTimeout(existingTimeout)
      this.roomCleanupTimeouts.delete(roomId)
    }

    // Notify all participants
    for (const participantId of allParticipants) {
      if (participantId === userId) continue
      this.emitToUserSockets(participantId, VIDEO_CALL_EVENTS.CALL_ENDED, callEndedPayload)
    }

    if (this.isDebug) {
      console.log(`[VideoCallHandler] Room ${roomId} ended - user ${userId} left. Room deleted.`)
    }

    socket.emit(VIDEO_CALL_EVENTS.ROOM_LEFT, {
      roomId,
      userId,
      leftAt: new Date()
    } as RoomLeftEvent)

    if (this.isDebug) {
      console.log(`[VideoCallHandler] User left room ${roomId}`)
    }
  }

  /**
   * Handle WebRTC Offer
   */
  async handleOffer(socket: Socket, data: OfferEvent): Promise<void> {
    const userId = socket.data.userId as string
    const { roomId, offer } = data

    if (!offer || typeof offer !== 'object' || !offer.type || !offer.sdp) {
      this.emitError(socket, 'INVALID_OFFER', 'Invalid offer payload')
      return
    }

    const room = await getVideoCallRoom(roomId)

    if (!room) {
      this.emitError(socket, 'ROOM_NOT_FOUND', 'Room not found')
      return
    }

    if (!room.activeParticipants.includes(userId)) {
      this.emitError(socket, 'USER_NOT_IN_ROOM', 'You are not in this room')
      return
    }

    socket.to(roomId).emit(VIDEO_CALL_EVENTS.OFFER, {
      roomId,
      offer,
      from: userId
    })
  }

  /**
   * Handle WebRTC Answer
   */
  async handleAnswer(socket: Socket, data: AnswerEvent): Promise<void> {
    const userId = socket.data.userId as string
    const { roomId, answer } = data

    if (!answer || typeof answer !== 'object' || !answer.type || !answer.sdp) {
      this.emitError(socket, 'INVALID_ANSWER', 'Invalid answer payload')
      return
    }

    const room = await getVideoCallRoom(roomId)

    if (!room) {
      this.emitError(socket, 'ROOM_NOT_FOUND', 'Room not found')
      return
    }

    if (!room.activeParticipants.includes(userId)) {
      this.emitError(socket, 'USER_NOT_IN_ROOM', 'You are not in this room')
      return
    }

    socket.to(roomId).emit(VIDEO_CALL_EVENTS.ANSWER, {
      roomId,
      answer,
      from: userId
    })
  }

  /**
   * Handle ICE Candidate
   */
  async handleIceCandidate(socket: Socket, data: IceCandidateEvent): Promise<void> {
    const userId = socket.data.userId as string
    const { roomId, candidate } = data

    if (!roomId) {
      this.emitError(socket, 'INVALID_ROOM_ID', 'Room ID is required')
      return
    }

    const room = await getVideoCallRoom(roomId)

    if (!room) {
      this.emitError(socket, 'ROOM_NOT_FOUND', 'Room not found')
      return
    }

    if (!room.activeParticipants.includes(userId)) {
      this.emitError(socket, 'USER_NOT_IN_ROOM', 'You are not in this room')
      return
    }

    socket.to(roomId).emit(VIDEO_CALL_EVENTS.ICE_CANDIDATE, {
      roomId,
      candidate,
      from: userId
    })
  }

  /**
   * Handle call acceptance
   */
  async handleCallAccepted(socket: Socket, data: { roomId: string }): Promise<void> {
    const userId = socket.data.userId as string
    const { roomId } = data

    const room = await getVideoCallRoom(roomId)

    if (!room) {
      this.emitError(socket, 'ROOM_NOT_FOUND', 'Room not found')
      return
    }

    const callAcceptedPayload: CallAcceptedEvent = {
      roomId,
      callerId: room.createdBy,
      calleeId: userId,
      acceptedAt: new Date()
    }

    this.emitToUserSockets(room.createdBy, VIDEO_CALL_EVENTS.CALL_ACCEPTED, callAcceptedPayload)
  }

  /**
   * Handle call rejection
   */
  async handleCallRejected(socket: Socket, data: { roomId: string; reason?: string }): Promise<void> {
    const userId = socket.data.userId as string
    const { roomId, reason } = data

    const room = await getVideoCallRoom(roomId)

    if (!room) {
      return
    }

    const callRejectedPayload: CallRejectedEvent = {
      roomId,
      callerId: room.createdBy,
      calleeId: userId,
      reason,
      rejectedAt: new Date()
    }

    this.emitToUserSockets(room.createdBy, VIDEO_CALL_EVENTS.CALL_REJECTED, callRejectedPayload)

    // Mark room as inactive in Redis
    try {
      await deactivateRoom(roomId)
    } catch (error) {
      console.error('[VideoCallHandler] Failed to deactivate room in Redis:', error)
    }

    const existingTimeout = this.roomCleanupTimeouts.get(roomId)
    if (existingTimeout) {
      clearTimeout(existingTimeout)
    }
    const timeout = setTimeout(async () => {
      try {
        await deleteRoom(roomId)
      } catch (error) {
        console.error('[VideoCallHandler] Failed to delete room from Redis:', error)
      }
      this.roomCleanupTimeouts.delete(roomId)
    }, 60000)
    this.roomCleanupTimeouts.set(roomId, timeout)
  }

  /**
   * Handle call end
   */
  async handleCallEnded(socket: Socket, data: { roomId: string; reason?: string }): Promise<void> {
    const userId = socket.data.userId as string
    const { roomId, reason } = data

    const room = await getVideoCallRoom(roomId)

    if (!room) {
      return
    }

    const callEndedPayload: CallEndedEvent = {
      roomId,
      endedBy: userId,
      reason,
      endedAt: new Date()
    }

    const allParticipants = room.participants

    // Delete room from Redis
    try {
      await deleteRoom(roomId)
    } catch (error) {
      console.error('[VideoCallHandler] Failed to delete room from Redis:', error)
    }

    const existingTimeout = this.roomCleanupTimeouts.get(roomId)
    if (existingTimeout) {
      clearTimeout(existingTimeout)
      this.roomCleanupTimeouts.delete(roomId)
    }

    // Notify all participants
    for (const participantId of allParticipants) {
      if (participantId === userId) continue
      if (this.io) {
        this.io.to(`user:${participantId}`).emit(VIDEO_CALL_EVENTS.CALL_ENDED, callEndedPayload)
      }
    }
  }

  /**
   * Handle user disconnect
   */
  async handleDisconnect(socket: Socket): Promise<void> {
    const userId = socket.data?.userId as string | undefined

    // Get room from Redis
    let roomId: string | undefined
    try {
      const userMapping = await getUserBySocket(socket.id)
      roomId = userMapping?.roomId
    } catch (error) {
      console.error('[VideoCallHandler] Failed to get room from Redis:', error)
    }

    if (this.isDebug) {
      console.log(`[VideoCallHandler] Disconnect - userId: ${userId}, roomId: ${roomId}`)
    }

    if (userId === undefined || userId === null) {
      return
    }

    // Handle leaving room if user was in one
    if (roomId) {
      await this.handleLeaveRoom(socket, { roomId })
    }

    // Remove from Redis
    try {
      await removeUserConnection(socket.id)
    } catch (error) {
      console.error('[VideoCallHandler] Failed to remove connection from Redis:', error)
    }
  }

  /**
   * Handle ICE connection state change from client
   */
  async handleIceStateChange(socket: Socket, data: IceConnectionStateEvent): Promise<void> {
    const userId = socket.data.userId as string
    const { roomId, iceConnectionState, iceGatheringState } = data

    const room = await getVideoCallRoom(roomId)
    if (room) {
      const otherParticipant = room.activeParticipants.find(p => p !== userId)
      if (otherParticipant) {
        socket.to(roomId).emit(VIDEO_CALL_EVENTS.ICE_STATE_CHANGED, {
          roomId,
          peerUserId: userId,
          iceConnectionState,
          iceGatheringState,
          timestamp: new Date()
        })
      }
    }
  }

  /**
   * Handle connection statistics from client
   */
  async handleConnectionStats(socket: Socket, data: ConnectionStatsEvent): Promise<void> {
    const userId = socket.data.userId as string
    const { roomId, stats } = data

    const room = await getVideoCallRoom(roomId)
    if (room) {
      socket.to(roomId).emit(VIDEO_CALL_EVENTS.PEER_STATS, {
        roomId,
        peerUserId: userId,
        stats: {
          bytesSent: stats.bytesSent,
          bytesReceived: stats.bytesReceived,
          packetsLost: stats.packetsLost ?? null,
          rtt: stats.rtt
        },
        timestamp: new Date()
      })
    }
  }

  /**
   * Generate a stable room ID based on user IDs
   */
  private generateRoomId(userId1: string, userId2: string): string {
    const sortedIds = [userId1, userId2].sort()
    return `video_${sortedIds[0]}_${sortedIds[1]}`
  }

  /**
   * Notify callee about incoming call
   */
  private notifyCallee(room: VideoCallRoom, calleeId: string, callerId: string): void {
    const callRequest: CallRequestEvent = {
      roomId: room.roomId,
      callerId,
      calleeId,
      timestamp: new Date()
    }

    if (this.io) {
      this.io.to(`user:${calleeId}`).emit(VIDEO_CALL_EVENTS.CALL_REQUEST, callRequest)
    }
  }

  /**
   * Emit to all sockets of a user
   */
  private emitToUserSockets(userId: string, event: string, payload: unknown): void {
    if (!this.io) {
      return
    }

    this.io.to(`user:${userId}`).emit(event, payload)
  }

  /**
   * Emit error to socket
   */
  private emitError(socket: Socket, code: string, message: string): void {
    const error: CallErrorEvent = {
      roomId: '',
      code,
      message,
      timestamp: new Date()
    }
    socket.emit(VIDEO_CALL_EVENTS.CALL_ERROR, error)
  }

  /**
   * Get room info (for debugging)
   */
  async getRoom(roomId: string): Promise<VideoCallRoom | null> {
    return await getVideoCallRoom(roomId)
  }

  /**
   * Get all active rooms (for debugging)
   */
  async getActiveRooms(): Promise<VideoCallRoom[]> {
    return await getAllVideoCallRooms()
  }
}

