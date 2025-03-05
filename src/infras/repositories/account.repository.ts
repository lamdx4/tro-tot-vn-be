import { DataSource, Repository } from 'typeorm'
import { Account } from '../../domains'

export class AccountRepository extends Repository<Account> {
  constructor(private datasource: DataSource) {
    super(Account, datasource.manager)
  }
}
