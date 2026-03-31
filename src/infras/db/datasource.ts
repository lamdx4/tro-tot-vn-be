import { DataSource } from 'typeorm'
import path from 'path'
import { ConfigService } from '@/services/config.service'

const config = ConfigService.gI()
const dbType = config.get('DB_CONNECTION')

const AppDataSource = new DataSource({
  type: dbType as any,
  host: config.get('DB_HOST'),
  port: config.get('DB_PORT'), // envalid.port() returns a number
  username: config.get('DB_USERNAME'),
  password: config.get('DB_PASSWORD'),
  database: config.get('DB_DATABASE'),
  entities: [path.join(__dirname, '../../domains/**/*.entity.{js,ts}')],
  synchronize: config.get('NODE_ENV') === 'development',
  ...(dbType === 'mssql' ? {
    options: {
      encrypt: true,
      trustServerCertificate: true
    }
  } : {}),
  subscribers: [path.join(__dirname, './subscribers/**/*.subscriber.{js,ts}')],
})

export default AppDataSource