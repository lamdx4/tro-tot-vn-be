/**
 * Redis-based caching module for user-socket-room relationships
 * Replaces in-memory Maps with persistent Redis storage
 */

import { redisClient } from './redis'
import { VideoCallRoom } from '@/utils/types/webrtc-signaling'

// ============================================================================
// Interfaces
// ============================================================================

/**
 * User-Socket-Room mapping when user connects
 */
export interface UserSocketMapping {
  userId: string
  socketId: string
  roomId?: string
  fcmToken?: string
}

/**
 * Room-User mapping for tracking users in a room
 */
export interface RoomUserMapping {
  roomId: string
  userId: string
  socketId: string
  joinedAt: Date
}

// ============================================================================
// Redis Key Patterns
// ============================================================================

const KEY_SOCKET_USER = (socketId: string) => `socket:user:${socketId}`
const KEY_USER_SOCKET = (userId: string) => `user:socket:${userId}`
const KEY_ROOM_USERS = (roomId: string) => `room:users:${roomId}`
const KEY_ROOM_USER = (roomId: string, userId: string) => `room:user:${roomId}:${userId}`
const KEY_ROOM = (roomId: string) => `room:${roomId}`
const KEY_ALL_ROOMS = 'rooms:all'

// Feature 2C: TTL for Redis keys - 24 hours expiration to prevent orphaned entries
const DEFAULT_TTL_SECONDS = 24 * 60 * 60

// ============================================================================
// CRUD Operations
// ============================================================================

/**
 * Save user-socket-room mapping when user connects
 * 
 * @param userId - User ID
 * @param socketId - Socket ID
 * @param roomId - Optional room ID (for video calls)
 */
export async function saveUserConnection(
  userId: string,
  socketId: string,
  roomId?: string,
  fcmToken?: string
): Promise<void> {
  const pipeline = redisClient.pipeline()

  // Store socket -> user mapping (Hash)
  pipeline.hset(KEY_SOCKET_USER(socketId), {
    userId,
    roomId: roomId || '',
    socketId,
    fcmToken: fcmToken || ''
  })
  // Feature 2C: Add TTL to prevent orphaned entries
  pipeline.expire(KEY_SOCKET_USER(socketId), DEFAULT_TTL_SECONDS)

  // Store user -> socket mapping (String)
  pipeline.set(KEY_USER_SOCKET(userId), socketId)
  pipeline.expire(KEY_USER_SOCKET(userId), DEFAULT_TTL_SECONDS)

  // Device-level tracking: user:device:socket:userId (Hash)
  if (fcmToken) {
    pipeline.hset(`user:device:socket:${userId}`, fcmToken, socketId)
    pipeline.expire(`user:device:socket:${userId}`, DEFAULT_TTL_SECONDS)
  }

  // If roomId provided, also add to room users set
  if (roomId) {
    // Add to room users set (member format: userId:socketId)
    pipeline.sadd(KEY_ROOM_USERS(roomId), `${userId}:${socketId}`)
    pipeline.expire(KEY_ROOM_USERS(roomId), DEFAULT_TTL_SECONDS)

    // Store room-user details (Hash)
    pipeline.hset(KEY_ROOM_USER(roomId, userId), {
      socketId,
      joinedAt: new Date().toISOString()
    })
    pipeline.expire(KEY_ROOM_USER(roomId, userId), DEFAULT_TTL_SECONDS)
  }

  await pipeline.exec()

  console.log(`[RedisCache] Saved connection: userId=${userId}, socketId=${socketId}, roomId=${roomId || 'none'}`)
}

/**
 * Retrieve userId and roomId by socketId
 * 
 * @param socketId - Socket ID to look up
 * @returns UserSocketMapping or null if not found
 */
export async function getUserBySocket(socketId: string): Promise<UserSocketMapping | null> {
  const data = await redisClient.hgetall(KEY_SOCKET_USER(socketId))
  
  if (!data || !data.userId) {
    return null
  }

  return {
    userId: data.userId,
    socketId: data.socketId,
    roomId: data.roomId || undefined,
    fcmToken: data.fcmToken || undefined
  }
}

/**
 * Retrieve socketId by userId
 * 
 * @param userId - User ID to look up
 * @returns Socket ID or null if not found
 */
export async function getSocketByUser(userId: string): Promise<string | null> {
  const socketId = await redisClient.get(KEY_USER_SOCKET(userId))
  return socketId || null
}

/**
 * Get all users in a specific room
 * 
 * @param roomId - Room ID
 * @returns Array of RoomUserMapping
 */
