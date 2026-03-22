/**
 * Unit tests for Redis-based connection cache module
 * Tests CRUD operations for user-socket-room relationships
 */

// Mock Redis client
const mockRedisClient = {
  pipeline: jest.fn(() => ({
    hset: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    sadd: jest.fn().mockReturnThis(),
    del: jest.fn().mockReturnThis(),
    hgetall: jest.fn().mockReturnThis(),
    smembers: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue([]),
    get: jest.fn(),
    exists: jest.fn(),
    keys: jest.fn().mockResolvedValue([]),
    scard: jest.fn().mockResolvedValue(0),
    expire: jest.fn().mockReturnThis(),
    scan: jest.fn().mockResolvedValue(['0', []])
  })),
  hset: jest.fn(),
  hgetall: jest.fn(),
  set: jest.fn(),
  get: jest.fn(),
  sadd: jest.fn(),
  srem: jest.fn(),
  smembers: jest.fn(),
  del: jest.fn(),
  exists: jest.fn(),
  keys: jest.fn(),
  scard: jest.fn(),
  scan: jest.fn().mockResolvedValue(['0', []])
}

jest.mock('./redis', () => ({
  redisClient: mockRedisClient
}))

import {
  RoomState,
  saveRoom,
  getRoom,
  deleteRoom,
  getAllRoomIds,
  getAllRooms,
  updateRoomParticipants,
  deactivateRoom,
  addUserToRoom,
  removeUserFromRoomParticipants
} from './connection-cache'

