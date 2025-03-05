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
  logging: true,
  options: {
    encrypt: true,
    trustServerCertificate: true
  }
})

AppDataSource.initialize()
  .then((datasource) => {
    console.log('Data Source has been initialized!')
    datasource.getRepository('Account').count()
      .then((count) => {
        console.log('Account count:', count)
      }
    )
  })
  .catch((err) => {
    console.error('Error during Data Source initialization', err)
  })
export default AppDataSource