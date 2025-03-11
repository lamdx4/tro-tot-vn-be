import { AccountRepository, CustomerRepository, AdminRepository } from '@/infras/repositories'
import { DataSource } from 'typeorm'
import { ConfigService } from './config.service'
import JWTService from './jwt.service'

export default class AuthService {
  private accountRepository: AccountRepository
  private customerRepository: CustomerRepository
  private adminRepository: AdminRepository
  private jwtService: JWTService
  private configService: ConfigService

  constructor() {
    this.accountRepository = new AccountRepository()
    this.customerRepository = new CustomerRepository()
    this.adminRepository = new AdminRepository()
    this.jwtService = new JWTService()
    this.configService = ConfigService.gI()
  }

  async login(phone: string, password: string) {
    const account = await this.accountRepository.findOneBy({
      phone: phone
    })
    if (!account) {
      throw new Error('Account not found')
    }

    if (account.password !== password) {
      throw new Error('Invalid password')
    }

    const payload = {
      accountId: account.accountId,
      phone: account.phone,
      roleId: account.roleId
    }

    const accessToken = this.jwtService.generateAccessToken(payload)
    const refreshToken = this.jwtService.generateRefreshToken(payload)

    return {
      accessToken,
      refreshToken
    }
  }
}
