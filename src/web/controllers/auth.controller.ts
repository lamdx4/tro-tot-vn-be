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

      if (result.isSuccess) {
        return res.status(200).json(ResponseData.success(result.getValue()));
      }else if (result.code === 404) {
        return res.status(404).json(ResponseData.error(404, "USER_NOT_FOUND", "User with this email does not exist"));
      }else if (result.code === 429) {
        return res.status(429).json(ResponseData.error(429, "EMAIL_EXIST", result.error ?? "Unknown error")); // Trả về số giây còn lại
      }else{
        return res.status(500).json(ResponseData.error(500, "INTERNAL_ERROR", "An error occurred while sending OTP")); 
      }
    } catch (error) {
      console.error("Error in forgotPassword:", error);
      return res.status(500).json(ResponseData.error(500, "INTERNAL_ERROR", "Something went wrong"));
    }
  }

  async verifyOtp(req: Request, res: Response, next: NextFunction) {
    
    try {
      const { email, otp } = req.body;
      const result = await this.authService.verifyOtp(email, otp);

      if (result.isSuccess) {
        return res.status(200).json(ResponseData.success(result.getValue()));
      }

      if (result.code === 400) {
        return res.status(400).json(ResponseData.error(400, "INVALID_OTP", "OTP is incorrect or expired"));
      }

      return res.status(500).json(ResponseData.error(500, "INTERNAL_ERROR", "An error occurred while verifying OTP"));
    } catch (error) {
      console.error("Error in verifyOtp:", error);
      return res.status(500).json(ResponseData.error(500, "INTERNAL_ERROR", "Something went wrong"));
    }
    }
    

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { password, resetToken } = req.body;

      if (!resetToken) {
        return res.status(400).json(ResponseData.error(400, "TOKEN_REQUIRED", "Reset token is required"));
      }

      const result = await this.authService.resetPassword(resetToken, password);

      if (result.isSuccess) {
        return res.status(200).json(ResponseData.success("Password reset successfully"));
      }

      if (result.code === 401) {
        return res.status(401).json(ResponseData.error(401, "INVALID_TOKEN", "Reset token is invalid or expired"));
      }

      return res.status(500).json(ResponseData.error(500, "INTERNAL_ERROR", "An error occurred while resetting password"));
    } catch (error) {
      console.error("Error in resetPassword:", error);
      return res.status(500).json(ResponseData.error(500, "INTERNAL_ERROR", "Something went wrong"));
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
