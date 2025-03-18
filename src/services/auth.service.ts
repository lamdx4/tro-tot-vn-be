import { AccountRepository, CustomerRepository, AdminRepository } from '@/infras/repositories'
import { ConfigService } from './config.service'
import JWTService from './jwt.service'
import { Result } from '@/utils/result'
import redis from '@/infras/redis/redis'
import bcrypt from 'bcryptjs'
import { generateRandomNumber } from '@/utils/config/generate.helper'
import { MailService } from './mail.service'

export default class AuthService {
  private accountRepository: AccountRepository
  private mailService: MailService
  private jwtService: JWTService

  constructor() {
    this.accountRepository = new AccountRepository()
    this.mailService = new MailService()
    this.jwtService = new JWTService()
  }

  async isEmail(email: string) {
    return await this.accountRepository.findOne({ where: { email: email } })
  }

  async updatePassword(email: string, password: string) {
    return await this.accountRepository.update({ email }, { password })
  }

  /**
   * Gửi OTP đến email
   */
  async sendOtp(email: string) {
    const user = await this.isEmail(email)
    if (!user) throw new Error('EMAIL_NOT_FOUND')

    const otp = generateRandomNumber(6)
    await redis.set(`otp-forgot-password:${email}`, otp.toString(), 'EX', 300)

    await this.mailService.createTransporter()
    await this.mailService.sendMail({
      from: 'djiahak@gmail.com',
      to: email,
      subject: 'OTP Verification',
      text: `Your OTP is ${otp}`
    })

    return 'OTP sent to email'
  }

  /**
   * Xác thực OTP
   */
  async verifyOtp(email: string, otp: string) {
    const storedOtp = await redis.get(`otp-forgot-password:${email}`)
    if (!storedOtp || storedOtp !== otp) throw new Error('OTP_INVALID')

    await redis.del(`otp-forgot-password:${email}`)

    // const resetToken = this.jwtService.generateAccessToken({ email });
    const resetToken = await bcrypt.hash(email, 10)
    await redis.set(`reset_token:${resetToken}`, email, 'EX', 600)

    return { message: 'OTP verified', resetToken }
  }

  /**
   * Đặt lại mật khẩu
   */
  async resetPassword(resetToken: string, password: string) {
    const email = await redis.get(`reset_token:${resetToken}`)
    if (!email) throw new Error('INVALID_TOKEN')

    const user = await this.isEmail(email)
    if (!user) throw new Error('EMAIL_NOT_FOUND')

    if (password === user.password) throw new Error('PASSWORD_NOT_MATCH')

    await this.updatePassword(email, password)
    await redis.del(`reset_token:${resetToken}`)

    return 'Password reset successfully'
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
}
