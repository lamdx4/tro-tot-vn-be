# WebRTC Video Call Signaling System

This document describes the WebRTC 1-on-1 video call signaling system implemented in this project.

## Overview

The system provides:
- **ICE Server Configuration**: STUN/TURN server settings for WebRTC peer connections
- **Socket.IO Signaling**: Real-time signaling for WebRTC offer/answer/ICE candidate exchange
- **Room Management**: 1-on-1 video call room creation and management
- **Coturn Integration**: TURN server for NAT/firewall traversal
- **FCM Push Notifications**: Support for "Incoming Call" alerts when the app is in the background or closed.

## Architecture

```
┌─────────────┐     Socket.IO      ┌─────────────┐
│   Client A  │◄──────────────────►│   Server    │
│  (WebRTC)   │                    │  (Node.js)  │
└─────────────┘                    └──────┬──────┘
                                          │
                                   ┌──────┴──────┐      ┌─────────────┐
                                   │   Firebase  │◄─────┤   Client B  │
                                   │    (FCM)    │      │  (Offline)  │
                                   └─────────────┘      └─────────────┘
```

## Configuration

### Environment Variables

Add these to your `.env.development` file:

```env
# STUN servers (comma-separated, no authentication required)
STUN_SERVER_URLS=stun:stun.l.google.com:19302,stun:stun1.l.google.com:19302,stun:stun2.l.google.com:19302

# Coturn/TURN server configuration
TURN_SERVER_IP=127.0.0.1
TURN_SERVER_PORT=3478
TURN_SERVER_TLS_PORT=5349
TURN_USERNAME=tro-tot-user
TURN_CREDENTIAL=tro-tot-secret-2024
```

### Docker Compose

Start the Coturn server:

```bash
docker-compose up -d coturn
```

This starts Coturn on:
- TCP/UDP port 3478 (STUN/TURN)
- TCP port 5349 (TLS/TURN)
- UDP ports 49152-49172 (media)

## Socket.IO Events

### Client → Server Events

| Event | Description | Payload |
|-------|-------------|---------|
| `video:call:getIceConfig` | Request ICE configuration | None |
| `video:call:createRoom` | Create a video call room | `{ calleeId: number }` |
| `video:call:joinRoom` | Join an existing room | `{ roomId: string }` |
| `video:call:leaveRoom` | Leave current room | `{ roomId: string }` |
| `video:call:offer` | Send WebRTC offer | `{ roomId: string, offer: RTCSessionDescriptionInit }` |
| `video:call:answer` | Send WebRTC answer | `{ roomId: string, answer: RTCSessionDescriptionInit }` |
| `video:call:iceCandidate` | Send ICE candidate | `{ roomId: string, candidate: RTCIceCandidateInit }` |
| `video:call:accepted` | Accept incoming call | `{ roomId: string }` |
| `video:call:rejected` | Reject incoming call | `{ roomId: string, reason?: string }` |
| `video:call:ended` | End the call | `{ roomId: string, reason?: string }` |

### Server → Client Events

| Event | Description | Payload |
|-------|-------------|---------|
| `video:call:iceConfig` | ICE server configuration | `{ iceServers: IceServerConfig[] }` |
| `video:call:roomCreated` | Room created successfully | `{ roomId, callerId, calleeId }` |
| `video:call:roomJoined` | Successfully joined room | `{ roomId, participants }` |
| `video:call:roomLeft` | Left the room | `{ roomId, userId }` |
| `video:call:participantJoined` | Other user joined | `{ roomId, userId }` |
| `video:call:participantLeft` | Other user left | `{ roomId, userId }` |
| `video:call:offer` | Received WebRTC offer | `{ roomId, offer, from }` |
| `video:call:answer` | Received WebRTC answer | `{ roomId, answer, from }` |
| `video:call:iceCandidate` | Received ICE candidate | `{ roomId, candidate, from }` |
| `video:call:request` | **Incoming Call Request** | `{ roomId, callerId, calleeId }` |
| `video:call:accepted` | Call accepted by peer | `{ roomId, callerId, calleeId }` |
| `video:call:rejected` | Call rejected by peer | `{ roomId, callerId, calleeId, reason }` |
| `video:call:ended` | Call ended | `{ roomId, endedBy, reason }` |
| `video:call:error` | Error occurred | `{ code, message }` |

## ICE Configuration Response

The server returns ICE server configuration in this format:

```json
{
  "iceServers": [
    { "urls": "stun:stun.l.google.com:19302" },
    { "urls": "stun:stun1.l.google.com:19302" },
    { "urls": "stun:stun2.l.google.com:19302" },
    { "urls": "stun:127.0.0.1:3478" },
    { "urls": "turn:127.0.0.1:3478", "username": "tro-tot-user", "credential": "tro-tot-secret-2024" },
    { "urls": "turn:127.0.0.1:5349?transport=tcp", "username": "tro-tot-user", "credential": "tro-tot-secret-2024" }
  ]
}
```

