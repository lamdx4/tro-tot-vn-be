import { io } from 'socket.io-client';
import axios from 'axios';

const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2NvdW50SWQiOjEsInBob25lIjoiMDMzNzI1NjA0NiIsInBhc3N3b3JkIjoiQWRtaW4xMjM0Iiwicm9sZUlkIjoxLCJzdGF0dXMiOiJBY3RpdmUiLCJlbWFpbCI6Im1vbmduaGkucGh1bmdAZ21haWwuY29tIiwiY3VzdG9tZXIiOnsiY3VzdG9tZXJJZCI6MSwiYWNjb3VudElkIjoxLCJpc1ZlcmlmaWVkIjoxLCJnZW5kZXIiOiJNYWxlIiwiYmlvIjoiU8OhdSBo4bq_dCBo4bq_dCBjb24uIEtob2FuIMSRw6FuaCBnacOzIHZp4bq_dCB0cuG7nWkgxJHhuqFwIHRoxrDGoW5nIHTDrW0uIiwiZmlyc3ROYW1lIjoiTmfhu41jIMSQb8OgbiIsImxhc3ROYW1lIjoiUGjDuW5nIiwiYmlydGhkYXkiOiIyMDE0LTExLTA0IiwiYXZhdGFyIjpudWxsLCJjdXJyZW50Q2l0eSI6IlRwIEjhu5MgQ2jDrSBNaW5oIiwiY3VycmVudERpc3RyaWN0IjoiUXXhuq1uIELDrG5oIFTDom4iLCJjdXJyZW50Sm9iIjoiU3R1ZGVudCIsImpvaW5lZEF0IjoiMjAyNS0xMC0yOSJ9LCJyb2xlIjp7InJvbGVJZCI6MSwicm9sZU5hbWUiOiJDdXN0b21lciJ9LCJpYXQiOjE3NzgyMTkwNDIsImV4cCI6MTc3ODIyMjY0Mn0.z1ZEyQ4axmfy1wfzwjwQIzzxrFAxpEnkHkg2lOx27Kg';
const SERVER_URL = 'http://localhost:3333';

async function test() {
  console.log('--- STARTING CHAT SYNC & AUTO-JOIN TEST ---');

  // 1. Test HTTP Sync
  console.log('\n[1] Testing HTTP Sync API...');
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const response = await axios.get(`${SERVER_URL}/api/conversations/sync`, {
      params: { since: yesterday.toISOString() },
      headers: { Authorization: `Bearer ${TOKEN}` }
    });
    
    console.log('✅ Sync API Success!');
    console.log(`Received ${response.data.data.length} missed messages.`);
    if (response.data.data.length > 0) {
        console.log('Example message:', response.data.data[0].content);
    }
  } catch (error: any) {
    console.error('❌ Sync API Failed:', error.response?.data || error.message);
  }

  // 2. Test Socket Auto-Join
  console.log('\n[2] Testing Socket Auto-Join...');
  const socket = io(SERVER_URL, {
    auth: { token: TOKEN },
    transports: ['websocket']
  });

  socket.on('connect', () => {
    console.log('✅ Socket connected! ID:', socket.id);
    console.log('Waiting for messages from auto-joined rooms...');
  });

  socket.on('message:received', (data) => {
    console.log('\n🔥 RECEIVED REALTIME MESSAGE!');
    console.log('From Room:', `conversation:${data.conversationId}`);
    console.log('Content:', data.content);
  });

  socket.on('connect_error', (err) => {
    console.error('❌ Socket Connection Error:', err.message);
  });

  // Giữ script chạy để đợi tin nhắn
  setTimeout(() => {
    console.log('\nTest finished after 15s. Closing socket.');
    socket.disconnect();
    process.exit(0);
  }, 15000);
}

test();
