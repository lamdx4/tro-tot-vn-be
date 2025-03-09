import { Permission } from '@/domains/entities/permission.entity'
import { BaseRepository } from './base.repository'

export class PermissionRepository extends BaseRepository<Permission> {
  constructor() {
    super(Permission)
  }
}