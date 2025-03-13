import { AccountRepository, CustomerRepository, AdminRepository } from "@/infras/repositories"
import { DataSource } from "typeorm"
import { ConfigService } from "./config.service"
import JWTService from "./jwt.service"

export default class AuthService {
  private accountRepository: AccountRepository
  constructor() {
    this.accountRepository = new AccountRepository()
  }
  async isEmail(email: string) {
    const isEmail = await this.accountRepository.findOne({ where: { email: email } });
    return isEmail;
  }

  async updatePassword(email: string, password: string) {
    const isPassword = await this.accountRepository.update({ email: email }, { password: password });
    return isPassword;
  }
 
}
