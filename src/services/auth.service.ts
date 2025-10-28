import redis from '@/infras/redis/redis'
import { generateRandomNumber } from '@/utils/config/generate.helper'
import bcrypt from 'bcryptjs'
import { Result } from '@/utils/data-types/result'
import { AccountRepository, CustomerRepository, AdminRepository } from '@/infras/repositories'
import JWTService from './jwt.service'
import { MailService } from './mail.service'
import { AccountStatus } from '@/domains/entities/enum/value-object'

export default class AuthService {
  private accountRepository: AccountRepository
  private customerRepository: CustomerRepository
  private mailService: MailService
  private jwtService: JWTService

  constructor() {
    this.accountRepository = new AccountRepository()
    this.mailService = new MailService()
    this.jwtService = new JWTService()
    this.customerRepository = new CustomerRepository()
  }

  async refreshToken(refreshToken: string) {
    const result = this.jwtService.verifyRefreshToken(refreshToken)
    if (!result.isSuccess) {
      return Result.fail(401, 'Token is not valid')
    }
    const account = await this.accountRepository.findOne({
      where: { accountId: result.getValue()!.accountId },
      relations: ['role', 'customer', 'admin']
    })
    if (!account) {
      return Result.fail(401, 'Token is not valid')
    }
    return Result.ok({
      accessToken: this.jwtService.generateAccessToken(Object.assign({}, account))
    })
  }
  async logout(refreshToken: string) {
    // const result = this.jwtService.verifyRefreshToken(refreshToken)
    // if (!result.isSuccess) {
    //   return Result.fail(401, 'Token is not valid')
    // }
    return Result.ok()
  }

  async isEmail(email: string) {
    return await this.accountRepository.findOne({ where: { email: email } })
  }

  async updatePassword(email: string, password: string) {
    return await this.accountRepository.update({ email }, { password })
  }

  async changePassword(accountId: number, oldPassword: string, newPassword: string) {
    const account = await this.accountRepository.findOne({ where: { accountId: accountId } })
    if (!account) {
      return Result.fail(404, 'ACCOUNT_NOT_FOUND')
    }
    if (account.password !== oldPassword) {
      return Result.fail(400, 'PASSWORD_NOT_MATCH')
    }
    const r = await this.accountRepository.update({ accountId: accountId }, { password: newPassword })
    if (r.affected === 0) {
      return Result.fail(500, 'UPDATE_PASSWORD_FAIL')
    }
    return Result.ok(true)
  }

  /**
   * Gửi OTP đến email
   */
  async sendOtp(keyRedis: string, email: string) {
    const user = await this.isEmail(email)
    if (!user) {
      return Result.fail(404, 'EMAIL_NOT_FOUND')
    }

    // const key = `otp-forgot-password:${email}`
    const key = `${keyRedis}:${email}`

    // Kiểm tra TTL của OTP hiện tại
    const remainingTime = await redis.ttl(key)

    if (remainingTime && remainingTime > 0) {
      return Result.fail(429, `OTP đã được gửi. Vui lòng thử lại sau ${remainingTime} giây.`)
    }
    // Tạo và lưu OTP mới (hiệu lực 5 phút)
    const otp = generateRandomNumber(6)
    await redis.set(`${keyRedis}:${email}`, otp.toString(), 'EX', 300)

    // Gửi email
    await this.mailService.createTransporter()
    await this.mailService.sendMail({
      from: 'djiahak@gmail.com',
      to: email,
      subject: 'OTP Verification',
      text: `Your OTP is ${otp}`
    })

    return Result.ok({ message: 'OTP sent to email', remainingTime })
  }

  async setVerifiedCustomer(email: string) {
    const user = await this.isEmail(email)
    if (!user) {
      return Result.fail(404, 'EMAIL_NOT_FOUND')
    }
    const account = await this.accountRepository.findOne({ where: { email: email }, relations: ['customer'] })
    if (!account) {
      return Result.fail(404, 'ACCOUNT_NOT_FOUND')
    }
    const customer = await this.customerRepository.findOne({ where: { customerId: account.customer.customerId } })
    if (!customer) {
      return Result.fail(404, 'CUSTOMER_NOT_FOUND')
    }
    customer.isVerified = 1
    await this.customerRepository.save(customer)
    return Result.ok(true)
  }

