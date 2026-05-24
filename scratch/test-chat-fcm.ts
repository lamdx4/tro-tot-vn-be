import '../src/preload-env';
import AppDataSource from '../src/infras/db/datasource';
import { NotificationService } from '../src/services/notification.service';

async function testChatFCM() {
  try {
    console.log('🔄 Initializing Database DataSource...');
    await AppDataSource.initialize();
    console.log('✅ Connected to Database!');

    // Khởi động Redis client
    const { redisClient } = await import('../src/infras/redis/redis');
    console.log('✅ Redis connected!');

    // Lấy instance của NotificationService
    const notificationService = NotificationService.gI();

    const recipientId = 3; // Customer ID 3 (Tiểu Mi Trương - Thiết bị debug hiện tại)
    
    // Giả lập nội dung chat thực tế
    const chatPayload = {
      messageId: 9010,
      conversationId: 99,
      senderId: 1,
      content: 'Tin nhắn chẩn đoán luồng nghiệp vụ thực tế!',
      messageType: 'TEXT',
      createdAt: new Date(),
      senderName: 'Ken Kennedy'
    };

    console.log(`\n================ SIMULATING CHAT FCM FOR CUSTOMER ${recipientId} ================`);
    
    // Xem trạng thái socket lưu trong Redis của Customer 1
    const socketMapping = await redisClient.hgetall(`user:device:socket:${recipientId}`);
    const generalMapping = await redisClient.get(`user:socket:${recipientId}`);
    console.log(`- Redis user:device:socket:${recipientId} =`, socketMapping);
    console.log(`- Redis user:socket:${recipientId} =`, generalMapping);

    // Chạy thực tế luồng gửi FCM của hệ thống
    console.log('\n🚀 Triggering NotificationService.notifyChatMessage...');
    await notificationService.notifyChatMessage(recipientId, chatPayload);
    
    console.log('\n======================================================');
    console.log('✅ Simulating completed! Check the logs above for FCM results.');
    console.log('======================================================\n');
  } catch (error) {
    console.error('❌ Error executing test:', error);
  } finally {
    process.exit(0);
  }
}

testChatFCM();
