#!/bin/bash
cd /home/winnguyen1905/work/tro-tot-vn-be
npx tsx app.ts > /tmp/server_out.log 2>&1 &
SERVER_PID=$!
echo "Server PID: $SERVER_PID"
sleep 45
echo "Checking server..."
curl -s http://localhost:3333/api/video-call/ice-config
echo ""
echo "Log:"
tail -30 /tmp/server_out.log

