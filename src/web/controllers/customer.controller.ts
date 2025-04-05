import { CustomerService } from '@/services/customer.service'
import ResponseData from '@/utils/data-types/response'
import { NextFunction, Request, Response } from 'express'
import ChangedProfileDto from './dto/changed-profile.dto'

class CustomerController {
  private customerService: CustomerService
  constructor() {
    this.customerService = new CustomerService()
  }

  getInformation = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const customerId = isNaN(Number(req.params.customerId)) ? null : Number(req.params.customerId)
      const r = await this.customerService.getCustomerProfile(customerId!)
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
      const r = await this.customerService.getMyProfile(account!.customer.customerId)
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
    try {
      const account = req.user
      const data = req.body as ChangedProfileDto 
      const customerId = Number(account?.customer.customerId)
      const r = await this.customerService.updateMyProfile(customerId, data)
      if (r.isSuccess) {
        res.status(200).json(ResponseData.success(r.getValue()))
      } else {
        res.status(r.code).json(ResponseData.failure(r.code, r.error ?? '', ''))
      }
    } catch (error) {
      next(error)
    }
  }

  createAppointment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const customerId = Number(req.user?.customer.customerId)
      const appointment = Number(req.body.postId)
      const appointmentAt = new Date(req.body.appointmentAt)
      console.log('appointment', appointment)
      const r = await this.customerService.createAppointment(customerId, appointment, appointmentAt)
      if (r.isSuccess) {
        res.status(200).json(ResponseData.success(r.getValue()))
      } else {
        res.status(r.code).json(ResponseData.failure(r.code, r.error ?? '', ''))
      }
    } catch (e) {
      next(e)
    }
  }

  getAppointments = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const customerId = Number(req.user?.customer.customerId)
      const r = await this.customerService.getAppointments(customerId)
      if (r.isSuccess) {
        res.status(200).json(ResponseData.success(r.getValue()))
      } else {
        res.status(r.code).json(ResponseData.failure(r.code, r.error ?? '', ''))
      }
    } catch (e) {
      next(e)
    }
  }

  savePost = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const postId = Number(req.body.postId)
      const customerId = Number(req.user?.customer.customerId)
      const r = await this.customerService.savePost(customerId, postId)
      if (r.isSuccess) {
        res.status(200).json(ResponseData.success(r.getValue()))
      } else {
        res.status(r.code).json(ResponseData.failure(r.code, r.error ?? '', ''))
      }
    } catch (e) {
      next(e)
    }
  }

  getSavedPost = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const customerId = Number(req.user?.customer.customerId)
      const r = await this.customerService.getSavedPost(customerId)
      if (r.isSuccess) {
        res.status(200).json(ResponseData.success(r.getValue()))
      } else {
        res.status(r.code).json(ResponseData.failure(r.code, r.error ?? '', ''))
      }
    } catch (e) {
      next(e)
    }
  }

  deleteSavedPost = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const customerId = Number(req.user?.customer.customerId)
      const postId = Number(req.body.postId)
      const r = await this.customerService.deleteSavedPost(customerId, postId)
      if (r.isSuccess) {
        res.status(200).json(ResponseData.success(r.getValue()))
      } else {
        res.status(r.code).json(ResponseData.failure(r.code, r.error ?? '', ''))
      }
    } catch (e) {
      next(e)
    }
  }
  
  getAllAppointments = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const customerId = Number(req.user?.customer.customerId)
      const r = await this.customerService.getAllAppointments(customerId)
      if (r.isSuccess) {
        res.status(200).json(ResponseData.success(r.getValue()))
      } else {
        res.status(r.code).json(ResponseData.failure(r.code, r.error ?? '', ''))
      }
    } catch (e) {
      next(e)
    }
  }
}
export default new CustomerController()
// tạo user - role -> gắn role cho user
// store func trigger các thứ
// backup restore ( từng phần hoặc toàn phần)
