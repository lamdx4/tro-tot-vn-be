import { Account } from '@/domains/entities/account.entity'
import { BaseRepository } from './base.repository'

export class AccountRepository extends BaseRepository<Account> {
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
      await queryRunner.manager.save(newCustomer)

      await queryRunner.commitTransaction()
      return Result.ok(true)
    } catch (err) {
      console.log(err)
      await queryRunner.rollbackTransaction()
      return Result.fail(402, "Roll Back Transaction")
    } finally {
      await queryRunner.release()
    }
  }
}
