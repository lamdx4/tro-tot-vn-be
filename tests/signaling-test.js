/**
 * Socket.IO Signaling Test Script
 * 
 * Tests the WebRTC signaling functionality via Socket.IO.
 * This simulates two peers going through the signaling process.
 * 
 * Run with: node tests/signaling-test.js
 * 
 * Prerequisites:
 * - Server running on localhost:3333
 * - Database with test users
 */

const io = require('socket.io-client')

// Configuration
const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3333'
const USER_1_ID = parseInt(process.env.USER_1_ID || '1')
const USER_2_ID = parseInt(process.env.USER_2_ID || '2')

// Test colors
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
}

function log(msg, color = colors.reset) {
  console.log(`${color}${msg}${colors.reset}`)
}

function header(title) {
  log(`\n${'='.repeat(60)}`, colors.cyan)
  log(`  ${title}`, colors.cyan)
  log('='.repeat(60), colors.cyan)
}

function section(title) {
  log(`\n--- ${title} ---`, colors.yellow)
}

// Test results
let testsPassed = 0
let testsFailed = 0

function testPass(name) {
  testsPassed++
  log(`✓ ${name}`, colors.green)
}

function testFail(name, error) {
  testsFailed++
  log(`✗ ${name}`, colors.red)
  log(`  Error: ${error}`, colors.red)
}

// Track test state
const state = {
  socket1: null,
  socket2: null,
  roomId: null,
  iceConfig: null,
  offer: null,
  answer: null,
  iceCandidates: []
}

// ============================================
// Helper: Create Socket Connection
// ============================================
function createSocket(userId, name) {
  return new Promise((resolve, reject) => {
    const socket = io(SERVER_URL, {
      auth: { userId: String(userId) },
      transports: ['websocket', 'polling'],
      timeout: 10000,
      reconnection: false
    })
    
    const timeout = setTimeout(() => {
      socket.disconnect()
      reject(new Error('Connection timeout'))
    }, 10000)
    
    socket.on('connect', () => {
      clearTimeout(timeout)
      log(`  ${name} connected: ${socket.id}`, colors.blue)
      resolve(socket)
    })
    
    socket.on('connect_error', (error) => {
      clearTimeout(timeout)
      socket.disconnect()
      reject(error)
    })
  })
}

// ============================================
// Test 1: Socket.IO Connection (User 1)
// ============================================
async function testUser1Connection() {
  header('Test 1: User 1 Connection')
  
  try {
    state.socket1 = await createSocket(USER_1_ID, 'User 1')
    testPass('User 1 Connected')
    return true
  } catch (error) {
    testFail('User 1 Connection', error.message)
    return false
  }
}

// ============================================
// Test 2: Socket.IO Connection (User 2)
// ============================================
async function testUser2Connection() {
  header('Test 2: User 2 Connection')
  
  try {
    state.socket2 = await createSocket(USER_2_ID, 'User 2')
    testPass('User 2 Connected')
    return true
  } catch (error) {
    testFail('User 2 Connection', error.message)
    return false
  }
}

// ============================================
// Test 3: Get ICE Configuration
// ============================================
async function testGetIceConfig() {
  header('Test 3: Get ICE Configuration')
  
  if (!state.socket1) {
    testFail('Get ICE Config', 'No socket connection')
    return false
  }
  
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      testFail('Get ICE Config', 'Response timeout')
      resolve(false)
    }, 5000)
    
    state.socket1.emit('video:call:getIceConfig')
    
    state.socket1.on('video:call:iceConfig', (data) => {
      clearTimeout(timeout)
      
      if (!data || !data.iceServers || data.iceServers.length === 0) {
        testFail('Get ICE Config', 'No ICE servers in response')
        resolve(false)
        return
      }
      
      state.iceConfig = data.iceServers
      log(`  Received ${data.iceServers.length} ICE servers:`, colors.blue)
      data.iceServers.forEach((server, i) => {
        const auth = server.username ? ` [${server.username}]` : ''
        log(`    ${i + 1}. ${server.urls}${auth}`, colors.blue)
      })
      
      testPass('ICE Configuration Received')
      resolve(true)
    })
  })
}

