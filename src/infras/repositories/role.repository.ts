import { Role } from '@/domains/entities/role.entity'
import { BaseRepository } from './base.repository'

export class RoleRepository extends BaseRepository<Role> {
  constructor() {
    super(Role)
  }
}