```

## Notification & FCM Support

To enable "Incoming Call" alerts when the app is backgrounded, the backend uses FCM (Firebase Cloud Messaging).

### Device-level Tracking
The system tracks which devices are active via Socket.IO using the FCM token as a unique identifier.
- **Header**: Clients must pass the `x-fcm-token` in Socket.IO handshake headers.
- **Registration**: Clients must register their FCM tokens via the `/api/notifications/tokens` endpoint.
- **Fallback Logic**: If the callee has no active socket connection on a specific device, the server sends an FCM Push Notification with `high` priority.

### Signaling via Push
The following signaling events are sent via FCM Data messages:
- `VIDEO_CALL_REQUEST`: For the incoming call screen/ringing.
- `VIDEO_CALL_CANCELLED`: When the caller hangs up before the callee answers.
- `VIDEO_CALL_REJECTED`: Notifies caller's other devices.

**FCM Data Payload Format:**
All signaling pushes are sent as "Data-only" messages with the following structure:
```json
{
  "data": {
    "type": "VIDEO_CALL_REQUEST" | "VIDEO_CALL_CANCELLED" | "VIDEO_CALL_REJECTED",
    "roomId": "string",
    "callerId": "string",
    "callerName": "string", // Available for REQUEST
    "reason": "string"      // Available for REJECTED
  }
}
```

## API Endpoints

### GET /api/video-call/ice-config

Get ICE server configuration via HTTP.

### POST /api/notifications/tokens

Register or update an FCM push token for the current user.

**Payload:**
```json
{
  "fcmToken": "string",
  "platform": "android" | "ios" | "web"
}
```

### DELETE /api/notifications/tokens

Unregister a push token (on logout).

**Payload:**
```json
{
  "fcmToken": "string"
}
```

## Running Tests

### Prerequisites

1. Start the server:
   ```bash
   npm run dev
   ```

2. Start Coturn (optional but recommended):
   ```bash
   docker-compose up -d coturn
   ```

### Run All Tests

```bash
chmod +x tests/webrtc-test.sh
./tests/webrtc-test.sh
```

### Run Individual Tests

```bash
# Test Coturn only
./tests/webrtc-test.sh coturn

# Test Socket.IO signaling only
./tests/webrtc-test.sh signaling

# Test WebRTC only
./tests/webrtc-test.sh webrtc

# Start Coturn only
./tests/webrtc-test.sh start-coturn

# Stop Coturn only
./tests/webrtc-test.sh stop-coturn
```

### Manual Test with Node.js

```bash
# Test Coturn connectivity
node tests/coturn-test.js

# Test Socket.IO signaling
node tests/signaling-test.js

# Test WebRTC (browser tests skip in Node.js)
node tests/webrtc-test.js
```

## Client Integration Example

```javascript
// 1. Connect to Socket.IO
const socket = io('http://localhost:3333', {
  extraHeaders: {
    'x-fcm-token': 'YOUR_FCM_TOKEN_HERE'
  },
  transports: ['websocket']
});

// 2. Get ICE configuration
socket.emit('video:call:getIceConfig');
socket.on('video:call:iceConfig', (data) => {
  console.log('ICE servers:', data.iceServers);
  // Use these for RTCPeerConnection
});

// 3. Create a room
socket.emit('video:call:createRoom', { calleeId: 2 });

// 4. Handle WebRTC signaling
socket.on('video:call:offer', async ({ offer, from }) => {
  const pc = new RTCPeerConnection({ iceServers: config.iceServers });
  
  pc.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit('video:call:iceCandidate', {
        roomId,
        candidate: event.candidate
      });
    }
  };
  
  await pc.setRemoteDescription(offer);
  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);
  
  socket.emit('video:call:answer', { roomId, answer });
});
```

## Troubleshooting

### Connection Issues

1. **Check Coturn is running:**
   ```bash
   docker ps | grep coturn
   ```

2. **Test Coturn ports:**
   ```bash
   nc -zv 127.0.0.1 3478
   nc -zv 127.0.0.1 5349
   ```

3. **Check server logs:**
   ```bash
   docker logs tro-tot-coturn
   ```

### WebRTC Issues

1. **Check ICE candidates are being exchanged**
2. **Verify STUN/TURN credentials are correct**
3. **Check firewall rules for UDP ports**

## Security Considerations

- TURN credentials should be changed in production
- Use TLS (port 5349) in production environments
- Implement proper authentication for room creation
- Consider rate limiting for signaling events

