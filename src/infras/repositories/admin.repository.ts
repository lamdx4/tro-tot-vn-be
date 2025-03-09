import { Admin } from '@/domains/entities/admin.entity'
import { DataSource, Repository } from 'typeorm'

export class AdminRepository extends Repository<Admin> {
  constructor(private datasource: DataSource) {
    super(Admin, datasource.manager)
  }
}