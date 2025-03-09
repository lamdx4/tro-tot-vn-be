import { AccountPenalty } from '@/domains/entities/account-penalty.entity'
import { DataSource, Repository } from 'typeorm'

export class AccountPenaltyRepository extends Repository<AccountPenalty> {
  constructor(private datasource: DataSource) {
    super(AccountPenalty, datasource.manager)
  }
}