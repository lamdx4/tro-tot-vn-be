import { Socket } from 'socket.io'
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
  RoomParticipantLeftEvent,
  OfferEvent,
  AnswerEvent,
  IceCandidateEvent,
  CallRequestEvent,
  CallAcceptedEvent,
  CallRejectedEvent,
  CallEndedEvent,
  CallErrorEvent,
  RoomErrorEvent,
  IceConnectionStateEvent,
  ConnectionStatsEvent
} from '@/utils/types/webrtc-signaling'
import { env } from '@/preload-env'

/**
 * VideoCallHandler - Handles 1-on-1 video call signaling via Socket.IO
 *
 * Responsibilities:
 * - ICE server configuration delivery
 * - Room management for video calls
 * - WebRTC signaling (offer/answer/ICE candidate exchange)
 * - Call state management
 */
export class VideoCallHandler {
  // In-memory room storage (in production, use Redis for scalability)
  private rooms: Map<string, VideoCallRoom> = new Map()
  // Track socket to room mapping
  private socketRooms: Map<string, string> = new Map()
  // Track userId to socket mapping (for direct notifications)
  private userSockets: Map<number, Socket> = new Map()

  constructor() {
    console.log('[VideoCallHandler] Initialized')
  }

  /**
   * Get ICE server configuration for client
   */
  handleGetIceConfig(socket: Socket): void {
    const iceServers = this.buildIceServers()
    
    const response: IceServersResponse = { iceServers }
    
    socket.emit(VIDEO_CALL_EVENTS.ICE_CONFIG, response)
    console.log('[VideoCallHandler] Sent ICE config to user:', socket.data.userId)
  }

  /**
   * Build ICE servers configuration from environment variables
   */
  private buildIceServers(): IceServerConfig[] {
    const iceServers: IceServerConfig[] = []

    // Add STUN servers from config
    const stunUrls = env.STUN_SERVER_URLS.split(',')
    for (const url of stunUrls) {
      const trimmed = url.trim()
      if (trimmed) {
        iceServers.push({ urls: trimmed })
      }
    }

    // Add TURN server if configured
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

      // Also add STUN for this server
      iceServers.push({
        urls: `stun:${env.TURN_SERVER_IP}:${env.TURN_SERVER_PORT}`
      })
    }