// ============================================
// Test 4: Create Video Call Room
// ============================================
async function testCreateRoom() {
  header('Test 4: Create Video Call Room')
  
  if (!state.socket1) {
    testFail('Create Room', 'No socket connection')
    return false
  }
  
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      testFail('Create Room', 'Response timeout')
      resolve(false)
    }, 5000)
    
    // Setup listener first
    state.socket1.on('video:call:roomCreated', (data) => {
      clearTimeout(timeout)
      
      if (!data || !data.roomId) {
        testFail('Create Room', 'Invalid room data')
        resolve(false)
        return
      }
      
      state.roomId = data.roomId
      log(`  Room ID: ${data.roomId}`, colors.blue)
      log(`  Caller: ${data.callerId}, Callee: ${data.calleeId}`, colors.blue)
      
      testPass('Video Call Room Created')
      resolve(true)
    })
    
    state.socket1.on('video:call:error', (error) => {
      clearTimeout(timeout)
      testFail('Create Room', `${error.code}: ${error.message}`)
      resolve(false)
    })
    
    // Create room with User 2 as callee
    state.socket1.emit('video:call:createRoom', { calleeId: USER_2_ID })
  })
}

// ============================================
// Test 5: Join Video Call Room (User 2)
// ============================================
async function testJoinRoom() {
  header('Test 5: Join Video Call Room (User 2)')
  
  if (!state.socket2 || !state.roomId) {
    testFail('Join Room', 'Missing socket or room ID')
    return false
  }
  
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      testFail('Join Room', 'Response timeout')
      resolve(false)
    }, 5000)
    
    // Track participant joined on User 1's socket
    let participantJoined = false
    
    state.socket1.on('video:call:participantJoined', (data) => {
      participantJoined = true
      log(`  User 1 notified: Participant joined: ${data.userId}`, colors.blue)
    })
    
    state.socket2.on('video:call:roomJoined', (data) => {
      clearTimeout(timeout)
      
      if (!data || !data.participants) {
        testFail('Join Room', 'Invalid room data')
        resolve(false)
        return
      }
      
      log(`  Room ID: ${data.roomId}`, colors.blue)
      log(`  Participants: ${data.participants.join(', ')}`, colors.blue)
      
      testPass('User 2 Joined Room')
      
      if (participantJoined) {
        testPass('User 1 Notified of Join')
      }
      
      resolve(true)
    })
    
    state.socket2.on('video:call:error', (error) => {
      clearTimeout(timeout)
      testFail('Join Room', `${error.code}: ${error.message}`)
      resolve(false)
    })
    
    // Join room
    state.socket2.emit('video:call:joinRoom', { roomId: state.roomId })
  })
}

// ============================================
// Test 6: WebRTC Offer
// ============================================
async function testOffer() {
  header('Test 6: WebRTC Offer Exchange')
  
  if (!state.socket1 || !state.socket2 || !state.roomId) {
    testFail('Offer Exchange', 'Missing connections')
    return false
  }
  
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      testFail('Offer Exchange', 'Response timeout')
      resolve(false)
    }, 5000)
    
    // Create a mock WebRTC offer
    const mockOffer = {
      type: 'offer',
      sdp: 'v=0\r\no=- 123456789 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\n'
    }
    
    // Listen for offer on User 2's socket
    state.socket2.on('video:call:offer', (data) => {
      clearTimeout(timeout)
      
      if (!data || !data.offer) {
        testFail('Offer Exchange', 'No offer received')
        resolve(false)
        return
      }
      
      state.offer = data.offer
      log(`  Received offer from user ${data.from}`, colors.blue)
      log(`  Offer type: ${data.offer.type}`, colors.blue)
      
      testPass('WebRTC Offer Received')
      resolve(true)
    })
    
    // User 1 sends offer
    state.socket1.emit('video:call:offer', {
      roomId: state.roomId,
      offer: mockOffer
    })
  })
}

