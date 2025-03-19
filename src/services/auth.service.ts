import { AccountRepository } from "@/infras/repositories";
import redis from "@/infras/redis/redis";
import { MailService } from "@/services/mail.service";
import JWTService from "./jwt.service";
import { generateRandomNumber } from "@/utils/config/generate.helper";
import bcrypt from "bcryptjs";
import { Result } from "@/utils/result";
import { promisify } from "util";

const ttlAsync = promisify(redis.ttl).bind(redis); // Chuyển ttl thành Promise

export default class AuthService {
  private accountRepository: AccountRepository;
  private mailService: MailService;
  private jwtService: JWTService;

  constructor() {
    this.accountRepository = new AccountRepository();
    this.mailService = new MailService();
    this.jwtService = new JWTService();
  }

  async isEmail(email: string) {
    return await this.accountRepository.findOne({ where: { email: email } });
  }

  async updatePassword(email: string, password: string) {
    return await this.accountRepository.update({ email }, { password });
  }

  /**
   * Gửi OTP đến email
   */
  async sendOtp(email: string) {
    const user = await this.isEmail(email);
    if (!user) {
        return Result.fail(404, 'EMAIL_NOT_FOUND');
    }
    
    const key = `otp-forgot-password:${email}`;
    
    // Kiểm tra TTL của OTP hiện tại
    const remainingTime = await ttlAsync(key);
    
    if (remainingTime && remainingTime > 0) {
      return Result.fail(429, `OTP đã được gửi. Vui lòng thử lại sau ${remainingTime} giây.`);
    }
    // Tạo và lưu OTP mới (hiệu lực 5 phút)
    const otp = generateRandomNumber(6);
    await redis.set(`otp-forgot-password:${email}`, otp.toString(), "EX", 300);

    // Gửi email
    await this.mailService.createTransporter();
    await this.mailService.sendMail({
        from: "djiahak@gmail.com",
        to: email,
        subject: "OTP Verification",
        text: `Your OTP is ${otp}`,
    });

    return Result.ok({ message: 'OTP sent to email', remainingTime });
}


  /**
   * Xác thực OTP
   */
  async verifyOtp(email: string, otp: string) {
    const storedOtp = await redis.get(`otp-forgot-password:${email}`);
    if (!storedOtp || storedOtp !== otp){
      return Result.fail(400, 'OTP_INVALID');
    }

    await redis.del(`otp-forgot-password:${email}`);
    

    const resetToken = await bcrypt.hash(email, 10);
    await redis.set(`reset_token:${resetToken}`, email, "EX", 180);

    return Result.ok({resetToken});
  }

  /**
   * Đặt lại mật khẩu
   */
  async resetPassword(resetToken: string, password: string) {
    const email = await redis.get(`reset_token:${resetToken}`);
    if (!email){
      return Result.fail(400, 'INVALID_TOKEN');
    }

    const user = await this.isEmail(email);
    if (!user){
      return Result.fail(404, 'EMAIL_NOT_FOUND');
    }

    await this.updatePassword(email, password);
    await redis.del(`reset_token:${resetToken}`);

    return Result.ok('Password reset successfully');
  }
}

