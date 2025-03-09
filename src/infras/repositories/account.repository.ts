import { Account } from '@/domains/entities/account.entity'
import { DataSource, Repository } from 'typeorm'

export class AccountRepository extends Repository<Account> {
  constructor(private datasource: DataSource) {
    super(Account, datasource.manager)
  }
}
