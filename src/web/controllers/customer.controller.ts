import { Account } from './../../domains/entities/account.entity';
import { CustomerService } from '@/services/customer.service'
import ResponseData from '@/utils/data-types/response'
import { NextFunction, Request, Response } from 'express'

class CustomerController {
  private userService: CustomerService
  constructor() {
    this.userService = new CustomerService()
  }

  getInformation = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const customerId = isNaN(Number(req.query.customerId)) ? null : Number(req.query.customerId)
      if (!customerId) {
        res.status(400).json(ResponseData.failure(400, 'MISSING_CUSTOMER_ID', 'Missing customer id'))
      }
      const r = await this.userService.getCustomerProfile(customerId!)
      if (r.isSuccess) {
        res.status(200).json(ResponseData.success(r.getValue()))
      } else {
        res.status(r.code).json(r.error)
      }
    } catch (error) {
      next(error)
      console.log(error)
    }
  }

  getMyProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const account = req.user
      const r = await this.userService.getMyProfile(account!.accountId)
      if (r.isSuccess) {
        res.status(200).json(ResponseData.success(r.getValue()))
      } else {
        res.status(r.code).json(r.error)
      }
    } catch (error) {
      next(error)
      console.log(error)
    }
  }

  updateMyProfile = async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user
  }

  getCustomerProfile = async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user
  }
  receivePost = async (req: Request, res: Response, next: NextFunction) => {
    const {customerId, ward, district, city} = req.body;
    const result = await this.userService.receivePost(customerId, ward, district, city);
    if (result.isSuccess) {
      res.status(200).json(ResponseData.success(result.getValue()))
    } else if (result.code == 404) {
      res.status(404).json(ResponseData.error(404, 'USER_NOT_FOUND', 'User with this email does not exist'))
    } else if (result.code == 409) {
      res.status(409).json(ResponseData.error(409, 'CUSTOMER_HAS_SUBSCRIPTION', 'Customers have signed up to receive news'))
    } else {
      res.status(500).json(ResponseData.error(500, 'INTERNAL_ERROR', 'An error occurred while sending OTP'))
    }
  }
}
export default new CustomerController()
