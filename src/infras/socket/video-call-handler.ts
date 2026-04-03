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
import ResponseData from '@/utils/data-types/response'
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
import { ConfigService } from '@/services/config.service'
import { NotificationService } from '@/services/notification.service'
import { redisClient } from '@/infras/redis/redis'

/**
 * VideoCallHandler - Handles 1-on-1 video call signaling via Socket.IO
 */
export class VideoCallHandler {
  private roomCleanupTimeouts: Map<string, NodeJS.Timeout> = new Map()
  private readonly isDebug: boolean
  private io: SocketIOServer | null = null
  private config = ConfigService.gI()
  private notificationService = NotificationService.gI()

  constructor() {
    this.isDebug = this.config.get('NODE_ENV') !== 'production'
  }

  setIO(io: SocketIOServer): void {
    this.io = io
  }

  /**
   * Wrap payload in REST-style envelope: { status, data }
   */
  private wrap<T>(data: any, status = 200): ResponseData<T> {
    return new ResponseData<T>(status, 'success', data)
  }

  /**
   * Emit error to socket with context-aware roomId and status code
   */
  private emitError(socket: Socket, code: string, message: string, status: number = 500, roomId?: string): void {
    const response = ResponseData.error(status, message, code)
    const error: CallErrorEvent = {
      roomId: roomId ?? '',
      code: response.error[0] || code,
      message: response.message,
      timestamp: new Date()
    }
    socket.emit(VIDEO_CALL_EVENTS.CALL_ERROR, this.wrap(error, status))
  }

  /**
   * Handle new socket connection - register user socket and join personal room
   */
  async handleConnection(socket: Socket): Promise<void> {
    const userId = socket.data.userId as string
    if (userId !== undefined && userId !== null) {
      // Join user's personal room for direct notifications
      socket.join(`user:${userId}`)
    }
  }

  /**
   * Get ICE server configuration for client
   */
  async handleGetIceConfig(socket: Socket): Promise<void> {
    const iceServers = await this.buildIceServers()

    const response: IceServersResponse = { iceServers }

    socket.emit(VIDEO_CALL_EVENTS.ICE_CONFIG, this.wrap(response))
    if (this.isDebug) {
      console.log('[VideoCallHandler] Sent ICE config to user')
    }
  }

