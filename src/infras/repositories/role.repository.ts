import { Role } from '@/domains/entities/role.entity'
import { DataSource, Repository } from 'typeorm'

export class RoleRepository extends Repository<Role> {
  constructor(private datasource: DataSource) {
    super(Role, datasource.manager)
  }
}