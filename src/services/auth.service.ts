import { AccountRepository, CustomerRepository, AdminRepository } from '@/infras/repositories'
import { ConfigService } from './config.service'
import JWTService from './jwt.service'
import { Result } from '@/utils/result'

export default class AuthService {
  private accountRepository: AccountRepository
  private customerRepository: CustomerRepository
  private adminRepository: AdminRepository
  private jwtService: JWTService

  constructor() {
    this.accountRepository = new AccountRepository()
    this.customerRepository = new CustomerRepository()
    this.adminRepository = new AdminRepository()
    this.jwtService = new JWTService()
  }

  async registerAccount(phone: string, email: string, firstName: string, lastName: string, birthday: Date, gender: string, password: string) {
    const existAccount = await this.accountRepository.findOne({
      where: [{ phone: phone }, { email: email }]
    })
    if (existAccount) {
      return Result.fail(409, "User already exists")
    }

    const createUser = this.accountRepository.createAccount(phone, email, firstName, lastName, birthday, gender, password)
    
    if((await createUser).isSuccess){
      return Result.ok(true)
    } else {
      return Result.fail(402, "Roll Back Transaction")
    }
    
  }

  async login(identifier: string, password: string) {
    const account = await this.accountRepository.findOne({
      where: [{ phone: identifier }, { email: identifier }],
      relations: ['role', 'customer', 'admin']
    })
    if (!account) {
      throw new Error('Account not found')
    }
    if (account.password !== password) {
      throw new Error('Invalid password')
    }
    account.password = ''
    return {
      account: account,
      token: {
        accessToken: this.jwtService.generateAccessToken(Object.assign({}, account)),
        refreshToken: this.jwtService.generateRefreshToken(Object.assign({}, account))
      }
    }
  }

  async isEmail(email: string) {
    const isEmail = await this.accountRepository.findOne({ where: { email: email } })
    return isEmail
  }
}