  /**
   * Build ICE servers configuration from environment variables
   */
  private async buildIceServers(): Promise<IceServerConfig[]> {
    const iceServers: IceServerConfig[] = []

    const stunUrlsEnv = this.config.get('STUN_SERVER_URLS')
    if (stunUrlsEnv) {
      const stunUrls = stunUrlsEnv.split(',')
      for (const url of stunUrls) {
        const trimmed = url.trim()
        if (trimmed) {
          iceServers.push({ urls: trimmed })
        }
      }
    }

    // Try to get TURN IP from Config first, then fallback to Redis
    let turnIp = this.config.get('TURN_SERVER_IP')
    if (!turnIp) {
      turnIp = (await redisClient.get('coturn:ip')) || ''
    }

    const turnUser = this.config.get('TURN_USERNAME')
    const turnCred = this.config.get('TURN_CREDENTIAL')

    if (turnIp && turnUser && turnCred) {
      const turnUrls = [
        `turn:${turnIp}:${this.config.get('TURN_SERVER_PORT')}?transport=udp`,
        `turn:${turnIp}:${this.config.get('TURN_SERVER_PORT')}?transport=tcp`,
        `turn:${turnIp}:${this.config.get('TURN_SERVER_TLS_PORT')}?transport=tcp`
      ]

      for (const url of turnUrls) {
        iceServers.push({
          urls: url,
          username: turnUser,
          credential: turnCred
        })
      }

      iceServers.push({
        urls: `stun:${turnIp}:${this.config.get('TURN_SERVER_PORT')}`
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
      this.emitError(socket, 'UNAUTHORIZED', 'User not authenticated', 401)
      return
    }

    if (this.isDebug) {
      console.log('[VideoCallHandler] CreateRoom request received')
    }

    if (!calleeId) {
      this.emitError(socket, 'INVALID_CALLEE', 'Callee ID is required', 400)
      return
    }

    if (callerId === calleeId) {
      this.emitError(socket, 'INVALID_CALLEE', 'Cannot call yourself', 400)
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
    socket.emit(VIDEO_CALL_EVENTS.ROOM_CREATED, this.wrap(response, 201))

    // Create minimal room object for notifyCallee
    const room: VideoCallRoom = {
      roomId,
      participants: [callerId, calleeId],
      activeParticipants: [callerId],
      createdAt,
      createdBy: callerId,
      isActive: true
    }

    const customer = (socket.data.user as any)?.customer
    const callerName = customer ? `${customer.firstName} ${customer.lastName}`.trim() : 'Người dùng'
    
    this.notifyCallee(room, calleeId, callerId, callerName)

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
      this.emitError(socket, 'UNAUTHORIZED', 'User not authenticated', 401)
      return
    }

    const { roomId } = data

    if (this.isDebug) {
      console.log(`[VideoCallHandler] JoinRoom - userId: ${userId}, roomId: ${roomId}`)
    }

    // Get room from Redis
    const room = await getVideoCallRoom(roomId)

    if (!room) {
      this.emitError(socket, 'ROOM_NOT_FOUND', 'Room not found', 404, roomId)
      return
    }

    if (!room.isActive) {
      this.emitError(socket, 'ROOM_NOT_ACTIVE', 'This call has ended', 410, roomId)
      return
    }

    // Only allow users in room.participants
    if (!room.participants.includes(userId)) {
      this.emitError(socket, 'NOT_INVITED', 'You are not invited to this call', 403, roomId)
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
      console.log(
        `[VideoCallHandler] User ${userId} joined room ${roomId}. Active participants:`,
        room.activeParticipants
      )
    }

    const participantEvent: RoomParticipantJoinedEvent = {
      roomId,
      userId,
      timestamp: new Date()
    }
    socket.to(roomId).emit(VIDEO_CALL_EVENTS.ROOM_PARTICIPANT_JOINED, this.wrap(participantEvent))

    const response: RoomJoinedEvent = {
      roomId,
      participants: room.activeParticipants,
      joinedAt: new Date()
    }
    socket.emit(VIDEO_CALL_EVENTS.ROOM_JOINED, this.wrap(response))

    const otherParticipant = room.activeParticipants.find((p) => p !== userId)
    if (otherParticipant) {
      // Notify existing peer that new user joined
      socket.to(roomId).emit(
        VIDEO_CALL_EVENTS.PEER_CONNECTED,
        this.wrap({
          roomId,
          peerUserId: userId,
          timestamp: new Date()
        })
      )
      if (this.isDebug) {
        console.log(
          `[VideoCallHandler] Sent PEER_CONNECTED to room ${roomId}: User ${userId} joined, notifying peer ${otherParticipant}`
        )
      }

      // Notify joining user that peer already exists in room
      socket.emit(
        VIDEO_CALL_EVENTS.PEER_CONNECTED,
        this.wrap({
          roomId,
          peerUserId: otherParticipant,
          timestamp: new Date()
        })
      )
      if (this.isDebug) {
        console.log(
          `[VideoCallHandler] Sent PEER_CONNECTED to User ${userId}: Peer ${otherParticipant} already in room ${roomId}`
        )
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

    const callEndedPayload: CallEndedEvent = {
      roomId,
      endedBy: userId,
      reason: 'Participant left - call ended for everyone',
      endedAt: new Date()
    }

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
      this.notificationService.notifyCallCancelled(participantId, roomId).catch(err => 
        console.error(`[VideoCall] Failed to send FCM call ended to ${participantId}:`, err)
      )
    }

    if (this.isDebug) {
      console.log(`[VideoCallHandler] Room ${roomId} ended - user ${userId} left. Room deleted.`)
    }

    const roomLeftPayload: RoomLeftEvent = {
      roomId,
      userId,
      leftAt: new Date()
    }
    socket.emit(VIDEO_CALL_EVENTS.ROOM_LEFT, this.wrap(roomLeftPayload))

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
      this.emitError(socket, 'INVALID_OFFER', 'Invalid offer payload', 400, roomId)
      return
    }

    const room = await getVideoCallRoom(roomId)

    if (!room) {
      this.emitError(socket, 'ROOM_NOT_FOUND', 'Room not found', 404, roomId)
      return
    }

    if (!room.activeParticipants.includes(userId)) {
      this.emitError(socket, 'USER_NOT_IN_ROOM', 'You are not in this room', 403, roomId)
      return
    }

    socket.to(roomId).emit(VIDEO_CALL_EVENTS.OFFER, this.wrap({ roomId, offer, from: userId }))
  }

  /**
   * Handle WebRTC Answer
   */
  async handleAnswer(socket: Socket, data: AnswerEvent): Promise<void> {
    const userId = socket.data.userId as string
    const { roomId, answer } = data

    if (!answer || typeof answer !== 'object' || !answer.type || !answer.sdp) {
      this.emitError(socket, 'INVALID_ANSWER', 'Invalid answer payload', 400, roomId)
      return
    }

    const room = await getVideoCallRoom(roomId)

    if (!room) {
      this.emitError(socket, 'ROOM_NOT_FOUND', 'Room not found', 404, roomId)
      return
    }

    if (!room.activeParticipants.includes(userId)) {
      this.emitError(socket, 'USER_NOT_IN_ROOM', 'You are not in this room', 403, roomId)
      return
    }

    socket.to(roomId).emit(VIDEO_CALL_EVENTS.ANSWER, this.wrap({ roomId, answer, from: userId }))
  }

  /**
   * Handle ICE Candidate
   */
  async handleIceCandidate(socket: Socket, data: IceCandidateEvent): Promise<void> {
    const userId = socket.data.userId as string
    const { roomId, candidate } = data

    if (!roomId) {
      this.emitError(socket, 'INVALID_ROOM_ID', 'Room ID is required', 400)
      return
    }

    const room = await getVideoCallRoom(roomId)

    if (!room) {
      this.emitError(socket, 'ROOM_NOT_FOUND', 'Room not found', 404, roomId)
      return
    }

    if (!room.activeParticipants.includes(userId)) {
      this.emitError(socket, 'USER_NOT_IN_ROOM', 'You are not in this room', 403, roomId)
      return
    }

    socket.to(roomId).emit(VIDEO_CALL_EVENTS.ICE_CANDIDATE, this.wrap({ roomId, candidate, from: userId }))
  }

  /**
   * Handle call acceptance
   */
  async handleCallAccepted(socket: Socket, data: { roomId: string }): Promise<void> {
    const userId = socket.data.userId as string
    const { roomId } = data

    const room = await getVideoCallRoom(roomId)

    if (!room) {
      this.emitError(socket, 'ROOM_NOT_FOUND', 'Room not found', 404, roomId)
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

    // Notify caller devices via Push
    this.notificationService.notifyUser(room.createdBy, {
      data: {
        type: 'VIDEO_CALL_REJECTED',
        roomId,
        reason: reason || 'N/A'
      },
      priority: 'high',
      ttl: 60
    }).catch(err => console.error(`[VideoCall] Failed to send FCM call rejected to ${room.createdBy}:`, err))

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
      this.emitToUserSockets(participantId, VIDEO_CALL_EVENTS.CALL_ENDED, callEndedPayload)
      this.notificationService.notifyCallCancelled(participantId, roomId).catch(err => 
        console.error(`[VideoCall] Failed to send FCM call ended to ${participantId}:`, err)
      )
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
      const otherParticipant = room.activeParticipants.find((p) => p !== userId)
      if (otherParticipant) {
        socket.to(roomId).emit(
          VIDEO_CALL_EVENTS.ICE_STATE_CHANGED,
          this.wrap({
            roomId,
            peerUserId: userId,
            iceConnectionState,
            iceGatheringState,
            timestamp: new Date()
          })
        )
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
      socket.to(roomId).emit(
        VIDEO_CALL_EVENTS.PEER_STATS,
        this.wrap({
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
      )
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
  private notifyCallee(room: VideoCallRoom, calleeId: string, callerId: string, callerName: string): void {
    const callRequest: CallRequestEvent = {
      roomId: room.roomId,
      callerId,
      calleeId,
      timestamp: new Date()
    }

    if (this.io) {
      this.io.to(`user:${calleeId}`).emit(VIDEO_CALL_EVENTS.CALL_REQUEST, this.wrap(callRequest))
    }

    // Send Push Notification (FCM)
    this.notificationService.notifyCallRequest(calleeId, {
      roomId: room.roomId,
      callerId,
      callerName
    }).catch(err => console.error(`[VideoCall] Failed to send FCM call request to ${calleeId}:`, err))
  }

  /**
   * Emit wrapped payload to all sockets of a user
   */
  private emitToUserSockets(userId: string, event: string, payload: unknown): void {
    if (!this.io) {
      return
    }

    this.io.to(`user:${userId}`).emit(event, this.wrap(payload))
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