  /**
   * Xác thực OTP
   */
  async verifyOtp(keyRedis: string, email: string, otp: string) {
    // const storedOtp = await redis.get(`otp-forgot-password:${email}`)
    const storedOtp = await redis.get(`${keyRedis}:${email}`)
    console.log(keyRedis, email, otp)
    if (!storedOtp || storedOtp !== otp) {
      return Result.fail(400, 'OTP_INVALID')
    }
    await redis.del(`${keyRedis}:${email}`)
    return Result.ok()
  }

  async verifyOtpForgotPassword(keyRedis: string, email: string, otp: string) {
    const r = await this.verifyOtp(keyRedis, email, otp)
    if (!r.isSuccess) {
      return Result.fail(400, 'OTP_INVALID')
    }
    const resetToken = await bcrypt.hash(email, 10)
    await redis.set(`reset_token:${resetToken}`, email, 'EX', 180)
    return Result.ok({ resetToken })
  }

  /**
   * Đặt lại mật khẩu
   */
  async resetPassword(resetToken: string, password: string) {
    const email = await redis.get(`reset_token:${resetToken}`)
    if (!email) {
      return Result.fail(400, 'INVALID_TOKEN')
    }

    const user = await this.isEmail(email)
    if (!user) {
      return Result.fail(404, 'EMAIL_NOT_FOUND')
    }
    await this.updatePassword(email, password)
    await redis.del(`reset_token:${resetToken}`)
    return Result.ok('Password reset successfully')
  }

  async registerAccount(
    phone: string,
    email: string,
    firstName: string,
    lastName: string,
    birthday: Date,
    gender: string,
    password: string
  ) {
    const existAccount = await this.accountRepository.findOne({
      where: [{ phone: phone }, { email: email }]
    })
    if (existAccount) {
      return Result.fail(409, 'User already exists')
    }

    const createUser = this.accountRepository.createAccount(
      phone,
      email,
      firstName,
      lastName,
      birthday,
      gender,
      password
    )

    if ((await createUser).isSuccess) {
      return Result.ok(true)
    } else {
      return Result.fail(402, 'Roll Back Transaction')
    }
  }

  async login(identifier: string, password: string) {
    const account = await this.accountRepository.findOne({
      select: {
        accountId: true,
        phone: true,
        email: true,
        status: true,
        password: true,
        role: {
          roleId: true,
          roleName: true,
          rolePermissions: {
            permissionId: true,
            roleId: true,
            permission: {
              permissionId: true,
              permissionName: true
            }
          }
        },
        admin: {
          adminId: true,
          firstName: true,
          lastName: true,
          birthday: true,
          gender: true
        },
        customer: {
          customerId: true,
          firstName: true,
          lastName: true,
          birthday: true,
          gender: true,
          avatar: true,
          currentCity: true,
          currentDistrict: true,
          currentJob: true,
          bio: true
        }
      },
      where: [{ phone: identifier }, { email: identifier }],
      relations: {
        role: {
          rolePermissions: {
            permission: true
          }
        },
        customer: true,
        admin: true
      }
    })
    if (!account) {
      throw new Error('Account not found')
    }
    if (account.password !== password) {
      return Result.fail(401, 'PASSWORD_NOT_MATCH')
    }
    if (account.status === AccountStatus.INACTIVE) {
      return Result.fail(423, 'ACCOUNT_INACTIVE')
    }
    account.password = 'pornhub.com'
    return Result.ok({
      account: account,
      token: {
        accessToken: this.jwtService.generateAccessToken(Object.assign({}, account)),
        refreshToken: this.jwtService.generateRefreshToken(Object.assign({}, account))
      }
    })
  }

  async isActiveAccount(accountId: number) {
    const account = await this.accountRepository.findOne({
      where: { accountId: accountId }
    })
    console.log(account)
    if (!account) {
      return Result.fail(404, 'ACCOUNT_NOT_FOUND')
    }
    if (account.status === AccountStatus.INACTIVE) {
      return Result.fail(423, 'ACCOUNT_INACTIVE')
    }
    return Result.ok(true)
  }
}
