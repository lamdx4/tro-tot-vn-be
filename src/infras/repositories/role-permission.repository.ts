import { RolePermission } from '@/domains/entities/role-permission.entity'
import { DataSource, Repository } from 'typeorm'

export class RolePermissionRepository extends Repository<RolePermission> {
  constructor(private datasource: DataSource) {
    super(RolePermission, datasource.manager)
  }
}