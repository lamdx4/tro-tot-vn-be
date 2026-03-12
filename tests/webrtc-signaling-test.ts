/**
 * WebRTC Video Call Signaling Test
 * Tests the complete signaling flow: CREATE_ROOM → JOIN_ROOM → PEER_CONNECTED → OFFER → ANSWER → ICE_CANDIDATE
 *
 * This test verifies the signaling between two clients. Since RTCPeerConnection is browser-only,
 * we focus on the Socket.IO signaling flow and verify events are exchanged correctly.
 *
 * Run with: npx tsx tests/webrtc-signaling-test.ts
 */

import { io, Socket } from 'socket.io-client';
import * as readline from 'readline';

// Types from the server
interface IceServerConfig {
  urls: string;
  username?: string;
  credential?: string;
}

interface IceServersResponse {
  iceServers: IceServerConfig[];
}

interface RoomCreatedEvent {
  roomId: string;
  callerId: string;
  calleeId: string;
  createdAt: Date;
}

interface RoomJoinedEvent {
  roomId: string;
  participants: string[];
  joinedAt: Date;
}

interface PeerConnectedEvent {
  roomId: string;
  peerUserId: string;
  timestamp: Date;
}

interface OfferEvent {
  roomId: string;
  offer: RTCSessionDescriptionInit;
  from: string;
}

interface AnswerEvent {
  roomId: string;
  answer: RTCSessionDescriptionInit;
  from: string;
}

interface IceCandidateEvent {
  roomId: string;
  candidate: RTCIceCandidateInit;
  from: string;
}

// Test configuration
const SERVER_URL = 'http://localhost:3333';
const TEST_TIMEOUT = 30000; // 30 seconds

// Test users - use numeric IDs that exist in the seeded database
const USER_A = '1';  // First user
const USER_B = '2';  // Second user

// Test state
let socketA: Socket | null = null;
let socketB: Socket | null = null;
let roomId: string = '';
let iceConfig: IceServerConfig[] = [];

// Events tracking for verification
const eventsReceived = {
  socketA: {
    roomCreated: false,
    roomJoined: false,
    peerConnected: [] as string[],
    offer: false,
    answer: false,
    iceCandidate: false
  },
  socketB: {
    roomCreated: false,
    roomJoined: false,
    peerConnected: [] as string[],
    offer: false,
    answer: false,
    iceCandidate: false
  }
};

// Logging utilities
function log(message: string, level: 'info' | 'success' | 'error' | 'warning' = 'info'): void {
  const prefix = {
    info: '📘',
    success: '✅',
    error: '❌',
    warning: '⚠️'
  }[level];
  console.log(`${prefix} ${message}`);
}

function error(message: string, error?: any): void {
  console.error(`❌ ${message}`, error || '');
}

// Readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// ==================== Helper Functions ====================

/**
 * Get ICE configuration from server
 */
async function getIceConfig(): Promise<IceServerConfig[]> {
  log('Fetching ICE configuration...', 'info');
  const response = await fetch(`${SERVER_URL}/api/video-call/ice-config`);
  const json = await response.json();
  // API returns: { success: true, data: { iceServers: [...] } }
  const data = json.data as IceServersResponse;
  log(`Got ${data.iceServers.length} ICE servers`, 'success');
  return data.iceServers;
}

/**
 * Connect two socket clients
 */
async function connectSockets(): Promise<void> {
  log('Connecting socket A (user 1)...', 'info');
  socketA = io(SERVER_URL, {
    auth: { userId: USER_A },
    transports: ['websocket'],
    reconnection: false,
    timeout: 10000
  });

  log('Connecting socket B (user 2)...', 'info');
  socketB = io(SERVER_URL, {
    auth: { userId: USER_B },
    transports: ['websocket'],
    reconnection: false,
    timeout: 10000
  });

  await new Promise<void>((resolve, reject) => {
    let connected = 0;
    const timeout = setTimeout(() => reject(new Error('Socket connection timeout')), TEST_TIMEOUT);

    socketA!.on('connect', () => {
      connected++;
      log(`Socket A connected: ${socketA!.id}`, 'success');
      if (connected === 2) {
        clearTimeout(timeout);
        resolve();
      }
    });

    socketB!.on('connect', () => {
      connected++;
      log(`Socket B connected: ${socketB!.id}`, 'success');
      if (connected === 2) {
        clearTimeout(timeout);
        resolve();
      }
    });

    socketA!.on('connect_error', (err) => {
      clearTimeout(timeout);
      reject(new Error(`Socket A connection error: ${err.message}`));
    });

    socketB!.on('connect_error', (err) => {
      clearTimeout(timeout);
      reject(new Error(`Socket B connection error: ${err.message}`));
    });
  });
}

/**
 * Set up event listeners for both sockets to track signaling flow
 */