// ============================================
// Test 7: WebRTC Answer
// ============================================
async function testAnswer() {
  header('Test 7: WebRTC Answer Exchange')
  
  if (!state.socket1 || !state.socket2 || !state.roomId) {
    testFail('Answer Exchange', 'Missing connections')
    return false
  }
  
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      testFail('Answer Exchange', 'Response timeout')
      resolve(false)
    }, 5000)
    
    // Create a mock WebRTC answer
    const mockAnswer = {
      type: 'answer',
      sdp: 'v=0\r\no=- 987654321 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\n'
    }
    
    // Listen for answer on User 1's socket
    state.socket1.on('video:call:answer', (data) => {
      clearTimeout(timeout)
      
      if (!data || !data.answer) {
        testFail('Answer Exchange', 'No answer received')
        resolve(false)
        return
      }
      
      state.answer = data.answer
      log(`  Received answer from user ${data.from}`, colors.blue)
      log(`  Answer type: ${data.answer.type}`, colors.blue)
      
      testPass('WebRTC Answer Received')
      resolve(true)
    })
    
    // User 2 sends answer
    state.socket2.emit('video:call:answer', {
      roomId: state.roomId,
      answer: mockAnswer
    })
  })
}

// ============================================
// Test 8: ICE Candidate Exchange
// ============================================
async function testIceCandidateExchange() {
  header('Test 8: ICE Candidate Exchange')
  
  if (!state.socket1 || !state.socket2 || !state.roomId) {
    testFail('ICE Candidate Exchange', 'Missing connections')
    return false
  }
  
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      testFail('ICE Candidate Exchange', 'Response timeout')
      resolve(false)
    }, 5000)
    
    // Create mock ICE candidates
    const mockCandidate1 = {
      candidate: 'candidate:842163049 1 udp 1677729535 192.168.1.100 49152 typ host',
      sdpMid: '0',
      sdpMLineIndex: 0
    }
    
    const mockCandidate2 = {
      candidate: 'candidate:942163050 1 udp 1677729536 192.168.1.101 49153 typ host',
      sdpMid: '0',
      sdpMLineIndex: 0
    }
    
    let candidatesReceived = 0
    
    // Listen for ICE candidates on both sockets
    const checkComplete = () => {
      if (candidatesReceived >= 2) {
        clearTimeout(timeout)
        testPass('ICE Candidates Exchanged')
        resolve(true)
      }
    }
    
    state.socket1.on('video:call:iceCandidate', (data) => {
      if (data.candidate) {
        candidatesReceived++
        log(`  User 1 received ICE candidate from user ${data.from}`, colors.blue)
        state.iceCandidates.push(data.candidate)
        checkComplete()
      }
    })
    
    state.socket2.on('video:call:iceCandidate', (data) => {
      if (data.candidate) {
        candidatesReceived++
        log(`  User 2 received ICE candidate from user ${data.from}`, colors.blue)
        state.iceCandidates.push(data.candidate)
        checkComplete()
      }
    })
    
    // User 1 sends ICE candidate
    state.socket1.emit('video:call:iceCandidate', {
      roomId: state.roomId,
      candidate: mockCandidate1
    })
    
    // User 2 sends ICE candidate
    setTimeout(() => {
      state.socket2.emit('video:call:iceCandidate', {
        roomId: state.roomId,
        candidate: mockCandidate2
      })
    }, 100)
  })
}

// ============================================
// Test 9: Call End
// ============================================
async function testCallEnd() {
  header('Test 9: Call End')

  if (!state.socket1 || !state.socket2 || !state.roomId) {
    testFail('Call End', 'Missing connections')
    return false
  }

  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      testFail('Call End', 'Response timeout')
      resolve(false)
    }, 5000)

    let callEndedReceived = 0

    const checkComplete = () => {
      // Only 1 notification expected (recipient gets notified, not sender)
      if (callEndedReceived >= 1) {
        clearTimeout(timeout)
        testPass('Call Ended Notified')
        resolve(true)
      }
    }

    // Listen for call ended on both sockets
    state.socket1.on('video:call:ended', (data) => {
      callEndedReceived++
      log(`  User 1 notified: Call ended by ${data.endedBy}`, colors.blue)
      checkComplete()
    })

    state.socket2.on('video:call:ended', (data) => {
      callEndedReceived++
      log(`  User 2 notified: Call ended by ${data.endedBy}`, colors.blue)
      checkComplete()
    })

    // User 1 ends the call
    state.socket1.emit('video:call:ended', {
      roomId: state.roomId,
      reason: 'User ended call'
    })
  })
}

