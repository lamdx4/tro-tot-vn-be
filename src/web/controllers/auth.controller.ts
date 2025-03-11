import { Request, Response } from 'express'
class AuthController {
  async login(req: Request, res: Response) {
    const { phone, password } = req.body
  }
}
export default new AuthController()