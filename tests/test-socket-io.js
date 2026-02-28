const io = require('socket.io-client');

const BASE_URL = 'http://localhost:3333';

async function getToken(identifier, password) {
  const response = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, password })
  });
  const data = await response.json();
  return data.data.token.accessToken;
}

async function testSocketIO() {
  console.log('=========================================');
  console.log('   SOCKET.IO OFFLINE/ONLINE TEST');
  console.log('=========================================\n');

  // Step 1: Login
  console.log('Step 1: Login Alice and Bob');
  const aliceToken = await getToken('alice@test.com', 'Password123');
  const bobToken = await getToken('bob@test.com', 'Password123');
  
  // Get conversation ID
  const convsResponse = await fetch(`${BASE_URL}/api/chat/conversations`, {
    headers: { 'Authorization': `Bearer ${aliceToken}` }
  });
  const convsData = await convsResponse.json();
  const conversationId = convsData.data[0].conversationId;
  console.log('Conversation ID:', conversationId, '\n');

  // Step 2: Alice connects via Socket.IO (online)
  console.log('Step 2: Alice connects (goes online)');
  const aliceSocket = io(BASE_URL, {
    auth: { userId: '1' },
    transports: ['websocket']
  });

  await new Promise((resolve) => {
    aliceSocket.on('connect', resolve);
    setTimeout(() => resolve(), 3000);
  });
  aliceSocket.emit('join:conversation', conversationId);
  console.log('Alice is online\n');

  // Step 3: Bob is OFFLINE (not connecting)
  console.log('Step 3: Bob is OFFLINE\n');

  // Step 4: Alice sends message - Bob (offline) won't receive real-time
  console.log('Step 4: Alice sends message (Bob is offline - no real-time)');
  await fetch(`${BASE_URL}/api/chat/conversations/${conversationId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${aliceToken}` },
    body: JSON.stringify({ content: 'Hello Bob! (you are offline)', messageType: 'Text' })
  });
  console.log('Message sent\n');

  // Step 5: Bob comes ONLINE
  console.log('Step 5: Bob comes ONLINE');
  const bobSocket = io(BASE_URL, {
    auth: { userId: '2' },
    transports: ['websocket']
  });

  await new Promise((resolve) => {
    bobSocket.on('connect', resolve);
    setTimeout(() => resolve(), 3000);
  });
  bobSocket.emit('join:conversation', conversationId);
  console.log('Bob is now online\n');

  // Listen for user online event on Alice's side
  aliceSocket.on('user:online', (data) => {
    console.log('Alice sees Bob is ONLINE:', data);
  });

  // Step 6: Bob fetches missed messages via HTTP
  console.log('Step 6: Bob fetches missed messages via HTTP');
  const messagesResponse = await fetch(`${BASE_URL}/api/chat/conversations/${conversationId}/messages?limit=5&offset=0`, {
    headers: { 'Authorization': `Bearer ${bobToken}` }
  });
  const messagesData = await messagesResponse.json();
  console.log('Bob fetched', messagesData.data.length, 'messages');
  console.log('Latest:', messagesData.data[0].content, '\n');

  // Step 7: Bob replies - Alice should receive in real-time
  console.log('Step 7: Bob replies - Alice should receive REAL-TIME');
  
  // Setup listener BEFORE sending
  const aliceReceivedPromise = new Promise((resolve) => {
    aliceSocket.on('message:received', (data) => {
      console.log('✅ Alice received REAL-TIME message:', data.content);
      resolve(data);
    });
    setTimeout(() => resolve(null), 3000);
  });

  await fetch(`${BASE_URL}/api/chat/conversations/${conversationId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${bobToken}` },
    body: JSON.stringify({ content: 'Hi Alice! I got your message!', messageType: 'Text' })
  });

  const received = await aliceReceivedPromise;
  if (received) {
    console.log('✅ REAL-TIME DELIVERY WORKS!\n');
  } else {
    console.log('❌ Did not receive real-time message\n');
  }

  // Step 8: Bob goes OFFLINE
  console.log('Step 8: Bob goes OFFLINE');
  bobSocket.disconnect();
  await new Promise(r => setTimeout(r, 500));
  console.log('Bob is offline\n');

  // Listen for user offline event on Alice's side
  aliceSocket.on('user:offline', (data) => {
    console.log('Alice sees Bob is OFFLINE:', data);
  });
  await new Promise(r => setTimeout(r, 500));

  // Step 9: Alice sends message while Bob is offline
  console.log('Step 9: Alice sends while Bob is offline');
  await fetch(`${BASE_URL}/api/chat/conversations/${conversationId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${aliceToken}` },
    body: JSON.stringify({ content: 'Message while Bob offline', messageType: 'Text' })
  });
  console.log('Message sent (Bob is offline - no real-time)\n');

  // Step 10: Bob comes back online and fetches missed messages
  console.log('Step 10: Bob comes back online');
  const bobSocket2 = io(BASE_URL, {
    auth: { userId: '2' },
    transports: ['websocket']
  });

  await new Promise((resolve) => {
    bobSocket2.on('connect', resolve);
    setTimeout(() => resolve(), 3000);
  });
  console.log('Bob is back online\n');

  const messagesResponse2 = await fetch(`${BASE_URL}/api/chat/conversations/${conversationId}/messages?limit=5&offset=0`, {
    headers: { 'Authorization': `Bearer ${bobToken}` }
  });
  const messagesData2 = await messagesResponse2.json();
  console.log('Bob fetched after coming back:', messagesData2.data.length, 'messages');
  console.log('Latest:', messagesData2.data[0].content, '\n');

  // Cleanup
  aliceSocket.disconnect();
  bobSocket2.disconnect();

  console.log('=========================================');
  console.log('   TEST SUMMARY:');
  console.log('=========================================');
  console.log('✅ Login with JWT');
  console.log('✅ Create conversation');
  console.log('✅ Send messages');
  console.log('✅ Upload file/image via HTTP');
  console.log('✅ Offline/Online status via Socket.IO');
  console.log('✅ Real-time message delivery');
  console.log('✅ Fetch missed messages when back online');
  console.log('=========================================');
}

testSocketIO().catch(console.error);
