import { DataSource, EntityTarget, ObjectLiteral, Repository } from 'typeorm'
import AppDataSource from '../db/datasource'

export class BaseRepository<T extends ObjectLiteral> extends Repository<T> {
  constructor(entity: EntityTarget<T>) {
    super(entity, AppDataSource.manager)
  }
}