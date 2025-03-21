import ResponseData from '@/utils/data-types/response';
import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

export const validateRequest = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json(new ResponseData(400, "Invalid Request", errors.array())); // Gửi response khi có lỗi
    return; // Kết thúc hàm để không bị lỗi TypeScript
  }
  next(); // Nếu hợp lệ, tiếp tục middleware tiếp theo
};
