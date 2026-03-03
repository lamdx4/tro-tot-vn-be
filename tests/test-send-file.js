#!/usr/bin/env node
/**
 * Socket.IO Test Client - File Attachment Demo
 * Flow: 1) Upload file via HTTP  2) Send message:sent with attachments via socket
 */

const { io } = require('socket.io-client')
const http = require('http')
const fs = require('fs')
const path = require('path')

const WS_URL = 'http://localhost:3333'
const API_URL = 'http://localhost:3333'
const USER = { id: 101, name: 'Alice' }
const CONVERSATION_ID = 1

const colors = {
  reset: '\x1b[0m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m'
}

const log = (msg, color = colors.reset) => {
  const ts = new Date().toLocaleTimeString()
  console.log(`${colors.cyan}[${ts}]${colors.reset} ${color}${msg}${colors.reset}`)
}

// Simulate HTTP file upload (returns file info like in production)
function uploadFileViaHttp(fileName, fileType, fileSize) {
  return new Promise((resolve) => {
    // In production, this would be a real HTTP POST to /api/messages/upload
    // Here we simulate the response
    setTimeout(() => {
      const fileInfo = {
        fileId: Date.now(),
        fileName,
        fileUrl: `/uploads/messages/${Date.now()}-${fileName}`,
        fileType,
        fileSize,
        mimeType: getMimeType(fileName),
        cloudFileId: `drive-${Date.now()}`
      }
      log(`📤 HTTP Upload complete: ${fileName}`, colors.green)
      resolve(fileInfo)
    }, 500)
  })
}

function getMimeType(fileName) {
  const ext = path.extname(fileName).toLowerCase()
  const mimeTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  }
  return mimeTypes[ext] || 'application/octet-stream'
}

async function runTest() {
  log('🚀 Starting File Attachment Test')

  // Step 1: Connect to WebSocket
  log('Connecting to WebSocket...')
  const socket = io(WS_URL, {
    auth: { userId: USER.id },
    transports: ['websocket']
  })

  socket.on('connect', () => {
    log(`✅ Connected (Socket: ${socket.id})`, colors.green)
  })

  socket.on('connect_error', (err) => {
    log(`❌ Connection error: ${err.message}`, colors.red)
  })

  // Wait for connection
  await new Promise(r => setTimeout(r, 1000))

  // Step 2: Join conversation
  log(`Joining conversation ${CONVERSATION_ID}...`)
  socket.emit('join:conversation', CONVERSATION_ID)
  await new Promise(r => setTimeout(r, 500))

  // Step 3: Upload file via HTTP and send message via socket
  const testFiles = [
    { name: 'photo.jpg', type: 'Image', size: 1024000 },
    { name: 'document.pdf', type: 'File', size: 2048000 },
    { name: 'video.mp4', type: 'Video', size: 10240000 }
  ]

  for (const file of testFiles) {
    log(`\n📎 Testing: ${file.name} (${file.type})`)

    // Upload file via HTTP (simulated)
    const fileInfo = await uploadFileViaHttp(file.name, file.type, file.size)

    // Send message with attachment via socket
    const messageType = file.type === 'Image' ? 'Image' : 
                        file.type === 'Video' ? 'Video' : 'File'

    socket.emit('message:sent', {
      conversationId: CONVERSATION_ID,
      content: `Sent ${file.name}`,
      messageType,
      attachments: [{
        fileName: fileInfo.fileName,
        fileUrl: fileInfo.fileUrl,
        fileType: fileInfo.fileType,
        fileSize: fileInfo.fileSize,
        mimeType: fileInfo.mimeType,
        cloudFileId: fileInfo.cloudFileId
      }]
    })

    log(`✅ Message with ${file.name} sent!`, colors.green)
    await new Promise(r => setTimeout(r, 1000))
  }

  // Listen for response
  socket.on('message:sent', (data) => {
    log(`📬 Message sent confirmation: ID ${data.messageId}`, colors.yellow)
  })

  socket.on('message:received', (data) => {
    const hasAttachments = data.attachments && data.attachments.length > 0
    if (hasAttachments) {
      log(`📥 Received message with attachment: ${data.attachments[0].fileName}`, colors.green)
    }
  })

  // Cleanup
  await new Promise(r => setTimeout(r, 2000))
  log('\n👋 Disconnecting...')
  socket.disconnect()

  log('✅ Test completed!', colors.green)
  process.exit(0)
}

runTest().catch(err => {
  log(`❌ Error: ${err.message}`, colors.red)
  process.exit(1)
})

process.on('SIGINT', () => {
  log('Shutting down...')
  process.exit(0)
})