function setupEventListeners(): void {
  // Socket A listeners (creator)
  socketA!.on('video:call:roomCreated', (data: RoomCreatedEvent) => {
    log(`Socket A: Received roomCreated - ${data.roomId}`, 'info');
    eventsReceived.socketA.roomCreated = true;
  });

  socketA!.on('video:call:peerConnected', (data: PeerConnectedEvent) => {
    log(`Socket A: Received peerConnected - peer: ${data.peerUserId}`, 'info');
    eventsReceived.socketA.peerConnected.push(data.peerUserId);
  });

  socketA!.on('video:call:offer', (data: OfferEvent) => {
    log(`Socket A: Received offer from ${data.from}`, 'info');
    eventsReceived.socketA.offer = true;
  });

  socketA!.on('video:call:answer', (data: AnswerEvent) => {
    log(`Socket A: Received answer from ${data.from}`, 'info');
    eventsReceived.socketA.answer = true;
  });

  socketA!.on('video:call:iceCandidate', (data: IceCandidateEvent) => {
    log(`Socket A: Received ICE candidate from ${data.from}`, 'info');
    eventsReceived.socketA.iceCandidate = true;
  });

  // Socket B listeners (joiner)
  socketB!.on('video:call:roomJoined', (data: RoomJoinedEvent) => {
    log(`Socket B: Received roomJoined - participants: ${data.participants.join(', ')}`, 'info');
    eventsReceived.socketB.roomJoined = true;
  });

  socketB!.on('video:call:peerConnected', (data: PeerConnectedEvent) => {
    log(`Socket B: Received peerConnected - peer: ${data.peerUserId}`, 'info');
    eventsReceived.socketB.peerConnected.push(data.peerUserId);
  });

  socketB!.on('video:call:offer', (data: OfferEvent) => {
    log(`Socket B: Received offer from ${data.from}`, 'info');
    eventsReceived.socketB.offer = true;
  });

  socketB!.on('video:call:answer', (data: AnswerEvent) => {
    log(`Socket B: Received answer from ${data.from}`, 'info');
    eventsReceived.socketB.answer = true;
  });

  socketB!.on('video:call:iceCandidate', (data: IceCandidateEvent) => {
    log(`Socket B: Received ICE candidate from ${data.from}`, 'info');
    eventsReceived.socketB.iceCandidate = true;
  });
}

/**
 * Create a room and join with the second user
 */
async function createAndJoinRoom(): Promise<void> {
  log('Creating room...', 'info');

  // Create room with User A as caller
  socketA!.emit('video:call:createRoom', { calleeId: USER_B });

  // Wait for room created
  const roomData = await new Promise<RoomCreatedEvent>((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Room creation timeout')), TEST_TIMEOUT);
    socketA!.once('video:call:roomCreated', (data) => {
      clearTimeout(timeout);
      resolve(data);
    });
  });

  roomId = roomData.roomId;
  log(`Room created: ${roomId}`, 'success');

  // User B joins the room
  log('User B joining room...', 'info');
  socketB!.emit('video:call:joinRoom', { roomId });

  // Wait for room joined confirmation
  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Room join timeout')), TEST_TIMEOUT);
    socketB!.once('video:call:roomJoined', () => {
      clearTimeout(timeout);
      log('User B joined room', 'success');
      resolve();
    });
  });
}

/**
 * Simulate the full WebRTC signaling flow:
 * 1. After PEER_CONNECTED, User A creates and sends OFFER
 * 2. User B receives OFFER, creates and sends ANSWER
 * 3. Both exchange ICE candidates
 */
async function testSignalingFlow(): Promise<void> {
  log('Testing signaling flow...', 'info');

  // Wait for PEER_CONNECTED on both sockets
  await new Promise<void>((resolve) => {
    const checkInterval = setInterval(() => {
      if (eventsReceived.socketA.peerConnected.length > 0 &&
          eventsReceived.socketB.peerConnected.length > 0) {
        clearInterval(checkInterval);
        resolve();
      }
    }, 100);

    setTimeout(() => {
      clearInterval(checkInterval);
      resolve(); // Continue even if not received (for debugging)
    }, 5000);
  });

  // Create a mock offer (we can't use real RTCPeerConnection in Node.js)
  const mockOffer = {
    type: 'offer' as RTCSdpType,
    sdp: 'v=0\r\no=- 123456789 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\n'
  };

  log('Sending mock offer from User A...', 'info');
  socketA!.emit('video:call:offer', { roomId, offer: mockOffer });

  // Wait for offer on Socket B
  await new Promise<void>((resolve) => {
    const timeout = setTimeout(() => resolve(), 3000);
    socketB!.once('video:call:offer', () => {
      clearTimeout(timeout);

      // Send mock answer
      const mockAnswer = {
        type: 'answer' as RTCSdpType,
        sdp: 'v=0\r\no=- 987654321 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\n'
      };
      log('Sending mock answer from User B...', 'info');
      socketB!.emit('video:call:answer', { roomId, answer: mockAnswer });

      resolve();
    });
  });

  // Wait for answer on Socket A
  await new Promise<void>((resolve) => {
    const timeout = setTimeout(() => resolve(), 3000);
    socketA!.once('video:call:answer', () => {
      clearTimeout(timeout);
      log('User A received answer', 'success');
      resolve();
    });
  });

  // Test ICE candidate exchange
  const mockCandidate = {
    candidate: 'candidate:1 1 UDP 2130306433 192.168.1.1 54777 typ host',
    sdpMid: '0',
    sdpMLineIndex: 0
  };

  log('Sending mock ICE candidate from User A...', 'info');
  socketA!.emit('video:call:iceCandidate', { roomId, candidate: mockCandidate });

  // Wait for ICE candidate on Socket B
  await new Promise<void>((resolve) => {
    const timeout = setTimeout(() => resolve(), 2000);
    socketB!.once('video:call:iceCandidate', () => {
      clearTimeout(timeout);
      log('User B received ICE candidate', 'success');
      resolve();
    });
  });
}

