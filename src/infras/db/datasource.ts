import { DataSource } from 'typeorm'
import path from 'path'

const AppDataSource = new DataSource({
  type: 'mssql',
  host: 'localhost',
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [path.join(__dirname, '../../domains/**/*.entity.{js,ts}')],
  synchronize: true,
  options: {
    encrypt: true,
    trustServerCertificate: true
  }
})

export default AppDataSource