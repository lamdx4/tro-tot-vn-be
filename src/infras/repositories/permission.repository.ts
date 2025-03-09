import { Permission } from '@/domains/entities/permission.entity'
import { DataSource, Repository } from 'typeorm'

export class PermissionRepository extends Repository<Permission> {
  constructor(private datasource: DataSource) {
    super(Permission, datasource.manager)
  }
}