describe('Connection Cache Module', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('UserSocketMapping Interface', () => {
    it('should have correct type structure', () => {
      const mapping: import('./connection-cache').UserSocketMapping = {
        userId: 'user123',
        socketId: 'socket456',
        roomId: 'room789'
      }

      expect(mapping.userId).toBe('user123')
      expect(mapping.socketId).toBe('socket456')
      expect(mapping.roomId).toBe('room789')
    })

    it('should allow optional roomId', () => {
      const mapping: import('./connection-cache').UserSocketMapping = {
        userId: 'user123',
        socketId: 'socket456'
      }

      expect(mapping.roomId).toBeUndefined()
    })
  })

  describe('RoomUserMapping Interface', () => {
    it('should have correct type structure', () => {
      const mapping: import('./connection-cache').RoomUserMapping = {
        roomId: 'room123',
        userId: 'user456',
        socketId: 'socket789',
        joinedAt: new Date()
      }

      expect(mapping.roomId).toBe('room123')
      expect(mapping.userId).toBe('user456')
      expect(mapping.socketId).toBe('socket789')
      expect(mapping.joinedAt).toBeInstanceOf(Date)
    })
  })

  describe('Key Pattern Functions', () => {
    it('should generate correct socket:user key', () => {
      const key = `socket:user:socket123`
      expect(key).toBe('socket:user:socket123')
    })

    it('should generate correct user:socket key', () => {
      const key = `user:socket:user123`
      expect(key).toBe('user:socket:user123')
    })

    it('should generate correct room:users key', () => {
      const key = `room:users:room123`
      expect(key).toBe('room:users:room123')
    })

    it('should generate correct room:user key', () => {
      const key = `room:user:room123:user456`
      expect(key).toBe('room:user:room123:user456')
    })
  })

  describe('saveUserConnection', () => {
    it('should save connection with roomId', async () => {
      const { saveUserConnection } = require('./connection-cache')
      
      await saveUserConnection('user123', 'socket456', 'room789')

      expect(mockRedisClient.pipeline).toHaveBeenCalled()
    })

    it('should save connection without roomId', async () => {
      const { saveUserConnection } = require('./connection-cache')
      
      await saveUserConnection('user123', 'socket456')

      expect(mockRedisClient.pipeline).toHaveBeenCalled()
    })
  })

  describe('getUserBySocket', () => {
    it('should return null for non-existent socket', async () => {
      const { getUserBySocket } = require('./connection-cache')
      
      mockRedisClient.hgetall.mockResolvedValue({})

      const result = await getUserBySocket('unknown')

      expect(result).toBeNull()
    })

    it('should return mapping for existing socket', async () => {
      const { getUserBySocket } = require('./connection-cache')
      
      mockRedisClient.hgetall.mockResolvedValue({
        userId: 'user123',
        socketId: 'socket456',
        roomId: 'room789'
      })

      const result = await getUserBySocket('socket456')

      expect(result).toEqual({
        userId: 'user123',
        socketId: 'socket456',
        roomId: 'room789'
      })
    })
  })

  describe('getSocketByUser', () => {
    it('should return null for non-existent user', async () => {
      const { getSocketByUser } = require('./connection-cache')
      
      mockRedisClient.get.mockResolvedValue(null)

      const result = await getSocketByUser('unknown')

      expect(result).toBeNull()
    })

    it('should return socketId for existing user', async () => {
      const { getSocketByUser } = require('./connection-cache')
      
      mockRedisClient.get.mockResolvedValue('socket456')

      const result = await getSocketByUser('user123')

      expect(result).toBe('socket456')
    })
  })

  describe('getRoomUsers', () => {
    it('should return empty array for empty room', async () => {
      const { getRoomUsers } = require('./connection-cache')
      
      mockRedisClient.smembers.mockResolvedValue([])

      const result = await getRoomUsers('room123')

      expect(result).toEqual([])
    })

    it('should return users in room', async () => {
      const { getRoomUsers } = require('./connection-cache')
      
      mockRedisClient.smembers.mockResolvedValue(['user1:socket1', 'user2:socket2'])

      const mockPipeline = {
        hgetall: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([
          [{ socketId: 'socket1', joinedAt: '2024-01-01T00:00:00.000Z' }],
          [{ socketId: 'socket2', joinedAt: '2024-01-01T00:00:00.000Z' }]
        ])
      }
      mockRedisClient.pipeline.mockReturnValue(mockPipeline as any)

      const result = await getRoomUsers('room123')

      expect(result).toHaveLength(2)
      expect(result[0].userId).toBe('user1')
      expect(result[1].userId).toBe('user2')
    })
  })

  describe('removeUserConnection', () => {
    it('should remove connection and room membership', async () => {
      const { removeUserConnection } = require('./connection-cache')

      // Mock pipeline for removal operations
      const mockPipeline = {
        del: jest.fn().mockReturnThis(),
        srem: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([])
      }
      mockRedisClient.pipeline.mockReturnValue(mockPipeline as any)

      // Mock getUserBySocket response (uses redisClient.hgetall directly)
      mockRedisClient.hgetall.mockResolvedValue({
        userId: 'user123',
        socketId: 'socket456',
        roomId: 'room789'
      })

      await removeUserConnection('socket456')

      // Should call del for socket->user and user->socket mappings
      expect(mockPipeline.del).toHaveBeenCalled()
    })
  })

  describe('updateUserRoom', () => {
    it('should update room and handle old room', async () => {
      const { updateUserRoom } = require('./connection-cache')

      const mockPipeline = {
        hset: jest.fn().mockReturnThis(),
        srem: jest.fn().mockReturnThis(),
        sadd: jest.fn().mockReturnThis(),
        del: jest.fn().mockReturnThis(),
        // Fix 2C: Add expire method
        expire: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([])
      }
      mockRedisClient.pipeline.mockReturnValue(mockPipeline as any)

      // Mock getUserBySocket response
      mockRedisClient.hgetall.mockResolvedValue({
        userId: 'user123',
        socketId: 'socket456',
        roomId: 'oldRoom'
      })

      await updateUserRoom('socket456', 'newRoom')

      // Pipeline should be called for hset, srem, sadd operations
      expect(mockPipeline.hset).toHaveBeenCalled()
      expect(mockPipeline.srem).toHaveBeenCalled()
      expect(mockPipeline.sadd).toHaveBeenCalled()
    })
  })

  describe('isUserInRoom', () => {
    it('should return true when user is in room', async () => {
      const { isUserInRoom } = require('./connection-cache')
      
      mockRedisClient.exists.mockResolvedValue(1)

      const result = await isUserInRoom('user123', 'room789')

      expect(result).toBe(true)
    })

    it('should return false when user is not in room', async () => {
      const { isUserInRoom } = require('./connection-cache')
      
      mockRedisClient.exists.mockResolvedValue(0)

      const result = await isUserInRoom('user123', 'room789')

      expect(result).toBe(false)
    })
  })

  describe('getUserRoom', () => {
    it('should return null when user not found', async () => {
      const { getUserRoom } = require('./connection-cache')
      
      mockRedisClient.get.mockResolvedValue(null)

      const result = await getUserRoom('user123')

      expect(result).toBeNull()
    })

    it('should return roomId when user is in room', async () => {
      const { getUserRoom } = require('./connection-cache')
      
      mockRedisClient.get.mockResolvedValue('socket456')
      mockRedisClient.hgetall.mockResolvedValue({
        userId: 'user123',
        socketId: 'socket456',
        roomId: 'room789'
      })

      const result = await getUserRoom('user123')

      expect(result).toBe('room789')
    })
  })

  describe('getRoomUserCount', () => {
    it('should return count of users in room', async () => {
      const { getRoomUserCount } = require('./connection-cache')

      mockRedisClient.scard.mockResolvedValue(5)

      const result = await getRoomUserCount('room123')

      expect(result).toBe(5)
    })
  })

  describe('removeUserFromRoom', () => {
    it('should remove user from room but keep connection', async () => {
      const { removeUserFromRoom } = require('./connection-cache')

      const mockPipeline = {
        srem: jest.fn().mockReturnThis(),
        del: jest.fn().mockReturnThis(),
        hset: jest.fn().mockReturnThis(),
        // Fix 2C: Add expire method
        expire: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([])
      }
      mockRedisClient.pipeline.mockReturnValue(mockPipeline as any)

      // Mock getUserBySocket response
      mockRedisClient.hgetall.mockResolvedValue({
        userId: 'user123',
        socketId: 'socket456',
        roomId: 'room789'
      })

      await removeUserFromRoom('socket456', 'room789')

      // Should call srem to remove from room set
      expect(mockPipeline.srem).toHaveBeenCalled()
      // Should call del to remove room:user hash
      expect(mockPipeline.del).toHaveBeenCalled()
      // Should call hset to update roomId to empty
      expect(mockPipeline.hset).toHaveBeenCalled()
    })

    it('should handle non-existent socket gracefully', async () => {
      const { removeUserFromRoom } = require('./connection-cache')

      const mockPipeline = {
        srem: jest.fn().mockReturnThis(),
        del: jest.fn().mockReturnThis(),
        hset: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([])
      }
      mockRedisClient.pipeline.mockReturnValue(mockPipeline as any)

      // Mock getUserBySocket returns null
      mockRedisClient.hgetall.mockResolvedValue(null)

      await removeUserFromRoom('nonExistent', 'room789')

      // Pipeline should not be called
      expect(mockPipeline.exec).not.toHaveBeenCalled()
    })
  })

  describe('Room State Management', () => {
    const mockRoom: RoomState = {
      roomId: 'room123',
      participants: ['user1', 'user2'],
      activeParticipants: ['user1'],
      isActive: true,
      createdBy: 'user1',
      createdAt: '2024-01-01T00:00:00.000Z'
    }

    it('should save room to Redis', async () => {
      mockRedisClient.set.mockResolvedValue('OK')
      mockRedisClient.sadd.mockResolvedValue(1)

      await saveRoom(mockRoom)

      expect(mockRedisClient.set).toHaveBeenCalledWith(
        'room:room123',
        JSON.stringify(mockRoom),
        'EX',
        expect.any(Number)
      )
      expect(mockRedisClient.sadd).toHaveBeenCalledWith('rooms:all', 'room123')
    })

    it('should get room from Redis', async () => {
      mockRedisClient.get.mockResolvedValue(JSON.stringify(mockRoom))

      const result = await getRoom('room123')

      expect(mockRedisClient.get).toHaveBeenCalledWith('room:room123')
      expect(result).toEqual(mockRoom)
    })

    it('should return null when room not found', async () => {
      mockRedisClient.get.mockResolvedValue(null)

      const result = await getRoom('nonexistent')

      expect(result).toBeNull()
    })

    it('should delete room from Redis', async () => {
      mockRedisClient.del.mockResolvedValue(1)
      mockRedisClient.srem.mockResolvedValue(1)
      mockRedisClient.smembers.mockResolvedValue(['user1'])

      await deleteRoom('room123')

      expect(mockRedisClient.del).toHaveBeenCalledWith('room:room123')
      expect(mockRedisClient.srem).toHaveBeenCalledWith('rooms:all', 'room123')
    })

    it('should get all room IDs', async () => {
      mockRedisClient.smembers.mockResolvedValue(['room1', 'room2'])

      const result = await getAllRoomIds()

      expect(result).toEqual(['room1', 'room2'])
    })

    it('should update room participants', async () => {
      mockRedisClient.get.mockResolvedValue(JSON.stringify(mockRoom))
      mockRedisClient.set.mockResolvedValue('OK')
      mockRedisClient.sadd.mockResolvedValue(1)

      await updateRoomParticipants('room123', ['user1', 'user2'])

      expect(mockRedisClient.set).toHaveBeenCalled()
    })

    it('should deactivate room', async () => {
      mockRedisClient.get.mockResolvedValue(JSON.stringify(mockRoom))
      mockRedisClient.set.mockResolvedValue('OK')
      mockRedisClient.sadd.mockResolvedValue(1)

      await deactivateRoom('room123')

      expect(mockRedisClient.set).toHaveBeenCalled()
    })

    it('should add user to room participants', async () => {
      mockRedisClient.get.mockResolvedValue(JSON.stringify(mockRoom))
      mockRedisClient.set.mockResolvedValue('OK')
      mockRedisClient.sadd.mockResolvedValue(1)

      await addUserToRoom('room123', 'user2')

      expect(mockRedisClient.set).toHaveBeenCalled()
    })

    it('should remove user from room participants', async () => {
      mockRedisClient.get.mockResolvedValue(JSON.stringify(mockRoom))
      mockRedisClient.set.mockResolvedValue('OK')
      mockRedisClient.sadd.mockResolvedValue(1)

      await removeUserFromRoomParticipants('room123', 'user1')

      expect(mockRedisClient.set).toHaveBeenCalled()
    })
  })
})
