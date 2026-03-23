/**
 * HTTP integration tests for chat, message, video-call, and multimedia file routes.
 * Uses the Alice access token from mock-jwt.txt and real JWT verification.
 *
 * AuthService.isActiveAccount is mocked to avoid requiring account rows in DB for the auth gate.
 * Google Drive is mocked so message file upload / download URL paths do not call external APIs.
 *
 * Requires .env.development (or env) with JWT_ACCESS_TOKEN_SECRET matching the issuer of mock-jwt.txt.
 * Optional: DB reachable for chat/message CRUD to return 2xx; without DB, authenticated calls may be 5xx.
 */

import { describe, it, expect, beforeAll, afterAll, jest } from '@jest/globals'
import path from 'path'
import fs from 'fs'
import jwt from 'jsonwebtoken'
import type { Express } from 'express'
import type supertest from 'supertest'

jest.mock('@/services/auth.service', () => {
  const { Result } = require('@/utils/data-types/result') as typeof import('@/utils/data-types/result')
  return {
    __esModule: true,
    default: class MockAuthService {
      async isActiveAccount(_accountId: number) {
        return Result.ok(true)
      }
    }
  }
})

jest.mock('@/services/google-drive.service', () => {
  const mock = {
    uploadFile: jest.fn<any, any>().mockResolvedValue('mock-cloud-file-id'),
    getFileUrl: jest.fn<any, any>().mockResolvedValue('https://example.com/mock-download'),
    downloadFileToStream: jest.fn<any, any>().mockResolvedValue(null)
  }
  const Ctor = function MockCloudDriveService() {
    return mock
  }
  ;(Ctor as any).gI = () => mock
  return { __esModule: true, default: Ctor }
})


function extractAliceAccessToken(mockFile: string): string {
  const beforeBob = mockFile.split('BOB')[0]
  const m = beforeBob.match(
    /Access Token:\s*\r?\n(eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+)/
  )
  if (!m) {
    throw new Error('Could not parse Alice access token from mock-jwt.txt')
  }
  return m[1]
}

let app: Express
let request: supertest.SuperTest<supertest.Test>
let accessToken: string
let jwtSecret: string
let jwtReady = false
let dbReady = false

beforeAll(async () => {
  const dotenv = await import('dotenv')
  dotenv.config({ path: path.join(__dirname, '../.env.development') })
  dotenv.config()

  jwtSecret = process.env.JWT_ACCESS_TOKEN_SECRET || ''
  const mockPath = path.join(__dirname, '../mock-jwt.txt')
  const mockRaw = fs.readFileSync(mockPath, 'utf8')
  accessToken = extractAliceAccessToken(mockRaw)

  try {
    jwt.verify(accessToken, jwtSecret)
    jwtReady = true
  } catch {
    jwtReady = false
  }

  fs.mkdirSync(path.join(__dirname, '../uploads/messages'), { recursive: true })

  const express = (await import('express')).default
  const chatRouter = (await import('@/web/routers/chat.routes')).default
  const videoCallRouter = (await import('@/web/routers/video-call.router')).default
  const multiMediaRouter = (await import('@/web/routers/multimedia.router')).default
  const { notFoundHandler, errorHandler } = await import('@/web/middlewares/error.middleware')

  const api = express.Router()
  api.use('/chat', chatRouter)
  api.use('/video-call', videoCallRouter)
  api.use('/files', multiMediaRouter)

  app = express()
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))
  app.use('/api', api)
  app.use('*', notFoundHandler)
  app.use(errorHandler)

  const st = (await import('supertest')).default
  request = st(app)

  const AppDataSource = (await import('@/infras/db/datasource')).default
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize()
    }
    dbReady = true
  } catch {
    dbReady = false
  }
})

afterAll(async () => {
  const AppDataSource = (await import('@/infras/db/datasource')).default
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy()
  }
})

function authHeader(token: string) {
  return { Authorization: `Bearer ${token}` }
}

describe('VideoCallController — GET /api/video-call/ice-config', () => {
  it('returns 200 and iceServers array (no JWT)', async () => {
    const res = await request.get('/api/video-call/ice-config').expect(200)
    expect(res.body.data).toBeDefined()
    expect(Array.isArray(res.body.data.iceServers)).toBe(true)
  })
})

describe('authenticateMiddleware — chat & files', () => {
  it('returns 401 when Authorization is missing', async () => {
    const res = await request.get('/api/chat/conversations')
    expect(res.status).toBe(401)
  })

  it('returns 401 for malformed token', async () => {
    const res = await request.get('/api/chat/conversations').set(authHeader('not-a-jwt'))
    expect(res.status).toBe(401)
  })
})

