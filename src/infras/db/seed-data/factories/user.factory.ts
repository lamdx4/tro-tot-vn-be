import { Account } from '@/domains/entities/account.entity'
import { Customer } from '@/domains/entities/customer.entity'
import { Admin } from '@/domains/entities/admin.entity'
import { AccountStatus, Gender } from '@/domains/entities/enum/value-object'
import { fakerVI as faker } from '@faker-js/faker'
import * as bcrypt from 'bcryptjs'
import AppDataSource from '@/infras/db/datasource'

export class UserFactory {
  /**
   * Creates a fake Account entity
   */
  static async create(overrides: Partial<Account> = {}): Promise<Partial<Account>> {
    // Generate more realistic Vietnamese phone number
    const phone = `0${faker.number.int({ min: 9, max: 9 })}${faker.string.numeric(8)}`
    
    // Hash password for security
    const password = await bcrypt.hash('Password123', 10)
    
    const defaultValues: Partial<Account> = {
      phone,
      status: AccountStatus.ACTIVE,
      email: faker.internet.email().toLowerCase(),
      password,
      roleId: overrides.roleId || 1 // Default to Customer role
    }
    
    return {
      ...defaultValues,
      ...overrides
    }
  }
  
  /**
   * Creates multiple fake Account entities
   */
  static async createMany(count: number, overrides: Partial<Account> = {}): Promise<Partial<Account>[]> {
    const users: Partial<Account>[] = []
    for (let i = 0; i < count; i++) {
      users.push(await this.create(overrides))
    }
    return users
  }

  /**
   * Creates a complete Customer with Account
   */
  static async createCustomer(accountOverrides: Partial<Account> = {}, customerOverrides: Partial<Customer> = {}): Promise<{account: Partial<Account>, customer: Partial<Customer>}> {
    // Ensure role ID is set to Customer
    const account = await this.create({
      roleId: 1, // Customer role
      ...accountOverrides
    })
    
    // Generate birthday between 18 and 70 years ago
    const now = new Date()
    const minAge = 18
    const maxAge = 70
    const birthYear = now.getFullYear() - faker.number.int({ min: minAge, max: maxAge })
    const birthMonth = faker.number.int({ min: 0, max: 11 })
    const birthDay = faker.number.int({ min: 1, max: 28 }) // Avoiding date validation issues
    const birthday = new Date(birthYear, birthMonth, birthDay)
    
    const customer: Partial<Customer> = {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      gender: faker.helpers.arrayElement([Gender.MALE, Gender.FEMALE]),
      birthday,
      bio: faker.lorem.paragraph(2),
      isVerified: faker.number.int({ min: 0, max: 1 }),
      ...customerOverrides
    }
    
    return { account, customer }
  }
  
  /**
   * Creates a complete Admin with Account
   */
  static async createAdmin(accountOverrides: Partial<Account> = {}, adminOverrides: Partial<Admin> = {}): Promise<{account: Partial<Account>, admin: Partial<Admin>}> {
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
  static async seedUsers(customerCount = 20, adminCount = 4): Promise<void> {
    const accountRepository = AppDataSource.getRepository(Account)
    const customerRepository = AppDataSource.getRepository(Customer)
    const adminRepository = AppDataSource.getRepository(Admin)
    
    // Create customers
    for (let i = 0; i < customerCount; i++) {
      const { account, customer } = await this.createCustomer()
      const savedAccount = await accountRepository.save(account)
      await customerRepository.save({
        ...customer,
        accountId: savedAccount.accountId
      })
    }
    
    // Create admins
    for (let i = 0; i < adminCount; i++) {
      const { account, admin } = await this.createAdmin()
      const savedAccount = await accountRepository.save(account)
      await adminRepository.save({
        ...admin,
        accountId: savedAccount.accountId
      })
    }
    
    console.log(`Seeded ${customerCount} customers and ${adminCount} admins`)
  }
}