export async function getRoomUsers(roomId: string): Promise<RoomUserMapping[]> {
  const members = await redisClient.smembers(KEY_ROOM_USERS(roomId))
  
  if (!members || members.length === 0) {
    return []
  }

  const pipeline = redisClient.pipeline()
  
  for (const member of members) {
    const [userId] = member.split(':')
    pipeline.hgetall(KEY_ROOM_USER(roomId, userId))
  }

  const results = await pipeline.exec()
  
  const roomUsers: RoomUserMapping[] = []
  
  for (let i = 0; i < members.length; i++) {
    const [userId, socketId] = members[i].split(':')
    const userData = results?.[i]?.[1] as Record<string, string> | null
    
    if (userData && userData.socketId) {
      roomUsers.push({
        roomId,
        userId,
        socketId: userData.socketId,
        joinedAt: userData.joinedAt ? new Date(userData.joinedAt) : new Date()
      })
    } else {
      // Fallback if hash data not found
      roomUsers.push({
        roomId,
        userId,
        socketId,
        joinedAt: new Date()
      })
    }
  }

  return roomUsers
}

/**
 * Remove user mapping when disconnecting
 * 
 * @param socketId - Socket ID to remove
 */
export async function removeUserConnection(socketId: string): Promise<void> {
  // First get the user info
  const userMapping = await getUserBySocket(socketId)
  
  if (!userMapping) {
    console.log(`[RedisCache] No mapping found for socketId=${socketId}`)
    return
  }

  const { userId, roomId } = userMapping

  const pipeline = redisClient.pipeline()

  // Remove socket -> user mapping
  pipeline.del(KEY_SOCKET_USER(socketId))

  // Remove user -> socket mapping
  pipeline.del(KEY_USER_SOCKET(userId))

  // Remove from room if in a room
  if (roomId) {
    pipeline.srem(KEY_ROOM_USERS(roomId), `${userId}:${socketId}`)
    pipeline.del(KEY_ROOM_USER(roomId, userId))
  }

  await pipeline.exec()

  // Clean up device mapping
  if (userMapping.fcmToken) {
    await redisClient.hdel(`user:device:socket:${userId}`, userMapping.fcmToken)
  }

  console.log(`[RedisCache] Removed connection: userId=${userId}, socketId=${socketId}, roomId=${roomId || 'none'}`)
}

/**
 * Update user's current room
 * 
 * @param socketId - Socket ID
 * @param roomId - New room ID
 */
export async function updateUserRoom(socketId: string, roomId: string): Promise<void> {
  const userMapping = await getUserBySocket(socketId)
  
  if (!userMapping) {
    console.error(`[RedisCache] Cannot update room: socketId=${socketId} not found`)
    return
  }

  const { userId, roomId: oldRoomId } = userMapping

  const pipeline = redisClient.pipeline()

  // Update roomId in socket->user hash
  pipeline.hset(KEY_SOCKET_USER(socketId), 'roomId', roomId)
  pipeline.expire(KEY_SOCKET_USER(socketId), DEFAULT_TTL_SECONDS)

  // If user was in old room, remove them from it
  if (oldRoomId && oldRoomId !== roomId) {
    pipeline.srem(KEY_ROOM_USERS(oldRoomId), `${userId}:${socketId}`)
    pipeline.del(KEY_ROOM_USER(oldRoomId, userId))
  }

  // Add to new room
  pipeline.sadd(KEY_ROOM_USERS(roomId), `${userId}:${socketId}`)
  pipeline.expire(KEY_ROOM_USERS(roomId), DEFAULT_TTL_SECONDS)
  pipeline.hset(KEY_ROOM_USER(roomId, userId), {
    socketId,
    joinedAt: new Date().toISOString()
  })
  pipeline.expire(KEY_ROOM_USER(roomId, userId), DEFAULT_TTL_SECONDS)

  await pipeline.exec()

  console.log(`[RedisCache] Updated room: userId=${userId}, socketId=${socketId}, newRoomId=${roomId}, oldRoomId=${oldRoomId || 'none'}`)
}

/**
 * Check if a user is in a specific room
 * 
 * @param userId - User ID
 * @param roomId - Room ID to check
 * @returns true if user is in the room
 */
export async function isUserInRoom(userId: string, roomId: string): Promise<boolean> {
  const exists = await redisClient.exists(KEY_ROOM_USER(roomId, userId))
  return exists === 1
}

/**
 * Get the roomId a user is currently in
 *
 * @param userId - User ID
 * @returns Room ID or null if not in any room
 */
export async function getUserRoom(userId: string): Promise<string | null> {
  const socketId = await getSocketByUser(userId)

  if (!socketId) {
    return null
  }

  const userMapping = await getUserBySocket(socketId)
  return userMapping?.roomId || null
}

