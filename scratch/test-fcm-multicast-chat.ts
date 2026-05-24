import '../src/preload-env';
import { FCMService } from '../src/services/fcm.service';

async function testMulticast() {
  const fcmService = FCMService.gI();

  // Token mới nhất của Customer ID 1 (Ken Kennedy) vừa đăng ký tối nay lúc 21:40
  const activeToken = 'cKeuS-FkT6CafHWbaeYs59:APA91bGJ-2Exx3fMTWGqkKSn52s2dhLG7d57OHvaF8X81GyibmQsU0SHhc7ev4A1xvmyiDafBdRarCsDVdYUn9BIzZvLuZStTC3yOQrt9KcjjfYzF3j3sVo';

  console.log('\n--- DIAGNOSTIC: SENDING REAL CHAT PAYLOAD VIA FCM-SERVICE ---');
  
  // Cấu trúc gói tin chính xác 100% như Backend tạo ra khi chat thật
  const payload = {
    data: {
      type: 'chat',
      messageId: '9009',
      conversationId: '99',
      senderId: '3',
      content: 'Tin nhắn chẩn đoán thời gian thực qua FCMService!',
      messageType: 'TEXT',
      createdAt: new Date().toISOString(),
      senderName: 'Antigravity Multicast'
    },
    android: {
      priority: 'high' as const
    }
  };

  console.log('Sending message to token:', activeToken);
  console.log('Payload structure:', JSON.stringify(payload, null, 2));

  try {
    const response = await fcmService.sendMulticast([activeToken], payload);
    
    console.log('\n=================== GOOGLE FCM RESPONSE ===================');
    if (response) {
      console.log(`- Success Count: ${response.successCount}`);
      console.log(`- Failure Count: ${response.failureCount}`);
      console.log('- Responses Details:', JSON.stringify(response.responses, null, 2));
    } else {
      console.log('❌ Received NULL response from FCMService.sendMulticast');
    }
    console.log('===========================================================\n');
  } catch (error: any) {
    console.error('❌ Error executing testMulticast:', error);
  } finally {
    process.exit(0);
  }
}

testMulticast();
