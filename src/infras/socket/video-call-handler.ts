import { Socket } from 'socket.io'
import { randomUUID } from 'crypto'
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
  // Use array to support multiple sockets per user
  private userSockets: Map<string, Set<Socket>> = new Map()
  // Track room cleanup timeouts to prevent race conditions
  private roomCleanupTimeouts: Map<string, NodeJS.Timeout> = new Map()
  // Fix 3: Debug flag for sensitive data logging
  private readonly isDebug = true // Force debug logging for video call debugging

  constructor() {
    if (this.isDebug) {
      console.log('[VideoCallHandler] Initialized')
    }
  }

  // FIX 2: Register socket on connection
  // FIX C: Unsafe userId truthy check - use explicit undefined/null check
  /**
   * Handle new socket connection - register user socket immediately
   * This ensures callee is reachable even before they create or join any room
   */
  handleConnection(socket: Socket): void {
    const userId = socket.data.userId as string
    if (userId !== undefined && userId !== null) {
      // Clean up any existing sockets for this user first to avoid duplicates
      this.cleanupUserSockets(userId)

      this.addUserSocket(userId, socket)
      if (this.isDebug) {
        console.log('[VideoCallHandler] Socket connected for user:', userId)
      }
    }
  }

  /**
   * Clean up stale sockets for a user before adding new one
   */
  private cleanupUserSockets(userId: string): void {
    const sockets = this.userSockets.get(userId)
    if (sockets) {
      // Remove disconnected sockets
      for (const s of sockets) {
        if (!s.connected) {
          sockets.delete(s)
        }
      }
      // If no sockets left, remove the entry
      if (sockets.size === 0) {
        this.userSockets.delete(userId)
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

    // Add STUN servers from config (with null check)
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

    if (this.isDebug) {
      console.log('[VideoCallHandler] ICE servers configured with', iceServers.length, 'servers')
    }
    return iceServers
  }

  /**
   * Create a new video call room
   */
  handleCreateRoom(socket: Socket, data: CreateRoomEvent): void {
    const callerId = socket.data.userId as string
    const { calleeId } = data

    // Fix 1: Missing userId validation
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
    // FIX 5: Initialize activeParticipants Set
    const room: VideoCallRoom = {
      roomId,
      participants: [callerId, calleeId],
      activeParticipants: new Set<string>([callerId]),
      createdAt: new Date(),
      createdBy: callerId,
      isActive: true
    }

    this.rooms.set(roomId, room)
    this.socketRooms.set(socket.id, roomId)
    this.addUserSocket(callerId, socket)

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

    if (this.isDebug) {
      console.log(`[VideoCallHandler] Room created: ${roomId} by caller`)
    }
  }

  /**
   * Join an existing video call room
   */
  handleJoinRoom(socket: Socket, data: JoinRoomEvent): void {
    const userId = socket.data.userId as string

    // Add validation for userId
    if (!userId) {
      this.emitError(socket, 'UNAUTHORIZED', 'User not authenticated')
      return
    }

    const { roomId } = data

    if (this.isDebug) {
      console.log(`[VideoCallHandler] JoinRoom - userId: ${userId}, roomId: ${roomId}`)
    }

    const room = this.rooms.get(roomId)

    if (!room) {
      if (this.isDebug) {
        console.log(`[VideoCallHandler] JoinRoom - ROOM NOT FOUND: ${roomId}`)
      }
      const error: RoomErrorEvent = {
        code: 'ROOM_NOT_FOUND',
        message: 'Room not found'
      }
      socket.emit(VIDEO_CALL_EVENTS.ROOM_NOT_FOUND, error)
      return
    }

    if (!room.isActive) {
      if (this.isDebug) {
        console.log(`[VideoCallHandler] JoinRoom - ROOM NOT ACTIVE: ${roomId}`)
      }
      this.emitError(socket, 'ROOM_NOT_ACTIVE', 'This call has ended')
      return
    }

    if (this.isDebug) {
      console.log(`[VideoCallHandler] JoinRoom - room found, isActive: ${room.isActive}, activeParticipants:`, [...(room.activeParticipants ?? [])])
    }

    // Don't modify participants array - it's the original invited list
    // activeParticipants tracks who's currently in the room

    if (this.socketRooms.has(socket.id)) {
      // Already in a room, leave first
      console.log(`[VideoCallHandler] JoinRoom - socket already in room, leaving first`)
      this.handleLeaveRoom(socket, { roomId: this.socketRooms.get(socket.id)! })
    }

    // FIX 7: Clear cleanup timeout on re-join
    const existingTimeout = this.roomCleanupTimeouts.get(roomId)
    if (existingTimeout) {
      clearTimeout(existingTimeout)
      this.roomCleanupTimeouts.delete(roomId)
    }

    // FIX 5: Join room - handle multi-socket scenario and add to activeParticipants
    // FIX D: Guard activeParticipants may be undefined
    this.socketRooms.set(socket.id, roomId)
    this.addUserSocket(userId, socket)
    room.activeParticipants ??= new Set<string>()
    room.activeParticipants.add(userId)
    socket.join(roomId)

    if (this.isDebug) {
      console.log(`[VideoCallHandler] User ${userId} joined room ${roomId}. Active participants:`, [...room.activeParticipants])
    }

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
      participants: [...room.activeParticipants], // Use activeParticipants, not participants
      joinedAt: new Date()
    }
    socket.emit(VIDEO_CALL_EVENTS.ROOM_JOINED, response)

    // Notify the other peer that connection can begin
    // Use activeParticipants to find who else is in the room
    const activeList = [...room.activeParticipants]
    const otherParticipant = activeList.find(p => p !== userId)
    if (otherParticipant) {
      // Send PEER_CONNECTED to the other participant (User1) - telling them User2 has joined
      const peerConnectedEvent = {
        roomId,
        peerUserId: userId,
        timestamp: new Date()
      }
      socket.to(roomId).emit(VIDEO_CALL_EVENTS.PEER_CONNECTED, peerConnectedEvent)
      if (this.isDebug) {
        console.log(`[VideoCallHandler] Sent PEER_CONNECTED to room ${roomId}: User ${userId} joined, notifying peer ${otherParticipant}`)
      }

      // Send PEER_CONNECTED to the joining user (User2) - telling them User1 is already in the room
      // This is CRITICAL for triggering the offer creation from the joiner
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
  handleLeaveRoom(socket: Socket, data: LeaveRoomEvent): void {
    const userId = socket.data.userId as string
    const { roomId } = data

    const room = this.rooms.get(roomId)

    if (!room) {
      return // Room might already be deleted
    }

    // FIX 5: Remove from activeParticipants instead of filtering participants
    // (participants is the original invited list, never mutate it)
    // FIX D: Guard activeParticipants may be undefined
    room.activeParticipants ??= new Set<string>()
    room.activeParticipants.delete(userId)
    this.socketRooms.delete(socket.id)
    this.removeUserSocket(userId, socket)
    socket.leave(roomId)

    // When ANY user leaves, end the call for EVERYONE and delete the room
    // Room ID will no longer be valid - must create new room
    room.isActive = false

    // Build call ended payload BEFORE deleting room
    const callEndedPayload = {
      roomId,
      endedBy: userId,
      reason: 'Participant left - call ended for everyone',
      endedAt: new Date()
    } as CallEndedEvent

    // Get remaining participants BEFORE deleting room
    const remainingParticipants = Array.from(room.activeParticipants)

    // Delete the room IMMEDIATELY - room ID is no longer valid
    this.rooms.delete(roomId)

    // Clear any cleanup timeout
    const existingTimeout = this.roomCleanupTimeouts.get(roomId)
    if (existingTimeout) {
      clearTimeout(existingTimeout)
      this.roomCleanupTimeouts.delete(roomId)
    }

    // Notify remaining participants AFTER deleting room
    for (const participantId of remainingParticipants) {
      if (participantId === userId) continue
      this.emitToUserSockets(participantId, VIDEO_CALL_EVENTS.CALL_ENDED, callEndedPayload)
    }

    if (this.isDebug) {
      console.log(`[VideoCallHandler] Room ${roomId} ended - user ${userId} left. Room deleted.`)
    }

    // Send confirmation to leaving user
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
  handleOffer(socket: Socket, data: OfferEvent): void {
    const userId = socket.data.userId as string
    const { roomId, offer } = data

    // Input validation - ensure offer is a valid object with required fields
    if (!offer || typeof offer !== 'object' || !offer.type || !offer.sdp) {
      this.emitError(socket, 'INVALID_OFFER', 'Invalid offer payload')
      return
    }

    const room = this.rooms.get(roomId)

    if (!room) {
      this.emitError(socket, 'ROOM_NOT_FOUND', 'Room not found')
      return
    }

    // FIX F: Check activeParticipants, not participants (participants never changes)
    const active = room.activeParticipants ?? new Set()
    if (!active.has(userId)) {
      if (this.isDebug) {
        console.log(`[VideoCallHandler] handleOffer - USER ${userId} NOT FOUND in activeParticipants!`)
      }
      this.emitError(socket, 'USER_NOT_IN_ROOM', 'You are not in this room')
      return
    }

    // Forward offer to the other participant
    socket.to(roomId).emit(VIDEO_CALL_EVENTS.OFFER, {
      roomId,
      offer,
      from: userId
    })

    if (this.isDebug) {
      console.log(`[VideoCallHandler] Forwarded OFFER in room ${roomId} from ${userId}`)
    }
  }

  /**
   * Handle WebRTC Answer
   */
  handleAnswer(socket: Socket, data: AnswerEvent): void {
    const userId = socket.data.userId as string
    const { roomId, answer } = data

    // Input validation - ensure answer is a valid object with required fields
    if (!answer || typeof answer !== 'object' || !answer.type || !answer.sdp) {
      this.emitError(socket, 'INVALID_ANSWER', 'Invalid answer payload')
      return
    }

    const room = this.rooms.get(roomId)

    if (!room) {
      this.emitError(socket, 'ROOM_NOT_FOUND', 'Room not found')
      return
    }

    // FIX F: Check activeParticipants, not participants (participants never changes)
    const active = room.activeParticipants ?? new Set()
    if (!active.has(userId)) {
      if (this.isDebug) {
        console.log(`[VideoCallHandler] handleAnswer - USER ${userId} NOT FOUND in activeParticipants!`)
      }
      this.emitError(socket, 'USER_NOT_IN_ROOM', 'You are not in this room')
      return
    }

    // Forward answer to the other participant
    socket.to(roomId).emit(VIDEO_CALL_EVENTS.ANSWER, {
      roomId,
      answer,
      from: userId
    })

    if (this.isDebug) {
      console.log(`[VideoCallHandler] Forwarded answer in room ${roomId}`)
    }
  }

  /**
   * Handle ICE Candidate
   */
  handleIceCandidate(socket: Socket, data: IceCandidateEvent): void {
    const userId = socket.data.userId as string
    const { roomId, candidate } = data

    // Input validation - standardize error handling
    if (!roomId) {
      this.emitError(socket, 'INVALID_ROOM_ID', 'Room ID is required')
      return
    }

    const room = this.rooms.get(roomId)

    if (!room) {
      this.emitError(socket, 'ROOM_NOT_FOUND', 'Room not found')
      return
    }

    // FIX F: Check activeParticipants, not participants (participants never changes)
    const active = room.activeParticipants ?? new Set()
    if (!active.has(userId)) {
      if (this.isDebug) {
        console.log(`[VideoCallHandler] handleIceCandidate - USER ${userId} NOT FOUND in activeParticipants!`)
      }
      this.emitError(socket, 'USER_NOT_IN_ROOM', 'You are not in this room')
      return
    }

    // Forward ICE candidate to the other participant
    socket.to(roomId).emit(VIDEO_CALL_EVENTS.ICE_CANDIDATE, {
      roomId,
      candidate,
      from: userId
    })

    if (this.isDebug) {
      console.log(`[VideoCallHandler] Forwarded ICE candidate in room ${roomId}`)
    }
  }

  /**
   * Handle call acceptance
   */
  handleCallAccepted(socket: Socket, data: { roomId: string }): void {
    const userId = socket.data.userId as string
    const { roomId } = data

    const room = this.rooms.get(roomId)

    if (!room) {
      this.emitError(socket, 'ROOM_NOT_FOUND', 'Room not found')
      return
    }

    // FIX 6: Deliver CALL_ACCEPTED via userSockets fallback
    // FIX B: Remove socket.to() to avoid double-emit, only use userSockets direct delivery
    // FIX G: Use emitToUserSockets helper
    const callAcceptedPayload: CallAcceptedEvent = {
      roomId,
      callerId: room.createdBy,
      calleeId: userId,
      acceptedAt: new Date()
    }

    // Only notify directly to caller's sockets via userSockets (no socket.to)
    this.emitToUserSockets(room.createdBy, VIDEO_CALL_EVENTS.CALL_ACCEPTED, callAcceptedPayload)

    if (this.isDebug) {
      console.log(`[VideoCallHandler] Call accepted in room ${roomId}`)
    }
  }

  /**
   * Handle call rejection
   */
  handleCallRejected(socket: Socket, data: { roomId: string; reason?: string }): void {
    const userId = socket.data.userId as string
    const { roomId, reason } = data

    const room = this.rooms.get(roomId)

    if (!room) {
      return
    }

    // FIX 6: Deliver CALL_REJECTED via userSockets fallback
    // FIX B: Remove socket.to() to avoid double-emit, only use userSockets direct delivery
    // FIX G: Use emitToUserSockets helper
    const callRejectedPayload: CallRejectedEvent = {
      roomId,
      callerId: room.createdBy,
      calleeId: userId,
      reason,
      rejectedAt: new Date()
    }

    // Only notify directly to caller's sockets via userSockets (no socket.to)
    this.emitToUserSockets(room.createdBy, VIDEO_CALL_EVENTS.CALL_REJECTED, callRejectedPayload)

    // FIX E: Cleanup socketRooms and schedule room deletion
    room.isActive = false

    // Cleanup socketRooms for all participants
    for (const participantId of room.participants) {
      const sockets = this.userSockets.get(participantId)
      if (sockets) {
        for (const s of sockets) {
          this.socketRooms.delete(s.id)
          s.leave(roomId)
        }
      }
    }

    // Schedule room deletion
    const existingTimeout = this.roomCleanupTimeouts.get(roomId)
    if (existingTimeout) {
      clearTimeout(existingTimeout)
    }
    const timeout = setTimeout(() => {
      this.rooms.delete(roomId)
      this.roomCleanupTimeouts.delete(roomId)
      if (this.isDebug) {
        console.log(`[VideoCallHandler] Room ${roomId} cleaned up after rejection`)
      }
    }, 60000)
    this.roomCleanupTimeouts.set(roomId, timeout)

    if (this.isDebug) {
      console.log(`[VideoCallHandler] Call rejected in room ${roomId}`)
    }
  }

  /**
   * Handle call end
   */
  handleCallEnded(socket: Socket, data: { roomId: string; reason?: string }): void {
    const userId = socket.data.userId as string
    const { roomId, reason } = data

    const room = this.rooms.get(roomId)

    if (!room) {
      return
    }

    // Build call ended payload
    const callEndedPayload: CallEndedEvent = {
      roomId,
      endedBy: userId,
      reason,
      endedAt: new Date()
    }

    // Get remaining participants BEFORE deleting room
    const remainingParticipants = Array.from(room.activeParticipants ?? [])

    // Delete the room IMMEDIATELY - room ID is no longer valid
    this.rooms.delete(roomId)

    // Clear any cleanup timeout
    const existingTimeout = this.roomCleanupTimeouts.get(roomId)
    if (existingTimeout) {
      clearTimeout(existingTimeout)
      this.roomCleanupTimeouts.delete(roomId)
    }

    // Notify remaining participants AFTER deleting room
    for (const participantId of remainingParticipants) {
      if (participantId === userId) continue
      this.emitToUserSockets(participantId, VIDEO_CALL_EVENTS.CALL_ENDED, callEndedPayload)
    }

    // Cleanup socketRooms for all participants
    for (const participantId of room.participants) {
      const sockets = this.userSockets.get(participantId)
      if (sockets) {
        for (const participantSocket of sockets) {
          this.socketRooms.delete(participantSocket.id)
          participantSocket.leave(roomId)
        }
      }
    }

    if (this.isDebug) {
      console.log(`[VideoCallHandler] Call ended in room ${roomId} - room deleted immediately`)
    }
  }

  /**
   * Handle user disconnect - clean up
   */
  handleDisconnect(socket: Socket): void {
    const userId = socket.data?.userId as string | undefined
    const roomId = this.socketRooms.get(socket.id)

    if (this.isDebug) {
      console.log(`[VideoCallHandler] Disconnect - userId: ${userId}, roomId: ${roomId}`)
    }

    // Validate userId exists before using it
    if (userId === undefined || userId === null) {
      // Still cleanup socketRooms entry
      this.socketRooms.delete(socket.id)
      return
    }

    if (roomId) {
      this.handleLeaveRoom(socket, { roomId })
    }

    // Remove socket from socketRooms
    this.socketRooms.delete(socket.id)

    // Remove socket from userSockets (not all sockets for user)
    this.removeUserSocket(userId, socket)
  }

  /**
   * Handle ICE connection state change from client
   * This allows the server to track the actual P2P connection state
   */
  handleIceStateChange(socket: Socket, data: IceConnectionStateEvent): void {
    const userId = socket.data.userId as string
    const { roomId, iceConnectionState, iceGatheringState } = data

    // Only log occasionally to avoid flooding
    if (this.isDebug && Math.random() < 0.01) {
      console.log(`[VideoCallHandler] ICE State Change - Room ${roomId}, State: ${iceConnectionState}`)
    }

    // Broadcast to other participant in the room using a SEPARATE event
    // Do NOT use PEER_CONNECTED - use ICE_STATE_CHANGED for ICE state updates
    const room = this.rooms.get(roomId)
    if (room) {
      const active = room.activeParticipants ?? new Set()
      const otherParticipant = [...active].find(p => p !== userId)
      if (otherParticipant) {
        // Use ICE_STATE_CHANGED event for ICE state updates - NOT PEER_CONNECTED
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
   * This allows the server to receive real-time stats about the P2P connection
   */
  handleConnectionStats(socket: Socket, data: ConnectionStatsEvent): void {
    const userId = socket.data.userId as string
    const { roomId, stats } = data

    // Only log occasionally to avoid flooding
    if (this.isDebug && Math.random() < 0.01) {
      console.log(`[VideoCallHandler] Connection Stats - Room ${roomId}, State: ${stats.state}`)
    }

    // Broadcast stats to other participant for quality monitoring
    const room = this.rooms.get(roomId)
    if (room) {
      // Fix 2: Use constant instead of hardcoded string
      socket.to(roomId).emit(VIDEO_CALL_EVENTS.PEER_STATS, {
        roomId,
        peerUserId: userId,
        stats: {
          bytesSent: stats.bytesSent,
          bytesReceived: stats.bytesReceived,
          // FIX 4: Use actual measured value instead of calculated
          packetsLost: stats.packetsLost ?? null,
          rtt: stats.rtt
        },
        timestamp: new Date()
      })
    }
  }

  /**
   * Generate a unique room ID based on user IDs
   */
  private generateRoomId(userId1: string, userId2: string): string {
    const sortedIds = [userId1, userId2].sort()
    // Use UUID to prevent collisions from Date.now() collisions
    return `video_${sortedIds[0]}_${sortedIds[1]}_${randomUUID()}`
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

    // FIX G: Use emitToUserSockets helper instead of manual loop
    const sockets = this.userSockets.get(calleeId)
    if (sockets && sockets.size > 0) {
      // User is online, send to all their sockets
      this.emitToUserSockets(calleeId, VIDEO_CALL_EVENTS.CALL_REQUEST, callRequest)
    } else {
      // Callee is offline - emit CALL_ERROR but keep room ACTIVE
      // The room should remain active so the callee can still join later
      if (this.isDebug) {
        console.log(`[VideoCallHandler] Callee ${calleeId} is offline, call request not delivered`)
      }

      // Emit error to caller (informational only, room stays active)
      this.emitToUserSockets(callerId, VIDEO_CALL_EVENTS.CALL_ERROR, {
        roomId: room.roomId,
        code: 'CALLEE_OFFLINE',
        message: 'User is not available',
        timestamp: new Date()
      } as CallErrorEvent)

      // DO NOT deactivate room or cleanup - keep it active for callee to join later
      // The caller stays in the room waiting for the callee
    }
  }

  /**
   * Add a socket for a user (supports multiple sockets per user)
   */
  private addUserSocket(userId: string, socket: Socket): void {
    let sockets = this.userSockets.get(userId)
    if (!sockets) {
      sockets = new Set<Socket>()
      this.userSockets.set(userId, sockets)
    }
    sockets.add(socket)
  }

  /**
   * Remove a specific socket for a user
   */
  private removeUserSocket(userId: string, socket: Socket): void {
    const sockets = this.userSockets.get(userId)
    if (sockets) {
      sockets.delete(socket)
      if (sockets.size === 0) {
        this.userSockets.delete(userId)
      }
    }
  }

  // FIX G: Dead socket cleanup before emitting
  /**
   * Emit to all sockets of a user, checking for connected sockets and pruning dead ones
   */
  // FIX 3: Fix Set mutation during iteration
  private emitToUserSockets(userId: string, event: string, payload: unknown): void {
    const sockets = this.userSockets.get(userId)
    if (!sockets) return

    // Collect dead sockets first (cannot delete during iteration)
    const deadSockets: Socket[] = []
    for (const s of sockets) {
      if (s.connected) {
        s.emit(event, payload)
      } else {
        deadSockets.push(s)
      }
    }

    // Now remove dead sockets after iteration
    for (const dead of deadSockets) {
      sockets.delete(dead)
    }

    if (sockets.size === 0) {
      this.userSockets.delete(userId)
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

