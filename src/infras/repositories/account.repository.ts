import { Account } from '@/domains/entities/account.entity'
import { Customer } from '@/domains/entities/customer.entity'
import { BaseRepository } from './base.repository'
import { DataSource } from 'typeorm'
import AppDataSource from '../db/datasource'
import { CustomerRepository } from '@/infras/repositories'
import { Result } from '@/utils/result'

export class AccountRepository extends BaseRepository<Account> {
  private customerRepository: CustomerRepository
  constructor() {
    super(Account)
    this.customerRepository = new CustomerRepository()
  }
  async createAccount(phone: string, email: string, firstName: string, lastName: string, birthday: Date, gender: string, password: string) {
    // await AppDataSource.initialize();
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try{
      const newAccount = queryRunner.manager.create(Account, {phone, password, email, roleId: 1})
      const saveAccount = await queryRunner.manager.save(newAccount)

      const newCustomer = queryRunner.manager.create(Customer, {gender, firstName, lastName, birthday, accountId: saveAccount.accountId})
      const saveCustomer = await queryRunner.manager.save(newCustomer)

      await queryRunner.commitTransaction()
      return Result.ok(true)
    } catch (err) {
      await queryRunner.rollbackTransaction()
      return Result.fail(402, "Roll Back Transaction")
    } finally {
      await queryRunner.release()
    }
  }
}