/**
 * Remove user from a specific room (but keep the connection)
 * Used when user leaves a video call room
 *
 * @param socketId - Socket ID
 * @param roomId - Room ID to leave
 */
export async function removeUserFromRoom(socketId: string, roomId: string): Promise<void> {
  const userMapping = await getUserBySocket(socketId)

  if (!userMapping) {
    console.log(`[RedisCache] Cannot remove from room: socketId=${socketId} not found`)
    return
  }

  const { userId } = userMapping

  const pipeline = redisClient.pipeline()

  // Remove from room set
  pipeline.srem(KEY_ROOM_USERS(roomId), `${userId}:${socketId}`)

  // Remove room:user hash
  pipeline.del(KEY_ROOM_USER(roomId, userId))

  // Update roomId to null in socket->user mapping
  pipeline.hset(KEY_SOCKET_USER(socketId), 'roomId', '')
  // Feature 2C: Refresh TTL for the connection
  pipeline.expire(KEY_SOCKET_USER(socketId), DEFAULT_TTL_SECONDS)

  await pipeline.exec()

  console.log(`[RedisCache] Removed user from room: userId=${userId}, socketId=${socketId}, roomId=${roomId}`)
}

// ============================================================================
// Additional Utility Functions
// ============================================================================

/**
 * Get all rooms a user is in (useful for multi-room scenarios)
 * Feature 2B: Use SCAN instead of KEYS to avoid blocking Redis
 *
 * @param userId - User ID
 * @returns Array of room IDs
 */
export async function getUserRooms(userId: string): Promise<string[]> {
  const roomIds: string[] = []
  let cursor = '0'

  // Use SCAN iterator to avoid blocking Redis (KEYS is O(N) and blocks)
  do {
    const [newCursor, keys] = await redisClient.scan(
      cursor,
      'MATCH',
      `room:user:*:${userId}`,
      'COUNT',
      100
    )
    cursor = newCursor

    // Extract room IDs from keys: room:user:{roomId}:{userId}
    for (const key of keys) {
      const parts = key.split(':')
      if (parts[2]) {
        roomIds.push(parts[2])
      }
    }
  } while (cursor !== '0')

  return [...new Set(roomIds)] // Remove duplicates
}

/**
 * Get count of users in a room
 * 
 * @param roomId - Room ID
 * @returns Number of users in the room
 */
export async function getRoomUserCount(roomId: string): Promise<number> {
  return await redisClient.scard(KEY_ROOM_USERS(roomId))
}

/**
 * Clear all user connection data (useful for testing)
 * Feature 2B: Use SCAN instead of KEYS to avoid blocking Redis
 */
export async function clearAllConnectionData(): Promise<void> {
  const patterns = ['socket:user:*', 'user:socket:*', 'room:user:*', 'room:users:*']
  const allKeys: string[] = []

  for (const pattern of patterns) {
    let cursor = '0'
    do {
      const [newCursor, keys] = await redisClient.scan(cursor, 'MATCH', pattern, 'COUNT', 100)
      cursor = newCursor
      allKeys.push(...keys)
    } while (cursor !== '0')
  }

  if (allKeys.length > 0) {
    await redisClient.del(...allKeys)
  }

  console.log(`[RedisCache] Cleared ${allKeys.length} keys`)
}

// ============================================================================
// Room State Management (for horizontal scaling)
// ============================================================================

/**
 * Room state stored in Redis for multi-instance support
 * This enables horizontal scaling with multiple server instances
 */
export interface RoomState {
  roomId: string
  participants: string[]      // Original list of participants (caller + callee)
  activeParticipants: string[] // Users currently in the call
  isActive: boolean
  createdBy: string
  createdAt: string          // ISO date string
}

/**
 * Save room state to Redis
 * Enables room state sharing across multiple server instances
 *
 * @param room - Room state to save
 * @param ttlSeconds - Optional TTL (default: 24 hours)
 */
export async function saveRoom(room: RoomState, ttlSeconds: number = DEFAULT_TTL_SECONDS): Promise<void> {
  await redisClient.set(
    KEY_ROOM(room.roomId),
    JSON.stringify(room),
    'EX', ttlSeconds
  )

  // Also add to set of all room IDs for easy listing
  await redisClient.sadd(KEY_ALL_ROOMS, room.roomId)

  if (process.env.NODE_ENV !== 'production') {
    console.log(`[RedisCache] Saved room ${room.roomId} to Redis`)
  }
}

/**
 * Get room state from Redis
 *
 * @param roomId - Room ID to retrieve
 * @returns Room state or null if not found
 */
