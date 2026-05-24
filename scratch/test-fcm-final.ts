import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const jsonPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
const absolutePath = jsonPath ? path.resolve(process.cwd(), jsonPath) : null;

if (!absolutePath || !fs.existsSync(absolutePath)) {
  console.error('❌ LỖI: Không tìm thấy file JSON!');
  process.exit(1);
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(absolutePath),
  });
}

async function testFCM() {
  const targetToken = 'cSeeLqddQryax191amqdqC:APA91bHeJOqXsAZsEir-zvHvSgjUy6JEYK0AfizBrdomiUoA1e6Mf3of7KWvkmaV0wJ6wu8f7CkCXngzzEwqt8itsxlIkDSTDg1VjZOjzejck3jSjLlB6Sc';

  console.log('\n--- SENDING PURE DATA PAYLOAD (SYNC WITH ADR FE) ---');
  
  // Gói tin chuẩn: KHÔNG có bất kỳ trường notification nào
  const message: admin.messaging.Message = {
    token: targetToken,
    data: {
      type: 'chat',
      senderName: 'Antigravity Pure Data',
      content: 'Tin nhắn này sẼ không hiện popup nếu bạn đang ở trong màn hình chat.',
      conversationId: '99',
      messageId: '3003'
    },
    android: {
      priority: 'high'
      // KHÔNG CÓ notification ở đây
    }
  };

  try {
    const response = await admin.messaging().send(message);
    console.log('🚀 GỬI THÀNH CÔNG! Message ID:', response);
    console.log('👉 Bây giờ code Java của bạn sẼ nhảy vào nhánh handleChatMessage và tự quyết định việc hiện thông báo.');
  } catch (error: any) {
    console.error('❌ GỬI THẤT BẠI!', error.message);
  }
}

testFCM();
