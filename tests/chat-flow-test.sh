#!/bin/bash
# Test Chat Flow Script

BASE_URL="http://localhost:3333/api"

echo "========================================="
echo "   CHAT FLOW TEST"
echo "========================================="
echo ""

# Step 1: Login Alice
echo "Step 1: Login Alice"
ALICE_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"identifier":"alice@test.com","password":"Password123"}')

ALICE_TOKEN=$(echo $ALICE_RESPONSE | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
ALICE_CUSTOMER_ID=$(echo $ALICE_RESPONSE | grep -o '"customerId":[0-9]*' | head -1 | cut -d':' -f2)
echo "Alice customerId: $ALICE_CUSTOMER_ID"
echo ""

# Step 2: Login Bob
echo "Step 2: Login Bob"
BOB_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"identifier":"bob@test.com","password":"Password123"}')

BOB_TOKEN=$(echo $BOB_RESPONSE | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
BOB_CUSTOMER_ID=$(echo $BOB_RESPONSE | grep -o '"customerId":[0-9]*' | head -1 | cut -d':' -f2)
echo "Bob customerId: $BOB_CUSTOMER_ID"
echo ""

# Step 3: Create Conversation
echo "Step 3: Create Conversation"
CREATE_CONV_RESPONSE=$(curl -s -X POST "$BASE_URL/chat/conversations" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ALICE_TOKEN" \
  -d "{\"participantIds\":[$BOB_CUSTOMER_ID],\"type\":\"Direct\"}")

CONVERSATION_ID=$(echo $CREATE_CONV_RESPONSE | grep -o '"conversationId":[0-9]*' | head -1 | cut -d':' -f2)
echo "Conversation ID: $CONVERSATION_ID"
echo "Full response: $CREATE_CONV_RESPONSE"
echo ""

# Step 4: Alice sends text message
echo "Step 4: Alice sends text message"
MESSAGE_RESPONSE=$(curl -s -X POST "$BASE_URL/chat/conversations/$CONVERSATION_ID/messages" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ALICE_TOKEN" \
  -d '{"content":"Hello Bob!","messageType":"Text"}')

ALICE_MSG_ID=$(echo $MESSAGE_RESPONSE | grep -o '"messageId":[0-9]*' | head -1 | cut -d':' -f2)
echo "Alice message ID: $ALICE_MSG_ID"
echo "Message response: $MESSAGE_RESPONSE"
echo ""

# Step 5: Bob sends text message
echo "Step 5: Bob sends text message"
MESSAGE_RESPONSE_2=$(curl -s -X POST "$BASE_URL/chat/conversations/$CONVERSATION_ID/messages" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BOB_TOKEN" \
  -d '{"content":"Hi Alice!","messageType":"Text"}')

BOB_MSG_ID=$(echo $MESSAGE_RESPONSE_2 | grep -o '"messageId":[0-9]*' | head -1 | cut -d':' -f2)
echo "Bob message ID: $BOB_MSG_ID"
echo ""

# Step 6: Fetch messages with limit/offset
echo "Step 6: Fetch messages (limit=10, offset=0)"
MESSAGES_RESPONSE=$(curl -s -X GET "$BASE_URL/chat/conversations/$CONVERSATION_ID/messages?limit=10&offset=0" \
  -H "Authorization: Bearer $ALICE_TOKEN")

echo "Messages response: $MESSAGES_RESPONSE"
echo ""

# Step 7: Get conversation participants
echo "Step 7: Get conversation participants"
PARTICIPANTS_RESPONSE=$(curl -s -X GET "$BASE_URL/chat/conversations/$CONVERSATION_ID/participants" \
  -H "Authorization: Bearer $ALICE_TOKEN")

echo "Participants response: $PARTICIPANTS_RESPONSE"
echo ""

# Step 8: Get conversations list
echo "Step 8: Get conversations list"
CONVS_LIST_RESPONSE=$(curl -s -X GET "$BASE_URL/chat/conversations" \
  -H "Authorization: Bearer $ALICE_TOKEN")

echo "Conversations list: $CONVS_LIST_RESPONSE"
echo ""

# Step 9: Pagination test
echo "Step 9: Test pagination (limit=1, offset=0)"
PAGINATED_MESSAGES=$(curl -s -X GET "$BASE_URL/chat/conversations/$CONVERSATION_ID/messages?limit=1&offset=0" \
  -H "Authorization: Bearer $ALICE_TOKEN")

echo "Paginated messages: $PAGINATED_MESSAGES"
echo ""

echo "========================================="
echo "   TEST COMPLETED"
echo "========================================="
