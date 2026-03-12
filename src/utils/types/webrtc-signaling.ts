// WebRTC / Video Call Signaling Types

/**
 * ICE Server Configuration
 * Used by clients to configure their RTCPeerConnection
 */
export interface IceServerConfig {
  urls: string
  username?: string
  credential?: string
}

export interface IceServersResponse {
  iceServers: IceServerConfig[]
}

/**
 * Video Call Room
 * Represents a 1-on-1 video call room
 */
export interface VideoCallRoom {
  roomId: string
  participants: string[] // User IDs - original invited list (never mutated after creation)
  activeParticipants: Set<string> // Track who is currently connected
  createdAt: Date
  createdBy: string
  isActive: boolean
}

/**
 * Video Call Signaling Events
 */
export const VIDEO_CALL_EVENTS = {
  // ICE Configuration
  GET_ICE_CONFIG: 'video:call:getIceConfig',
  ICE_CONFIG: 'video:call:iceConfig',

  // Room management
  CREATE_ROOM: 'video:call:createRoom',
  ROOM_CREATED: 'video:call:roomCreated',
  JOIN_ROOM: 'video:call:joinRoom',
  ROOM_JOINED: 'video:call:roomJoined',
  LEAVE_ROOM: 'video:call:leaveRoom',
  ROOM_LEFT: 'video:call:roomLeft',
  ROOM_PARTICIPANT_JOINED: 'video:call:participantJoined',
  ROOM_PARTICIPANT_LEFT: 'video:call:participantLeft',
  ROOM_FULL: 'video:call:roomFull',
  ROOM_NOT_FOUND: 'video:call:roomNotFound',

  // WebRTC Signaling
  OFFER: 'video:call:offer',
  ANSWER: 'video:call:answer',
  ICE_CANDIDATE: 'video:call:iceCandidate',

  // Call states
  CALL_REQUEST: 'video:call:request',
  CALL_ACCEPTED: 'video:call:accepted',
  CALL_REJECTED: 'video:call:rejected',
  CALL_ENDED: 'video:call:ended',
  CALL_ERROR: 'video:call:error',

  // Connection state
  PEER_CONNECTED: 'video:call:peerConnected',
  PEER_DISCONNECTED: 'video:call:peerDisconnected',
  ICE_STATE_CHANGED: 'video:call:iceStateChanged',
  PEER_STATS: 'video:call:peerStats'
} as const

// Payload types for signaling events

/**
 * Request to get ICE configuration
 */
export interface GetIceConfigEvent {
  // No payload required - uses server config
}

/**
 * ICE configuration response from server
 */
export interface IceConfigEvent {
  iceServers: IceServerConfig[]
}

/**
 * Create a video call room
 */
export interface CreateRoomEvent {
  calleeId: string // The user being called
}

/**
 * Room created response
 */
export interface RoomCreatedEvent {
  roomId: string
  callerId: string
  calleeId: string
  createdAt: Date
}

/**
 * Join an existing room
 */
export interface JoinRoomEvent {
  roomId: string
}

/**
 * Room joined response
 */
export interface RoomJoinedEvent {
  roomId: string
  participants: string[]
  joinedAt: Date
}

/**
 * Leave a room
 */
export interface LeaveRoomEvent {
  roomId: string
}

/**
 * Room left response
 */
export interface RoomLeftEvent {
  roomId: string
  userId: string
  leftAt: Date
}

/**
 * Participant joined room event
 */
export interface RoomParticipantJoinedEvent {
  roomId: string
  userId: string
  timestamp: Date
}

/**
 * Participant left room event
 */
export interface RoomParticipantLeftEvent {
  roomId: string
  userId: string
  timestamp: Date
}

/**
 * WebRTC Offer from caller to callee
 */
export interface OfferEvent {
  roomId: string
  offer: RTCSessionDescriptionInit
  from: string // sender userId
}

/**
 * WebRTC Answer from callee to caller
 */
export interface AnswerEvent {
  roomId: string
  answer: RTCSessionDescriptionInit
  from: string // sender userId
}

/**
 * ICE Candidate exchange
 */
export interface IceCandidateEvent {
  roomId: string
  candidate: RTCIceCandidateInit
  from: string // sender userId
}

/**
 * Incoming call request
 */
export interface CallRequestEvent {
  roomId: string
  callerId: string
  calleeId: string
  timestamp: Date
}

/**
 * Call accepted response
 */
export interface CallAcceptedEvent {
  roomId: string
  callerId: string
  calleeId: string
  acceptedAt: Date
}

/**
 * Call rejected response
 */
export interface CallRejectedEvent {
  roomId: string
  callerId: string
  calleeId: string
  reason?: string
  rejectedAt: Date
}

/**
 * Call ended event
 */
export interface CallEndedEvent {
  roomId: string
  endedBy: string
  reason?: string
  endedAt: Date
}

/**
 * Call error event
 */
export interface CallErrorEvent {
  roomId: string
  code: string
  message: string
  timestamp: Date
}

/**
 * Peer connection state event
 */
export interface PeerConnectionEvent {
  roomId: string
  peerUserId: string
  state: 'connected' | 'disconnected'
  timestamp: Date
}

/**
 * ICE connection state event (emitted by client to server)
 */
export interface IceConnectionStateEvent {
  roomId: string
  userId: string
  iceConnectionState: RTCIceConnectionState
  iceGatheringState: RTCIceGatheringState
  timestamp: Date
}

/**
 * Connection statistics event (emitted by client to server)
 */
export interface ConnectionStatsEvent {
  roomId: string
  userId: string
  stats: {
    bytesSent: number
    bytesReceived: number
    packetsSent: number
    packetsReceived: number
    packetsLost: number | null // Actual measured value from WebRTC stats
    rtt: number | null
    state: string
  }
  timestamp: Date
}

/**
 * Room error events
 */
export interface RoomErrorEvent {
  roomId?: string
  code: 'ROOM_FULL' | 'ROOM_NOT_FOUND' | 'USER_NOT_IN_ROOM' | 'ALREADY_IN_ROOM' | 'INVALID_USER'
  message: string
}

