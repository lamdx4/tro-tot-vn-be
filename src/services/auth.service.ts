import { AccountRepository } from "@/infras/repositories";
import redis from "@/infras/redis/redis";
import { MailService } from "@/services/mail.service";
import JWTService from "./jwt.service";
import { generateRandomNumber } from "@/utils/config/generate.helper";
import bcrypt from "bcryptjs";

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
    if (!user) throw new Error("EMAIL_NOT_FOUND");

    const otp = generateRandomNumber(6);
    await redis.set(`otp-forgot-password:${email}`, otp.toString(), "EX", 300);

    await this.mailService.createTransporter();
    await this.mailService.sendMail({
      from: "djiahak@gmail.com",
      to: email,
      subject: "OTP Verification",
      text: `Your OTP is ${otp}`,
    });

    return "OTP sent to email";
  }

  /**
   * Xác thực OTP
   */
  async verifyOtp(email: string, otp: string) {
    const storedOtp = await redis.get(`otp-forgot-password:${email}`);
    if (!storedOtp || storedOtp !== otp) throw new Error("OTP_INVALID");

    await redis.del(`otp-forgot-password:${email}`);

    // const resetToken = this.jwtService.generateAccessToken({ email });
    const resetToken = await bcrypt.hash(email, 10);
    await redis.set(`reset_token:${resetToken}`, email, "EX", 600);

    return { message: "OTP verified", resetToken };
  }

  /**
   * Đặt lại mật khẩu
   */
  async resetPassword(resetToken: string, password: string) {
    const email = await redis.get(`reset_token:${resetToken}`);
    if (!email) throw new Error("INVALID_TOKEN");

    const user = await this.isEmail(email);
    if (!user) throw new Error("EMAIL_NOT_FOUND");

    if (password === user.password) throw new Error("PASSWORD_NOT_MATCH");

    await this.updatePassword(email, password);
    await redis.del(`reset_token:${resetToken}`);

    return "Password reset successfully";
  }
}

