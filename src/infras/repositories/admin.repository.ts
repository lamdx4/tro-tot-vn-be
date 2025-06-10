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
    phone: string
  ) {
    await this.manager.transaction(async (transaction) => {
      const formatter = new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })

      const account = transaction.getRepository(Account).create({
        email,
        phone,
        status: 'Active',
        password: formatter.format(new Date(birthday)).replace(/\//g, ''),
        roleId: 2
      })

      const accountSaved = await transaction.getRepository(Account).save(account)

      await transaction.getRepository(Admin).save(
        transaction.getRepository(Admin).create({
          firstName,
          lastName,
          gender,
          birthday: birthday,
          accountId: accountSaved.accountId
        })
      )
    })
  }
}
