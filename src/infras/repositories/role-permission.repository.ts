import { RolePermission } from '@/domains/entities/role-permission.entity'
import { BaseRepository } from './base.repository'

export class RolePermissionRepository extends BaseRepository<RolePermission> {
  constructor() {
    super(RolePermission)
  }
}