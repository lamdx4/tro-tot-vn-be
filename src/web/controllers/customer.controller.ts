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
}
export default new CustomerController()
