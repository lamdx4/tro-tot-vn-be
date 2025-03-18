import ResponseData from "@/utils/response";
import { Request, Response, NextFunction } from "express";
import AuthService from "@/services/auth.service";

class AuthController {
  private authService = new AuthService();

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    
      const { email } = req.body;
      const result = await this.authService.sendOtp(email);
      if (result.isSuccess) {
        res.status(200).json(ResponseData.success("OTP sent successfully"));
      } else {
        if (result.code === 404) {
          res.status(404).json(ResponseData.error(404, "USER_NOT_FOUND", "User with this email does not exist"));
        } else {
          res.status(500).json(ResponseData.error(500, "INTERNAL_ERROR", "An error occurred while sending OTP"));
        }
      }
    
  }

  async verifyOtp(req: Request, res: Response, next: NextFunction) {
    
      const { email, otp } = req.body;
      const result = await this.authService.verifyOtp(email, otp);
      console.log(result.getValue())
      console.log(result);
      if (result.isSuccess) {
        res.status(200).json(ResponseData.success(result.getValue()));
      } else {
        if (result.code === 400) {
          res.status(400).json(ResponseData.error(400, "INVALID_OTP", "OTP is incorrect or expired"));
        } else {
          res.status(500).json(ResponseData.error(500, "INTERNAL_ERROR", "An error occurred while verifying OTP"));
        }
      }
    }
    

  async resetPassword(req: Request, res: Response, next: NextFunction) {
      const password = req.body.password;
      const resetToken = req.body.resetToken;

      if (!resetToken) {
        return res.status(400).json(ResponseData.error(400, "TOKEN_REQUIRED", "Reset token is required"));
      }

      const result = await this.authService.resetPassword(resetToken, password);

      if (result.isSuccess) {
        res.status(200).json(ResponseData.success("Password reset successfully"));
      } else {
        if (result.code === 401) {
          res.status(401).json(ResponseData.error(401, "INVALID_TOKEN", "Reset token is invalid or expired"));
        } else {
          res.status(500).json(ResponseData.error(500, "INTERNAL_ERROR", "An error occurred while resetting password"));
        }
      }
  }
}

export default new AuthController();