export async function getRoom(roomId: string): Promise<RoomState | null> {
  const data = await redisClient.get(KEY_ROOM(roomId))
  if (!data) {
    return null
  }
  return JSON.parse(data) as RoomState
}

/**
 * Delete room from Redis
 *
 * @param roomId - Room ID to delete
 */
export async function deleteRoom(roomId: string): Promise<void> {
  // Delete room state
  await redisClient.del(KEY_ROOM(roomId))

  // Remove from all rooms set
  await redisClient.srem(KEY_ALL_ROOMS, roomId)

  // Also clean up room users
  const users = await redisClient.smembers(KEY_ROOM_USERS(roomId))
  if (users.length > 0) {
    const keysToDelete = users.map(userId => KEY_ROOM_USER(roomId, userId))
    keysToDelete.push(KEY_ROOM_USERS(roomId))
    await redisClient.del(...keysToDelete)
  }

  if (process.env.NODE_ENV !== 'production') {
    console.log(`[RedisCache] Deleted room ${roomId} from Redis`)
  }
}

/**
 * Get all active room IDs
 *
 * @returns Array of room IDs
 */
export async function getAllRoomIds(): Promise<string[]> {
  return await redisClient.smembers(KEY_ALL_ROOMS)
}

/**
 * Get all rooms with their states
 *
 * @returns Array of room states
 */
export async function getAllRooms(): Promise<RoomState[]> {
  const roomIds = await getAllRoomIds()
  const rooms: RoomState[] = []

  for (const roomId of roomIds) {
    const room = await getRoom(roomId)
    if (room) {
      rooms.push(room)
    }
  }

  return rooms
}

/**
 * Update room's active participants
 *
 * @param roomId - Room ID
 * @param activeParticipants - New list of active participants
 */
export async function updateRoomParticipants(roomId: string, activeParticipants: string[]): Promise<void> {
  const room = await getRoom(roomId)
  if (!room) {
    console.warn(`[RedisCache] Room ${roomId} not found for participant update`)
    return
  }

  room.activeParticipants = activeParticipants
  await saveRoom(room)
}

/**
 * Mark room as inactive (call ended)
 *
 * @param roomId - Room ID
 */
export async function deactivateRoom(roomId: string): Promise<void> {
  const room = await getRoom(roomId)
  if (!room) {
    return
  }

  room.isActive = false
  room.activeParticipants = []
  await saveRoom(room)
}

/**
 * Add user to room's active participants
 *
 * @param roomId - Room ID
 * @param userId - User ID to add
 */
export async function addUserToRoom(roomId: string, userId: string): Promise<void> {
  const room = await getRoom(roomId)
  if (!room) {
    console.warn(`[RedisCache] Room ${roomId} not found for adding user ${userId}`)
    return
  }

  if (!room.activeParticipants.includes(userId)) {
    room.activeParticipants.push(userId)
    await saveRoom(room)
  }
}

/**
 * Remove user from room's active participants
 *
 * @param roomId - Room ID
 * @param userId - User ID to remove
 */
export async function removeUserFromRoomParticipants(roomId: string, userId: string): Promise<void> {
  const room = await getRoom(roomId)
  if (!room) {
    return
  }

  room.activeParticipants = room.activeParticipants.filter(id => id !== userId)
  await saveRoom(room)
}

// ============================================================================
// VideoCallRoom Helpers (for VideoCallHandler integration)
// ============================================================================

/**
 * Convert RoomState (Redis format) to VideoCallRoom (handler format)
 *
 * @param roomState - Room state from Redis
 * @returns VideoCallRoom with Date object and string array
 */
export function toVideoCallRoom(roomState: RoomState): VideoCallRoom {
  return {
    roomId: roomState.roomId,
    participants: roomState.participants,
    activeParticipants: roomState.activeParticipants,
    createdAt: new Date(roomState.createdAt),
    createdBy: roomState.createdBy,
    isActive: roomState.isActive
  }
}

/**
 * Get room as VideoCallRoom from Redis
 *
 * @param roomId - Room ID to retrieve
 * @returns VideoCallRoom or null if not found
 */
export async function getVideoCallRoom(roomId: string): Promise<VideoCallRoom | null> {
  const roomState = await getRoom(roomId)
  if (!roomState) {
    return null
  }
  return toVideoCallRoom(roomState)
}

/**
 * Get all rooms as VideoCallRoom from Redis
 *
 * @returns Array of VideoCallRoom
 */
export async function getAllVideoCallRooms(): Promise<VideoCallRoom[]> {
  const roomStates = await getAllRooms()
  return roomStates.map(toVideoCallRoom)
}

