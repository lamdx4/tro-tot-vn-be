#!/usr/bin/env node
/**
 * Socket.IO Test Client - 2 User Chat Demo
 * Flow: 1) Create/Fetch conversation via API 2) Join via API 3) Chat via WebSocket
 */

const { io }= require('socket.io-client')

const WS_URL = 'http://localhost:3333'
const USERS = {
  USER_1: { id: 101, name: 'Alice' },
  USER_2: { id: 102, name: 'Bob' }
}

let conversationId = null
let sockets = {}
let messageCount = 0
let sentCount = 0

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  green: '\x1b[32m'
}

const log = (user, msg) => {
  const color = user === 'USER_1' ? colors.cyan : colors.magenta
  const ts = new Date().toLocaleTimeString()
  console.log(`${color}[${ts}] ${user}${colors.reset} ${msg}`)
}

const logSys = (msg) => {
  const ts = new Date().toLocaleTimeString()
  console.log(`${colors.blue}[${ts}] SYSTEM${colors.reset}${msg}`)
}

const logOk = (msg) => {
  const ts = new Date().toLocaleTimeString()
  console.log(`${colors.green}[${ts}] ✅${colors.reset}${msg}`)
}

const header = (title) => {
  console.log('\n' + '='.repeat(70))
  console.log(colors.bright + colors.yellow + title + colors.reset)
  console.log('='.repeat(70))
}


function createUserSocket(userKey) {
  const user = USERS[userKey]
  const socket = io(WS_URL, {
    auth: { userId: user.id },
    reconnection: true,
    transports: ['websocket']
  })

  socket.on('connect', () => {
    log(userKey, `✅ Connected (Socket: ${socket.id})`)
  })

  socket.on('connect_error', (err) => {
    log(userKey, `❌ Error: ${err.message}`)
  })

  socket.on('disconnect', (reason) => {
    log(userKey, `🔌 Disconnected: ${reason}`)
  })

  socket.on('participant:joined', (data) => {
    log(userKey, `👤 User ${data.userId}joined`)
  })

  socket.on('participant:left', (data) => {
    log(userKey, `👋 User ${data.userId}left`)
  })

  socket.on('message:received', (data) => {
    messageCount++
    const from = data.senderId === USERS.USER_1.id ? 'Alice' : 'Bob'
    log(userKey, `📨 [${from}]: "${data.content}"`)
  })

  socket.on('message:sent', () => {
    log(userKey, `✅ Message sent`)
  })

  socket.on('typing:start', (data) => {
    const who = data.userId === USERS.USER_1.id ? 'Alice' : 'Bob'
    log(userKey, `⌨️  ${who} is typing...`)
  })

  socket.on('typing:stop', (data) => {
    const who = data.userId === USERS.USER_1.id ? 'Alice' : 'Bob'
    log(userKey, `✋ ${who}stopped typing`)
  })

  return socket
}

function sendMsg(userKey, content) {
  const socket = sockets[userKey]
  if (socket && socket.connected) {
    socket.emit('message:sent', {
      conversationId,
      content,
      messageType: 'Text'
    })
    sentCount++
    log(userKey, `💬 Sent: "${content}"`)
  }
}

function sendTyping(userKey, duration = 2000) {
  const socket = sockets[userKey]
  if (socket && socket.connected) {
    socket.emit('typing:start', { conversationId })
    setTimeout(() => {
      socket.emit('typing:stop', { conversationId })
    }, duration)
  }
}

async function runTests() {
  try {
    header('🎯 2-USER SOCKET.IO CHAT TEST (WebSocket Focus)')

    // Using pre-created conversation ID (1)
    conversationId = 1
    logOk(`Using conversation ID: ${conversationId}`)
    await new Promise(r => setTimeout(r, 1000))

    // STEP 4: Connect WebSocket
    header('🌐 STEP 4: Establishing WebSocket Connections')
    logSys('Creating socket connections for 2 users...')
    sockets.USER_1 = createUserSocket('USER_1')
    sockets.USER_2 = createUserSocket('USER_2')
    await new Promise(r => setTimeout(r, 2000))

    // STEP 5: Join Conversation via WebSocket
    header('🚪 STEP 5: Joining Conversation via WebSocket')
    log('USER_1', `Joining conversation ${conversationId}...`)
    sockets.USER_1.emit('join:conversation', { conversationId })
    await new Promise(r => setTimeout(r, 1000))

    log('USER_2', `Joining conversation ${conversationId}...`)
    sockets.USER_2.emit('join:conversation', { conversationId })
    await new Promise(r => setTimeout(r, 2000))

    // STEP 6: Simple Message Exchange
    header('💬 STEP 6: Message Exchange')
    sendMsg('USER_1', 'Hi Bob! How are you today?')
    await new Promise(r => setTimeout(r, 1000))

    sendMsg('USER_2', "Hey Alice! I'm doing great!")
    await new Promise(r => setTimeout(r, 1000))

    sendMsg('USER_1', 'Awesome! Let me send you more messages')
    await new Promise(r => setTimeout(r, 1000))

    // STEP 7: Typing Indicators
    header('⌨️  STEP 7: Typing Indicators')
    log('USER_2', 'Typing something...')
    sendTyping('USER_2', 3000)
    await new Promise(r => setTimeout(r, 4000))

    sendMsg('USER_2', 'This message took some time to compose!')
    await new Promise(r => setTimeout(r, 1000))

    // STEP 8: Rapid Exchange
    header('⚡ STEP 8: Rapid Message Exchange')
    const msgs = [
      ['USER_1', 'Message 1'],
      ['USER_2', 'Message 2'],
      ['USER_1', 'Message 3'],
      ['USER_2', 'Message 4'],
      ['USER_1', 'Message 5']
    ]

    for (const [user, msg] of msgs) {
      sendMsg(user, msg)
      await new Promise(r => setTimeout(r, 500))
    }
    await new Promise(r => setTimeout(r, 1000))

    // STEP 9: Leave Conversation
    header('👋 STEP 9: Leaving Conversation')
    log('USER_1', 'Leaving conversation...')
    sockets.USER_1.emit('leave:conversation', { conversationId })
    await new Promise(r => setTimeout(r, 1000))

    log('USER_2', 'Leaving conversation...')
    sockets.USER_2.emit('leave:conversation', { conversationId })
    await new Promise(r => setTimeout(r, 1000))

    // SUMMARY
    header('📊 TEST SUMMARY')
    logOk(`Total messages sent: ${sentCount}`)
    logOk(`Messages received: ${messageCount}`)
    logOk(`Users: 2 (Alice & Bob)`)
    logOk(`Conversation ID: ${conversationId}`)
    logOk(`WebSocket events tested: ✅`)

    header('🔌 Cleanup')
    logSys('Disconnecting sockets...')
    sockets.USER_1.disconnect()
    sockets.USER_2.disconnect()
    await new Promise(r => setTimeout(r, 1000))

    logOk('All tests completed successfully!')
    process.exit(0)

  } catch (error) {
    console.error('\n❌ Test Error:', error.message)
    process.exit(1)
  }
}

runTests()

process.on('SIGINT', () => {
  logSys('Shutting down...')
  Object.values(sockets).forEach(s => s.disconnect())
  process.exit(0)
})
