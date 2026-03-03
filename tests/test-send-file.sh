#!/bin/bash
# Test File Upload via HTTP

BASE_URL="http://localhost:3333/api"

echo "========================================="
echo "   FILE UPLOAD TEST"
echo "========================================="
echo ""

# Step 1: Login Alice
echo "Step 1: Login Alice"
ALICE_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"identifier":"alice@test.com","password":"Password123"}')

ALICE_TOKEN=$(echo $ALICE_RESPONSE | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
echo "Alice token: ${ALICE_TOKEN:0:50}..."
echo ""

# Step 2: Get conversation ID
echo "Step 2: Get Alice's conversation"
CONVS_RESPONSE=$(curl -s -X GET "$BASE_URL/chat/conversations" \
  -H "Authorization: Bearer $ALICE_TOKEN")

CONVERSATION_ID=$(echo $CONVS_RESPONSE | grep -o '"conversationId":[0-9]*' | head -1 | cut -d':' -f2)
echo "Conversation ID: $CONVERSATION_ID"
echo ""

# Step 3: Upload an image file
echo "Step 3: Upload image file"
# Create a simple test image (1x1 pixel PNG)
echo -e '\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\x0cIDATx\x9cc\xf8\xcf\xc0\x00\x00\x00\x03\x00\x01\x00\x05\xfe\xd4\x00\x00\x00\x00IEND\xaeB`\x82' > /tmp/test_image.png

FILE_UPLOAD_RESPONSE=$(curl -s -X POST "$BASE_URL/chat/conversations/$CONVERSATION_ID/files" \
  -H "Authorization: Bearer $ALICE_TOKEN" \
  -F "file=@/tmp/test_image.png;type=image/png" \
  -F "content=Test image upload")

echo "File upload response: $FILE_UPLOAD_RESPONSE"
rm -f /tmp/test_image.png
echo ""

# Step 4: Upload a generic file (PDF)
echo "Step 4: Upload generic file (PDF)"
echo "Fake PDF content" > /tmp/test.pdf

FILE_UPLOAD_RESPONSE_2=$(curl -s -X POST "$BASE_URL/chat/conversations/$CONVERSATION_ID/files" \
  -H "Authorization: Bearer $ALICE_TOKEN" \
  -F "file=@/tmp/test.pdf;type=application/pdf" \
  -F "content=Test PDF upload")

echo "File upload response: $FILE_UPLOAD_RESPONSE_2"
rm -f /tmp/test.pdf
echo ""

# Step 5: Get messages to verify attachments
echo "Step 5: Get messages with attachments"
MESSAGES_RESPONSE=$(curl -s -X GET "$BASE_URL/chat/conversations/$CONVERSATION_ID/messages?limit=5&offset=0" \
  -H "Authorization: Bearer $ALICE_TOKEN")

echo "Messages: $MESSAGES_RESPONSE"
echo ""

echo "========================================="
echo "   FILE UPLOAD TEST COMPLETED"
echo "========================================="
