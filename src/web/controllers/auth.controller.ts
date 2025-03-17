import ResponseData from "@/utils/response";
import { Request, Response, NextFunction } from "express";
import AuthService from "@/services/auth.service";

class AuthController {
  private authService = new AuthService();

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
}

export default new AuthController();