// ============================================
// Test 10: Leave Room
// ============================================
async function testLeaveRoom() {
  header('Test 10: Leave Room')
  
  if (!state.socket1 || !state.roomId) {
    testFail('Leave Room', 'Missing socket or room ID')
    return false
  }
  
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      testFail('Leave Room', 'Response timeout')
      resolve(false)
    }, 5000)
    
    state.socket1.on('video:call:roomLeft', (data) => {
      clearTimeout(timeout)
      
      if (data && data.roomId === state.roomId) {
        log(`  User 1 left room: ${data.roomId}`, colors.blue)
        testPass('Leave Room')
        resolve(true)
      }
    })
    
    state.socket1.emit('video:call:leaveRoom', { roomId: state.roomId })
  })
}

// ============================================
// Main Test Runner
// ============================================
async function runTests() {
  log('\n' + '█'.repeat(60), colors.cyan)
  log('  Socket.IO WebRTC Signaling - Test Suite', colors.cyan)
  log('█'.repeat(60), colors.cyan)
  
  log(`\nServer URL: ${SERVER_URL}`, colors.blue)
  log(`User 1 ID: ${USER_1_ID}`, colors.blue)
  log(`User 2 ID: ${USER_2_ID}`, colors.blue)
  
  try {
    // Test connections
    if (!await testUser1Connection()) throw new Error('User 1 connection failed')
    if (!await testUser2Connection()) throw new Error('User 2 connection failed')
    
    // Test ICE config
    if (!await testGetIceConfig()) throw new Error('ICE config failed')
    
    // Test room management
    if (!await testCreateRoom()) throw new Error('Create room failed')
    if (!await testJoinRoom()) throw new Error('Join room failed')
    
    // Test WebRTC signaling
    if (!await testOffer()) throw new Error('Offer exchange failed')
    if (!await testAnswer()) throw new Error('Answer exchange failed')
    if (!await testIceCandidateExchange()) throw new Error('ICE candidate exchange failed')
    
    // Test call end
    if (!await testCallEnd()) throw new Error('Call end failed')
    if (!await testLeaveRoom()) throw new Error('Leave room failed')
    
  } catch (error) {
    log(`\nTest Error: ${error.message}`, colors.red)
  } finally {
    // Cleanup - disconnect sockets
    if (state.socket1) {
      state.socket1.disconnect()
      log('\nDisconnected User 1', colors.yellow)
    }
    if (state.socket2) {
      state.socket2.disconnect()
      log('Disconnected User 2', colors.yellow)
    }
    
    // Wait for cleanup
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Print summary
    header('Test Summary')
    log(`Total Passed: ${testsPassed}`, testsPassed > 0 ? colors.green : colors.red)
    log(`Total Failed: ${testsFailed}`, testsFailed > 0 ? colors.red : colors.green)
    
    if (testsFailed === 0) {
      log('\n✓ All signaling tests passed!', colors.green)
      log('\nSignaling Flow Summary:', colors.cyan)
      log('  1. User 1 & User 2 connect via Socket.IO', colors.blue)
      log('  2. ICE config retrieved from server', colors.blue)
      log('  3. Room created by User 1', colors.blue)
      log('  4. User 2 joins room', colors.blue)
      log('  5. Offer/Answer exchanged', colors.blue)
      log('  6. ICE candidates exchanged', colors.blue)
      log('  7. Call ends, users leave room', colors.blue)
    } else {
      log('\n✗ Some tests failed', colors.red)
      log('\nCheck that:', colors.yellow)
      log('  - Server is running on ' + SERVER_URL, colors.blue)
      log('  - Database has users with IDs ' + USER_1_ID + ' and ' + USER_2_ID, colors.blue)
    }
    
    process.exit(testsFailed > 0 ? 1 : 0)
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  log('\n\nShutting down...', colors.yellow)
  if (state.socket1) state.socket1.disconnect()
  if (state.socket2) state.socket2.disconnect()
  process.exit(0)
})

// Run tests
runTests()

