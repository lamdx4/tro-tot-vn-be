import { Admin } from '@/domains/entities/admin.entity'
import { BaseRepository } from './base.repository'

export class AdminRepository extends BaseRepository<Admin> {
  constructor() {
    super(Admin)
  }
}