    console.log('[VideoCallHandler] ICE servers configured:', iceServers.map(s => s.urls))
    return iceServers
  }

  /**
   * Create a new video call room
   */
  handleCreateRoom(socket: Socket, data: CreateRoomEvent): void {
    const callerId = socket.data.userId as number
    const { calleeId } = data

    console.log('[VideoCallHandler] CreateRoom - callerId:', callerId, 'calleeId:', calleeId, 'types:', typeof callerId, typeof calleeId)

    if (!calleeId) {
      this.emitError(socket, 'INVALID_CALLEE', 'Callee ID is required')
      return
    }

    if (callerId === calleeId) {
      this.emitError(socket, 'INVALID_CALLEE', 'Cannot call yourself')
      return
    }

    // Generate unique room ID
    const roomId = this.generateRoomId(callerId, calleeId)

    // Check if room already exists
    if (this.rooms.has(roomId)) {
      const existingRoom = this.rooms.get(roomId)!
      if (existingRoom.isActive) {
        // Room exists and is active - join instead
        this.handleJoinRoom(socket, { roomId })
        return
      }
    }

    // Create new room
    const room: VideoCallRoom = {
      roomId,
      participants: [callerId, calleeId],
      createdAt: new Date(),
      createdBy: callerId,
      isActive: true
    }

    this.rooms.set(roomId, room)
    this.socketRooms.set(socket.id, roomId)
    this.userSockets.set(callerId, socket)

    // Join socket to room
    socket.join(roomId)

    // Notify caller
    const response: RoomCreatedEvent = {
      roomId,
      callerId,
      calleeId,
      createdAt: room.createdAt
    }
    socket.emit(VIDEO_CALL_EVENTS.ROOM_CREATED, response)

    // Send call request to callee
    this.notifyCallee(room, calleeId, callerId)

    console.log(`[VideoCallHandler] Room created: ${roomId} by user ${callerId}`)
  }

  /**
   * Join an existing video call room
   */
  handleJoinRoom(socket: Socket, data: JoinRoomEvent): void {
    const userId = socket.data.userId as number
    const { roomId } = data

    console.log('[VideoCallHandler] JoinRoom - userId:', userId, 'roomId:', roomId, 'type:', typeof userId)

    const room = this.rooms.get(roomId)

    console.log('[VideoCallHandler] JoinRoom - room:', room, 'participants:', room?.participants)

    if (!room) {
      const error: RoomErrorEvent = {
        code: 'ROOM_NOT_FOUND',
        message: 'Room not found'
      }
      socket.emit(VIDEO_CALL_EVENTS.ROOM_NOT_FOUND, error)
      return
    }

    if (!room.isActive) {
      this.emitError(socket, 'ROOM_NOT_ACTIVE', 'This call has ended')
      return
    }

    if (!room.participants.includes(userId)) {
      this.emitError(socket, 'USER_NOT_IN_ROOM', 'You are not invited to this call')
      return
    }

    if (this.socketRooms.has(socket.id)) {
      // Already in a room, leave first
      this.handleLeaveRoom(socket, { roomId: this.socketRooms.get(socket.id)! })
    }

    // Join room
    this.socketRooms.set(socket.id, roomId)
    this.userSockets.set(userId, socket)
    socket.join(roomId)

    // Notify other participant
    const participantEvent: RoomParticipantJoinedEvent = {
      roomId,
      userId,
      timestamp: new Date()
    }
    socket.to(roomId).emit(VIDEO_CALL_EVENTS.ROOM_PARTICIPANT_JOINED, participantEvent)

    // Send room info to joining user
    const response: RoomJoinedEvent = {
      roomId,
      participants: room.participants,
      joinedAt: new Date()
    }
    socket.emit(VIDEO_CALL_EVENTS.ROOM_JOINED, response)

    // Notify the other peer that connection can begin
    const otherParticipant = room.participants.find(p => p !== userId)
    if (otherParticipant) {
      const peerConnectedEvent = {
        roomId,
        peerUserId: userId,
        timestamp: new Date()
      }
      socket.to(roomId).emit(VIDEO_CALL_EVENTS.PEER_CONNECTED, peerConnectedEvent)
    }

    console.log(`[VideoCallHandler] User ${userId} joined room ${roomId}`)
  }

  /**
   * Leave a video call room
   */
  handleLeaveRoom(socket: Socket, data: LeaveRoomEvent): void {
    const userId = socket.data.userId as number
    const { roomId } = data

    const room = this.rooms.get(roomId)

    if (!room) {
      return // Room might already be deleted
    }

    // Remove from room
    room.participants = room.participants.filter(p => p !== userId)
    this.socketRooms.delete(socket.id)
    this.userSockets.delete(userId)
    socket.leave(roomId)

    // Notify remaining participant
    const leaveEvent: RoomParticipantLeftEvent = {
      roomId,
      userId,
      timestamp: new Date()
    }
    socket.to(roomId).emit(VIDEO_CALL_EVENTS.ROOM_PARTICIPANT_LEFT, leaveEvent)

    // Check if room should be deactivated
    if (room.participants.length < 2) {
      room.isActive = false
      
      // Notify remaining participant that call ended
      socket.to(roomId).emit(VIDEO_CALL_EVENTS.CALL_ENDED, {
        roomId,
        endedBy: userId,
        reason: 'Participant left',
        endedAt: new Date()
      } as CallEndedEvent)
    }

    // Clean up empty rooms after a delay
    if (room.participants.length === 0) {
      setTimeout(() => {
        const r = this.rooms.get(roomId)
        if (r && r.participants.length === 0) {
          this.rooms.delete(roomId)
          console.log(`[VideoCallHandler] Room ${roomId} cleaned up`)
        }
      }, 60000) // Keep room info for 1 minute after it ends
    }

    // Send confirmation to leaving user
    socket.emit(VIDEO_CALL_EVENTS.ROOM_LEFT, {
      roomId,
      userId,
      leftAt: new Date()
    } as RoomLeftEvent)

    console.log(`[VideoCallHandler] User ${userId} left room ${roomId}`)
  }

  /**
   * Handle WebRTC Offer
   */
  handleOffer(socket: Socket, data: OfferEvent): void {
    const userId = socket.data.userId as number
    const { roomId, offer } = data

    const room = this.rooms.get(roomId)

    if (!room) {
      this.emitError(socket, 'ROOM_NOT_FOUND', 'Room not found')
      return
    }

    if (!room.participants.includes(userId)) {
      this.emitError(socket, 'USER_NOT_IN_ROOM', 'You are not in this room')
      return
    }

    // Forward offer to the other participant
    socket.to(roomId).emit(VIDEO_CALL_EVENTS.OFFER, {
      roomId,
      offer,
      from: userId
    })

    console.log(`[VideoCallHandler] Forwarded offer from user ${userId} in room ${roomId}`)
  }

  /**
   * Handle WebRTC Answer
   */
  handleAnswer(socket: Socket, data: AnswerEvent): void {
    const userId = socket.data.userId as number
    const { roomId, answer } = data

    const room = this.rooms.get(roomId)

    if (!room) {
      this.emitError(socket, 'ROOM_NOT_FOUND', 'Room not found')
      return
    }

    if (!room.participants.includes(userId)) {
      this.emitError(socket, 'USER_NOT_IN_ROOM', 'You are not in this room')
      return
    }

    // Forward answer to the other participant
    socket.to(roomId).emit(VIDEO_CALL_EVENTS.ANSWER, {
      roomId,
      answer,
      from: userId
    })

    console.log(`[VideoCallHandler] Forwarded answer from user ${userId} in room ${roomId}`)
  }

  /**
   * Handle ICE Candidate
   */
  handleIceCandidate(socket: Socket, data: IceCandidateEvent): void {
    const userId = socket.data.userId as number
    const { roomId, candidate } = data

    const room = this.rooms.get(roomId)

    if (!room) {
      return // Silently ignore if room not found
    }

    if (!room.participants.includes(userId)) {
      return // Silently ignore if user not in room
    }

    // Forward ICE candidate to the other participant
    socket.to(roomId).emit(VIDEO_CALL_EVENTS.ICE_CANDIDATE, {
      roomId,
      candidate,
      from: userId
    })

    console.log(`[VideoCallHandler] Forwarded ICE candidate from user ${userId}`)
  }

  /**
   * Handle call acceptance
   */
  handleCallAccepted(socket: Socket, data: { roomId: string }): void {
    const userId = socket.data.userId as number
    const { roomId } = data

    const room = this.rooms.get(roomId)

    if (!room) {
      this.emitError(socket, 'ROOM_NOT_FOUND', 'Room not found')
      return
    }

    // Notify the caller
    socket.to(roomId).emit(VIDEO_CALL_EVENTS.CALL_ACCEPTED, {
      roomId,
      callerId: room.createdBy,
      calleeId: userId,
      acceptedAt: new Date()
    } as CallAcceptedEvent)

    console.log(`[VideoCallHandler] Call accepted in room ${roomId} by user ${userId}`)
  }

  /**
   * Handle call rejection
   */
  handleCallRejected(socket: Socket, data: { roomId: string; reason?: string }): void {
    const userId = socket.data.userId as number
    const { roomId, reason } = data

    const room = this.rooms.get(roomId)

    if (!room) {
      return
    }

    // Notify the caller
    socket.to(roomId).emit(VIDEO_CALL_EVENTS.CALL_REJECTED, {
      roomId,
      callerId: room.createdBy,
      calleeId: userId,
      reason,
      rejectedAt: new Date()
    } as CallRejectedEvent)

    // Deactivate room
    room.isActive = false

    console.log(`[VideoCallHandler] Call rejected in room ${roomId} by user ${userId}`)
  }

  /**
   * Handle call end
   */
  handleCallEnded(socket: Socket, data: { roomId: string; reason?: string }): void {
    const userId = socket.data.userId as number
    const { roomId, reason } = data

    const room = this.rooms.get(roomId)

    if (!room) {
      return
    }

    // Notify other participant
    socket.to(roomId).emit(VIDEO_CALL_EVENTS.CALL_ENDED, {
      roomId,
      endedBy: userId,
      reason,
      endedAt: new Date()
    } as CallEndedEvent)

    // Deactivate room
    room.isActive = false

    // Remove all participants from room
    for (const participantId of room.participants) {
      const participantSocket = this.userSockets.get(participantId)
      if (participantSocket) {
        this.socketRooms.delete(participantSocket.id)
        participantSocket.leave(roomId)
      }
    }
    this.userSockets.clear()

    console.log(`[VideoCallHandler] Call ended in room ${roomId} by user ${userId}`)
  }

  /**
   * Handle user disconnect - clean up
   */
  handleDisconnect(socket: Socket): void {
    const userId = socket.data.userId as number
    const roomId = this.socketRooms.get(socket.id)

    if (roomId) {
      this.handleLeaveRoom(socket, { roomId })
    }

    this.userSockets.delete(userId)
  }

  /**
   * Handle ICE connection state change from client
   * This allows the server to track the actual P2P connection state
   */
  handleIceStateChange(socket: Socket, data: IceConnectionStateEvent): void {
    const userId = socket.data.userId as number
    const { roomId, iceConnectionState, iceGatheringState } = data

    console.log(`[VideoCallHandler] ICE State Change - User ${userId}, Room ${roomId}, State: ${iceConnectionState}, Gathering: ${iceGatheringState}`)

    // Broadcast to other participant in the room
    const room = this.rooms.get(roomId)
    if (room) {
      const otherParticipant = room.participants.find(p => p !== userId)
      if (otherParticipant) {
        socket.to(roomId).emit(VIDEO_CALL_EVENTS.PEER_CONNECTED, {
          roomId,
          peerUserId: userId,
          state: iceConnectionState === 'connected' || iceConnectionState === 'completed' ? 'connected' : 'disconnected',
          iceConnectionState,
          iceGatheringState,
          timestamp: new Date()
        })
      }
    }
  }

  /**
   * Handle connection statistics from client
   * This allows the server to receive real-time stats about the P2P connection
   */
  handleConnectionStats(socket: Socket, data: ConnectionStatsEvent): void {
    const userId = socket.data.userId as number
    const { roomId, stats } = data

    console.log(`[VideoCallHandler] Connection Stats - User ${userId}, Room ${roomId}:`)
    console.log(`  - Bytes Sent: ${stats.bytesSent}`)
    console.log(`  - Bytes Received: ${stats.bytesReceived}`)
    console.log(`  - Packets Sent: ${stats.packetsSent}`)
    console.log(`  - Packets Received: ${stats.packetsReceived}`)
    console.log(`  - RTT: ${stats.rtt ? stats.rtt + 'ms' : 'N/A'}`)
    console.log(`  - State: ${stats.state}`)

    // Broadcast stats to other participant for quality monitoring
    const room = this.rooms.get(roomId)
    if (room) {
      socket.to(roomId).emit('video:call:peerStats', {
        roomId,
        peerUserId: userId,
        stats: {
          bytesSent: stats.bytesSent,
          bytesReceived: stats.bytesReceived,
          packetsLost: stats.packetsSent - stats.packetsReceived,
          rtt: stats.rtt
        },
        timestamp: new Date()
      })
    }
  }

  /**
   * Generate a unique room ID based on user IDs
   */
  private generateRoomId(userId1: number, userId2: number): string {
    const sortedIds = [userId1, userId2].sort((a, b) => a - b)
    return `video_${sortedIds[0]}_${sortedIds[1]}_${Date.now()}`
  }

  /**
   * Notify callee about incoming call
   */
  private notifyCallee(room: VideoCallRoom, calleeId: number, callerId: number): void {
    const calleeSocket = this.userSockets.get(calleeId)
    
    const callRequest: CallRequestEvent = {
      roomId: room.roomId,
      callerId,
      calleeId,
      timestamp: new Date()
    }

    if (calleeSocket) {
      // User is online, send directly
      calleeSocket.emit(VIDEO_CALL_EVENTS.CALL_REQUEST, callRequest)
    } else {
      // User is offline - could implement push notification here
      console.log(`[VideoCallHandler] Callee ${calleeId} is offline, call request queued`)
    }
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
  getRoom(roomId: string): VideoCallRoom | undefined {
    return this.rooms.get(roomId)
  }

  /**
   * Get all active rooms (for debugging)
   */
  getActiveRooms(): VideoCallRoom[] {
    return Array.from(this.rooms.values()).filter(r => r.isActive)
  }
}

