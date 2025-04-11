import { Customer } from '@/domains/entities/customer.entity'
import { BaseRepository } from './base.repository'
import { Account } from '@/domains/entities/account.entity'
import ChangedProfileDto from '@/web/controllers/dto/changed-profile.dto'
import moment from 'moment'

export class CustomerRepository extends BaseRepository<Customer> {
  constructor() {
    super(Customer)
  }
  async updateProfile(customerId: number, data: ChangedProfileDto): Promise<boolean> {
    try {
      return await this.manager.transaction(async (transactionalEntityManager) => {
        const customer = await transactionalEntityManager.findOne(Customer, {
          where: { customerId },
          relations: { account: true }
        })
        if (!customer) {
          return false
        }

        await transactionalEntityManager.update(
          Customer,
          { customerId: customerId },
          {
            bio: data.bio,
            lastName: data.lastName,
            firstName: data.firstName,
            birthday: !isNaN(moment(data.birthDate, 'DD/MM/YYYY').toDate().getTime())
              ? moment(data.birthDate, 'DD/MM/YYYY').toDate()
              : undefined,
            gender: data.gender
          }
        )
        await transactionalEntityManager.update(Account, customer.accountId, {
          email: data.email
        })
        return true
      })
    } catch (error) {
      console.log(error)
      return false
    }
  }
}