/**
 * Clean up test resources
 */
function cleanup(): void {
  log('Cleaning up...', 'info');

  if (socketA) {
    socketA.disconnect();
    socketA = null;
  }

  if (socketB) {
    socketB.disconnect();
    socketB = null;
  }

  log('Cleanup complete', 'success');
}

// ==================== Main Test Flow ====================

async function runFullTest(): Promise<void> {
  const results: { name: string; passed: boolean; details: string }[] = [];

  try {
    // Step 1: Get ICE configuration
    log('=== Starting WebRTC Signaling Test ===', 'info');
    try {
      iceConfig = await getIceConfig();
      results.push({ name: 'ICE Config', passed: true, details: `${iceConfig.length} servers` });
    } catch (err: any) {
      results.push({ name: 'ICE Config', passed: false, details: err.message });
      throw err;
    }

    // Step 2: Connect sockets
    log('--- Testing Socket Connections ---', 'info');
    try {
      await connectSockets();
      setupEventListeners();
      results.push({ name: 'Socket Connections', passed: true, details: 'A & B connected' });
    } catch (err: any) {
      results.push({ name: 'Socket Connections', passed: false, details: err.message });
      throw err;
    }

    // Step 3: Create and join room
    log('--- Testing Room Creation & Join ---', 'info');
    try {
      await createAndJoinRoom();
      results.push({ name: 'Room Create & Join', passed: true, details: roomId });
    } catch (err: any) {
      results.push({ name: 'Room Create & Join', passed: false, details: err.message });
      throw err;
    }

    // Step 4: Verify PEER_CONNECTED events
    log('--- Verifying PEER_CONNECTED Events ---', 'info');
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for events to propagate

    const peerConnectedA = eventsReceived.socketA.peerConnected.includes('2');
    const peerConnectedB = eventsReceived.socketB.peerConnected.includes('1');

    if (peerConnectedA && peerConnectedB) {
      log('PEER_CONNECTED received by both users!', 'success');
      results.push({ name: 'PEER_CONNECTED Events', passed: true, details: 'Both users notified' });
    } else {
      log(`PEER_CONNECTED status - A: ${peerConnectedA}, B: ${peerConnectedB}`, 'warning');
      results.push({ name: 'PEER_CONNECTED Events', passed: peerConnectedA && peerConnectedB,
        details: `A:${peerConnectedA}, B:${peerConnectedB}` });
    }

    // Step 5: Test signaling flow (offer/answer/ICE)
    log('--- Testing Signaling Flow ---', 'info');
    try {
      await testSignalingFlow();

      const offerReceived = eventsReceived.socketB.offer;
      const answerReceived = eventsReceived.socketA.answer;
      const iceReceived = eventsReceived.socketB.iceCandidate;

      results.push({
        name: 'Signaling Exchange',
        passed: offerReceived && answerReceived && iceReceived,
        details: `Offer:${offerReceived}, Answer:${answerReceived}, ICE:${iceReceived}`
      });
    } catch (err: any) {
      results.push({ name: 'Signaling Exchange', passed: false, details: err.message });
    }

  } catch (err: any) {
    log(`Test failed: ${err.message}`, 'error');
    error('Test execution error', err);
  } finally {
    // Print results
    log('=== Test Results ===', 'info');
    let passed = 0;
    let failed = 0;

    for (const result of results) {
      const status = result.passed ? '✅ PASS' : '❌ FAIL';
      log(`${status}: ${result.name} - ${result.details}`, result.passed ? 'success' : 'error');
      if (result.passed) passed++;
      else failed++;
    }

    log(`\nTotal: ${passed} passed, ${failed} failed`, failed === 0 ? 'success' : 'error');

    cleanup();
    rl.close();

    // Exit with appropriate code
    process.exit(failed > 0 ? 1 : 0);
  }
}

// ==================== Run Test ====================

// Check if server is running first
async function checkServer(): Promise<boolean> {
  try {
    const response = await fetch(`${SERVER_URL}/api/video-call/ice-config`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000)
    });
    return response.ok;
  } catch {
    return false;
  }
}

async function main(): Promise<void> {
  console.log('🔍 Checking if server is running...');

  const serverRunning = await checkServer();
  if (!serverRunning) {
    console.error('❌ Server is not running on http://localhost:3333');
    console.error('   Please start the server first with: yarn start:prod');
    rl.close();
    process.exit(1);
  }

  console.log('✅ Server is running\n');

  await runFullTest();
}

main().catch((err) => {
  error('Fatal error', err);
  rl.close();
  process.exit(1);
});

