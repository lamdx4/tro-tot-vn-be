import { AccountPenalty } from '@/domains/entities/account-penalty.entity'
import { BaseRepository } from './base.repository'

export class AccountPenaltyRepository extends BaseRepository<AccountPenalty> {
  constructor() {
    super(AccountPenalty)
  }
}