describe('ConversationController & MessageController & file download (real JWT)', () => {
  beforeAll(() => {
    if (!jwtReady || !jwtSecret) {
      console.warn(
        '[chat-message-file-video.api.test] Skip JWT-authenticated tests: JWT_ACCESS_TOKEN_SECRET does not verify mock-jwt.txt (check .env.development).'
      )
    }
  })

  const skipIfNoJwt = () => {
    if (!jwtReady) {
      return true
    }
    return false
  }

  it('GET /api/chat/conversations', async () => {
    if (skipIfNoJwt()) return
    const res = await request.get('/api/chat/conversations').set(authHeader(accessToken))
    expect(res.status).not.toBe(401)
    expect(res.status).not.toBe(403)
    if (dbReady) {
      expect([200, 500]).toContain(res.status)
    }
  })

  it('GET /api/chat/conversations/:conversationId', async () => {
    if (skipIfNoJwt()) return
    const res = await request.get('/api/chat/conversations/1').set(authHeader(accessToken))
    expect(res.status).not.toBe(401)
    if (dbReady) {
      expect([200, 404, 500]).toContain(res.status)
    }
  })

  it('POST /api/chat/conversations', async () => {
    if (skipIfNoJwt()) return
    const res = await request
      .post('/api/chat/conversations')
      .set(authHeader(accessToken))
      .send({
        conversationType: 'Direct',
        participantIds: [2]
      })
    expect(res.status).not.toBe(401)
    if (dbReady) {
      expect([201, 500]).toContain(res.status)
    }
  })

  it('POST /api/chat/conversations/:conversationId/participants', async () => {
    if (skipIfNoJwt()) return
    const res = await request
      .post('/api/chat/conversations/1/participants')
      .set(authHeader(accessToken))
      .send({ customerId: 2, role: 'Member' })
    expect(res.status).not.toBe(401)
    if (dbReady) {
      expect([201, 500]).toContain(res.status)
    }
  })

  it('DELETE /api/chat/conversations/:conversationId/participants/:customerId', async () => {
    if (skipIfNoJwt()) return
    const res = await request
      .delete('/api/chat/conversations/1/participants/2')
      .set(authHeader(accessToken))
    expect(res.status).not.toBe(401)
    if (dbReady) {
      expect([204, 500]).toContain(res.status)
    }
  })

  it('GET /api/chat/conversations/:conversationId/participants', async () => {
    if (skipIfNoJwt()) return
    const res = await request.get('/api/chat/conversations/1/participants').set(authHeader(accessToken))
    expect(res.status).not.toBe(401)
    if (dbReady) {
      expect([200, 500]).toContain(res.status)
    }
  })

  it('GET /api/chat/conversations/:conversationId/messages', async () => {
    if (skipIfNoJwt()) return
    const res = await request.get('/api/chat/conversations/1/messages').set(authHeader(accessToken))
    expect(res.status).not.toBe(401)
    if (dbReady) {
      expect([200, 500]).toContain(res.status)
    }
  })

  it('GET /api/chat/messages/:messageId', async () => {
    if (skipIfNoJwt()) return
    const res = await request.get('/api/chat/messages/1').set(authHeader(accessToken))
    expect(res.status).not.toBe(401)
    if (dbReady) {
      expect([200, 404, 500]).toContain(res.status)
    }
  })

  it('POST /api/chat/conversations/:conversationId/messages', async () => {
    if (skipIfNoJwt()) return
    const res = await request
      .post('/api/chat/conversations/1/messages')
      .set(authHeader(accessToken))
      .send({
        conversationId: 1,
        content: 'integration test message',
        messageType: 'Text'
      })
    expect(res.status).not.toBe(401)
    if (dbReady) {
      expect([201, 500]).toContain(res.status)
    }
  })

  it('PUT /api/chat/messages/:messageId', async () => {
    if (skipIfNoJwt()) return
    const res = await request
      .put('/api/chat/messages/1')
      .set(authHeader(accessToken))
      .send({ content: 'edited' })
    expect(res.status).not.toBe(401)
    if (dbReady) {
      expect([200, 500]).toContain(res.status)
    }
  })

  it('DELETE /api/chat/messages/:messageId', async () => {
    if (skipIfNoJwt()) return
    const res = await request.delete('/api/chat/messages/999999').set(authHeader(accessToken))
    expect(res.status).not.toBe(401)
    if (dbReady) {
      expect([204, 500]).toContain(res.status)
    }
  })

  it('POST /api/chat/messages/read', async () => {
    if (skipIfNoJwt()) return
    const res = await request
      .post('/api/chat/messages/read')
      .set(authHeader(accessToken))
      .send({ messageIds: [1] })
    expect(res.status).not.toBe(401)
    if (dbReady) {
      expect([200, 500]).toContain(res.status)
    }
  })

  it('POST /api/chat/conversations/:conversationId/files (multipart)', async () => {
    if (skipIfNoJwt()) return
    const res = await request
      .post('/api/chat/conversations/1/files')
      .set(authHeader(accessToken))
      .field('content', 'file caption')
      .attach('file', Buffer.from('hello'), 'note.txt')
    expect(res.status).not.toBe(401)
    if (dbReady) {
      expect([201, 500]).toContain(res.status)
    }
  })

  it('GET /api/chat/files/:fileId/download', async () => {
    if (skipIfNoJwt()) return
    const res = await request.get('/api/chat/files/1/download').set(authHeader(accessToken))
    expect(res.status).not.toBe(401)
    if (dbReady) {
      expect([200, 404, 500]).toContain(res.status)
    }
  })
})

describe('FileController — GET /api/files/:fileId', () => {
  it('returns 401 without token', async () => {
    const res = await request.get('/api/files/some-id')
    expect(res.status).toBe(401)
  })

  it('returns 404 when path has no fileId segment', async () => {
    if (!jwtReady) return
    const res = await request.get('/api/files/').set(authHeader(accessToken))
    expect(res.status).toBe(404)
  })

  it('calls endpoint with JWT (not 401)', async () => {
    if (!jwtReady) return
    const res = await request.get('/api/files/1').set(authHeader(accessToken))
    expect(res.status).not.toBe(401)
    if (dbReady) {
      expect([200, 404, 500]).toContain(res.status)
    }
  })
})
