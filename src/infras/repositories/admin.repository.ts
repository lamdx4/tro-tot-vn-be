import { Admin } from '@/domains/entities/admin.entity'
import { BaseRepository } from './base.repository'
import { tr } from '@faker-js/faker/.'
import { Account } from '@/domains/entities/account.entity'

export class AdminRepository extends BaseRepository<Admin> {
  constructor() {
    super(Admin)
  }

  async createAdmin(
    firstName: string,
    lastName: string,
    gender: string,
    birthday: string,
    email: string,
    phone: string,
    password: string
  ) {
    this.manager.transaction(async (transaction) => {
      const account = this.manager
        .getRepository(Account)
        .create({ email, phone, status: 'Active', password, roleId: 2 })
        
      const accountSaved = await this.manager.getRepository(Account).save(account)

      const admin = this.manager.getRepository(Admin).create({
        firstName,
        lastName,
        gender,
        birthday: birthday,
        accountId: accountSaved.accountId
      })

      // Lưu đối tượng Admin vào cơ sở dữ liệu
      await this.manager.getRepository(Account).save(admin)
    })
  }
}
