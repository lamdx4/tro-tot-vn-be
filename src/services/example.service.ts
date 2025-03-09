import { AccountRepository } from "@/infras/repositories";

export default class ExampleService {
  private accountRepository: AccountRepository;
  constructor() {
    this.accountRepository = new AccountRepository();
  }
  async getAllCustomers(){
    return await this.accountRepository.find();
  }
}
