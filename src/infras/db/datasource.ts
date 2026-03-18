import { DataSource } from 'typeorm'
import path from 'path'

const dbType = process.env.DB_CONNECTION || 'mysql'

const AppDataSource = new DataSource({
  type: dbType as any,
  host: process.env.DB_HOST!,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME!,
  password: process.env.DB_PASSWORD!,
  database: process.env.DB_DATABASE!,
  entities: [path.join(__dirname, '../../domains/**/*.entity.{js,ts}')],
  synchronize: process.env.NODE_ENV === 'development',
  ...(dbType === 'mssql' ? {
    options: {
      encrypt: true,
      trustServerCertificate: true
    }
  } : {}),
  subscribers: [path.join(__dirname, './subscribers/**/*.subscriber.{js,ts}')],
})

export default AppDataSource