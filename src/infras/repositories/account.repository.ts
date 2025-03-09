import { Account } from '@/domains/entities/account.entity'
import { BaseRepository } from './base.repository'

export class AccountRepository extends BaseRepository<Account> {
  constructor() {
    super(Account)
  }
}
