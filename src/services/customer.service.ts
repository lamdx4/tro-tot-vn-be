import { RoleType } from '@/domains/entities/enum/value-object'
import { AccountRepository, CustomerRepository } from '@/infras/repositories'
import { Result } from '@/utils/data-types/result'
import { ro } from '@faker-js/faker/.'
import { ParsedQs } from 'qs'

export class CustomerService {
  private accountRepository: AccountRepository
  private customerRepository: CustomerRepository

  constructor() {
    this.accountRepository = new AccountRepository()
  }

  async getCustomerProfile(customerId: number) {
    const data = await this.customerRepository.findOne({
      where: { customerId },
      relations: ['post', ]
    })
    if (!data) {
      return Result.fail(404, 'CUSTOMER_NOT_FOUND')
    }
    return Result.ok(data)
  }

  async getMyProfile(accountId: number) {
    const account = await this.accountRepository.findOne({
      where: { accountId },
      relations: ['customer', 'admin', 'role']
    })
    if (!account) {
      return Result.fail(404, 'ACCOUNT_NOT_FOUND')
    }
    if (account.role.roleName === RoleType.CUSTOMER) {
      return Result.ok(account.customer)
    } else if (account.role.roleName === RoleType.MANAGER || account.role.roleName === RoleType.MODERATOR) {
      return Result.ok(account.admin)
    }
    return Result.fail(500, 'INTERNAL_SERVER_ERROR')
  }
}
