import AppDataSource from '../src/infras/db/datasource';
import { DeviceToken } from '../src/domains/entities/device-token.entity';
import { Customer } from '../src/domains/entities/customer.entity';

async function checkTokens() {
  try {
    console.log('🔄 Initializing Database DataSource...');
    await AppDataSource.initialize();
    console.log('✅ Connected to SQL Server!');

    const tokenRepo = AppDataSource.getRepository(DeviceToken);
    const tokens = await tokenRepo.find({
      relations: ['customer']
    });

    console.log('\n======================================================');
    console.log(`📊 TOTAL REGISTERED TOKENS IN DB: ${tokens.length}`);
    console.log('======================================================');

    if (tokens.length === 0) {
      console.log('⚠️ No device tokens found in the database!');
    } else {
      tokens.forEach((t, i) => {
        console.log(`\n[Token #${i + 1}]`);
        console.log(`- ID: ${t.id}`);
        console.log(`- Customer ID: ${t.customerId}`);
        console.log(`- Platform: ${t.platform || 'N/A'}`);
        console.log(`- Created At: ${t.createdAt}`);
        console.log(`- Last Used: ${t.lastUsedAt}`);
        console.log(`- FCM Token: "${t.fcmToken}"`);
        if (t.customer) {
          console.log(`- Customer Name: ${t.customer.firstName} ${t.customer.lastName}`);
        }
      });
    }
    console.log('======================================================\n');
  } catch (error) {
    console.error('❌ Error querying device tokens:', error);
  } finally {
    process.exit(0);
  }
}

checkTokens();
