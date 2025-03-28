import redis from '@/infras/redis/redis'
import { generateRandomNumber } from '@/utils/config/generate.helper'
import bcrypt from 'bcryptjs'
import { Result } from '@/utils/data-types/result'
import { promisify } from 'util'
import { AccountRepository, CustomerRepository, AdminRepository } from '@/infras/repositories'
import JWTService from './jwt.service'
import { MailService } from './mail.service'
import { text } from 'stream/consumers'
const ttlAsync = promisify(redis.ttl).bind(redis) // Chuyển ttl thành Promise

export default class AuthService {
  private accountRepository: AccountRepository
  private mailService: MailService
  private jwtService: JWTService

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
  async sendOtp(keyRedis: string, email: string) {
    const user = await this.isEmail(email)
    if (!user) {
      return Result.fail(404, 'EMAIL_NOT_FOUND')
    }

    // const key = `otp-forgot-password:${email}`
    const key = `${keyRedis}:${email}`

    // Kiểm tra TTL của OTP hiện tại
    const remainingTime = await ttlAsync(key)

    if (remainingTime && remainingTime > 0) {
      return Result.fail(429, `OTP đã được gửi. Vui lòng thử lại sau ${remainingTime} giây.`)
    }
    // Tạo và lưu OTP mới (hiệu lực 5 phút)
    const otp = generateRandomNumber(6)
    await redis.set(`otp-forgot-password:${email}`, otp.toString(), 'EX', 300)

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

  /**
   * Xác thực OTP
   */
  async verifyOtp(keyRedis: string, email: string, otp: string) {
    // const storedOtp = await redis.get(`otp-forgot-password:${email}`)
    const storedOtp = await redis.get(`${keyRedis}:${email}`)
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
