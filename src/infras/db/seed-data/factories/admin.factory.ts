import { Account } from '@/domains/entities/account.entity'
import { Admin } from '@/domains/entities/admin.entity'
import { AccountStatus, Gender } from '@/domains/entities/enum/value-object'
import { fakerVI as faker } from '@faker-js/faker'
import AppDataSource from '@/infras/db/datasource'

export class ManagerFactory {
  /**
   * Creates a fake Account entity
   */
  static async create(overrides: Partial<Account> = {}): Promise<Partial<Account>> {
    // Generate more realistic Vietnamese phone number
    const phone = `0919180731`

    // Hash password for security
    const password = 'admin123'

    const defaultValues: Partial<Account> = {
      phone,
      status: AccountStatus.ACTIVE,
      email: 'manager1@trotot.vn',
      password,
      roleId: overrides.roleId || 3 // Default to Customer role
    }

    return {
      ...defaultValues,
      ...overrides
    }
  }

  /**
   * Creates a complete Admin with Account
   */
  static async createAdmin(
    accountOverrides: Partial<Account> = {},
    adminOverrides: Partial<Admin> = {}
  ): Promise<{ account: Partial<Account>; admin: Partial<Admin> }> {
    // Ensure role ID is set to Admin or Moderator
    const account = await this.create({
      roleId: faker.helpers.arrayElement([2, 3]), // Admin or Moderator roles
      ...accountOverrides
    })

    // Generate birthday between 25 and 60 years ago (admins tend to be older)
    const now = new Date()
    const minAge = 25
    const maxAge = 60
    const birthYear = now.getFullYear() - faker.number.int({ min: minAge, max: maxAge })
    const birthMonth = faker.number.int({ min: 0, max: 11 })
    const birthDay = faker.number.int({ min: 1, max: 28 })
    const birthday = new Date(birthYear, birthMonth, birthDay)

    const admin: Partial<Admin> = {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      gender: faker.helpers.arrayElement([Gender.MALE, Gender.FEMALE]),
      birthday,
      ...adminOverrides
    }

    return { account, admin }
  }

  /**
   * Seeds complete users with accounts and profiles
   */
  static async seedManager(): Promise<void> {
    const accountRepository = AppDataSource.getRepository(Account)
    if ((await accountRepository.count()) > 0) {
      console.log('Users already seeded')
      return
    }

    const adminRepository = AppDataSource.getRepository(Admin)

    const { account, admin } = await this.createAdmin()
    const savedAccount = await accountRepository.save(account)
    await adminRepository.save({
      ...admin,
      accountId: savedAccount.accountId
    })

    console.log(`Manager seeded with ID: ${savedAccount.accountId}`)
  }
}
