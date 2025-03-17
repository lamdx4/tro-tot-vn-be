import ResponseData from "@/utils/response";
import { Request, Response, NextFunction } from "express";
import AuthService from "@/services/auth.service";

class AuthController {
  private authService = new AuthService();

  async registerAccount(req: Request, res: Response, next: NextFunction){
    const {phone, email, firstName, lastName, birthday, gender, password} = req.body
    const newUser = await this.authService.registerAccount(phone, email, firstName, lastName, birthday, gender, password)
    if(newUser.isSuccess){
      res.status(201).json(ResponseData.success("User registered successfully"))
    }
    else{
      if(newUser.code == 409){
        res.status(409).json(ResponseData.error(409, "USER_ALREADY_EXISTS", "User already exists"))
      } else {
        res.status(402).json(ResponseData.error(402, "ROLL_BACK_TRANSACTION", "Roll Back Transaction"))
      }
    }
  }
  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      const result = await this.authService.sendOtp(email);
      res.status(200).json(ResponseData.success(result));
    } catch (e: any) {
      res.status(400).json(ResponseData.error(400, e.message, e.message));
    }
  }

  async verifyOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, otp } = req.body;
      const result = await this.authService.verifyOtp(email, otp);
      res.status(200).json(ResponseData.success(result));
    } catch (e: any) {
      res.status(400).json(ResponseData.error(400, e.message, e.message));
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const password = req.body.password;
      console.log(req.body);
      // const resetToken = req.headers.authorization?.split(" ")[1];
      const resetToken = req.body.token;

      if (!resetToken) {
        throw new Error("TOKEN_REQUIRED");
      }

      const result = await this.authService.resetPassword(resetToken, password);
      res.status(200).json(ResponseData.success(result));
    } catch (e: any) {
      res.status(400).json(ResponseData.error(400, e.message, e.message));
    }
  }
  async login(req: Request, res: Response, next: NextFunction) {
    const { identifier, password } = req.body
    try {
      const result = await this.authService.login(identifier, password)
      res.status(200).json(ResponseData.success(result))
    } catch (error) {
      next(error)
    }
  }
}

export default new AuthController();
