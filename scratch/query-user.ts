import AppDataSource from '../src/infras/db/datasource';
import { Account } from '../src/domains/entities/account.entity';
import JWTService from '../src/services/jwt.service';

async function query() {
  try {
    await AppDataSource.initialize();
    const acc = await AppDataSource.getRepository(Account).findOne({ 
      where: { status: 'Active' },
      relations: ['customer', 'role'] 
    });
    
    if (!acc) {
      console.log('No active user found');
      return;
    }

    const jwtService = new JWTService();
    // Convert to plain object for jwt.sign
    const payload = JSON.parse(JSON.stringify(acc));
    const token = jwtService.generateAccessToken(payload);
    
    console.log('USER_ID:', acc.customer?.customerId);
    console.log('TOKEN:', token);
  } catch (error) {
    console.error(error);
  } finally {
    process.exit(0);
  }
}

query();
