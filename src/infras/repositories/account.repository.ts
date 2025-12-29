import { Account } from '@/domains/entities/account.entity'
import { Customer } from '@/domains/entities/customer.entity'
import { BaseRepository } from './base.repository'
import AppDataSource from '../db/datasource'
import { AdminRepository, CustomerRepository } from '@/infras/repositories'
import { Result } from '@/utils/data-types/result'
import { Admin } from '@/domains/entities/admin.entity'

export class AccountRepository extends BaseRepository<Account> {
  private customerRepository: CustomerRepository
  constructor() {
    super(Account)
    this.customerRepository = new CustomerRepository()
  }
  async createAccount(
    phone: string,
    email: string,
    firstName: string,
    lastName: string,
    birthday: Date,
    gender: string,
    password: string,
    currentCity?: string,
    currentDistrict?: string,
    currentJob?: string
  ) {
    // await AppDataSource.initialize();
    const queryRunner = AppDataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()
    try {
      const newAccount = queryRunner.manager.create(Account, { phone, password, email, roleId: 1 })
      const saveAccount = await queryRunner.manager.save(newAccount)

      const newCustomer = queryRunner.manager.create(Customer, {
        gender,
        firstName,
        lastName,
        birthday,
        accountId: saveAccount.accountId,
        currentCity: currentCity || undefined,
        currentDistrict: currentDistrict || undefined,
        currentJob: currentJob || undefined
      })
      await queryRunner.manager.save(newCustomer)

      await queryRunner.commitTransaction()
      return Result.ok(true)
    } catch (err) {
      console.log(err)
      await queryRunner.rollbackTransaction()
      return Result.fail(402, 'Roll Back Transaction')
    } finally {
      await queryRunner.release()
    }
  }

  async changeAdminProfile(
    accountId: number,
    phone?: string,
    email?: string,
    gender?: string,
    birthday?: string | undefined,
    firstName?: string | undefined,
    lastName?: string | undefined
  ) {
    console.log('Change Admin Profile')
    console.log('AccountId:', accountId)
    console.log('Phone:', phone)
    console.log('Email:', email)
    console.log('Gender', gender)
    console.log('Birthday:', birthday)
    console.log('FirstName:', firstName)
    console.log('LastName:', lastName)
    try {
      this.manager.transaction(async (transactionalEntityManager) => {
        const accountRepository = transactionalEntityManager.getRepository(Account)
        const adminRepository = transactionalEntityManager.getRepository(Admin)
        const account = await accountRepository.findOne({ where: { accountId } })
        const customer = await adminRepository.findOne({ where: { accountId } })
        console.log('Account:', account)
        console.log('Customer:', customer)
        if (!customer || !account) {
          throw new Error('Account or Admin not found') // Adjusted error handling
        }
        if (phone) {
          account.phone = phone
        }
        if (email) {
          account.email = email
        }
        await accountRepository.save(account)
        if (birthday) {
          const birthdayDate = new Date(birthday)
          if (isNaN(birthdayDate.getTime())) {
            throw new Error('Invalid date format')
          }
          customer.birthday = birthdayDate
        }
        if (gender) {
          customer.gender = gender
        }
        if (firstName) {
          customer.firstName = firstName
        }
        if (lastName) {
          customer.lastName = lastName
        }
        await adminRepository.save(customer)
      })
    } catch (error) {
      console.error('Error updating profile:', error)
      return false
    }
    return true
  }
}
