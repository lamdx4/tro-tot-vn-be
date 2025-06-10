import { CustomerService } from '@/services/customer.service'
import ResponseData from '@/utils/data-types/response'
import { NextFunction, Request, Response } from 'express'
import ChangedProfileDto from './dto/changed-profile.dto'
import { CursorPaging } from '@/utils/data-types/paging-response'
import { da } from '@faker-js/faker/.'
import moment from 'moment'

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
      console.log('updateMyProfile', req.file)
      const account = req.user
      const data = req.body as ChangedProfileDto
      data.avatarFile = req.file
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

  addRate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const customerId = Number(req.user?.customer.customerId)
      const postId = Number(req.params.postId)
      const numStart = Number(req.body.numStar)
      const comment = String(req.body.comment)
      const r = await this.customerService.addRate(customerId, postId, numStart, comment)
      if (r.isSuccess) {
        res.status(200).json(ResponseData.success(r.getValue()))
      } else {
        res.status(r.code).json(ResponseData.failure(r.code, r.error ?? '', ''))
      }
    } catch (e) {
      next(e)
    }
  }
  getRateFromPost = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const postId = Number(req.params.postId)
      const limit = Number(req.query.limit) || 10
      const cursor = req.query.cursor ? new Date(String(req.query.cursor)) : null
      console.log('cursor', cursor)
      const r = await this.customerService.getRateFromPost(postId, cursor, limit)
      if (r.isSuccess) {
        res
          .status(200)
          .json(
            ResponseData.success(
              new CursorPaging(
                r.getValue()!,
                r.getValue()!.length > 0 ? r.getValue()![r.getValue()!.length - 1].createdAt : null
              ).toResponse()
            )
          )
      } else {
        res.status(r.code).json(ResponseData.failure(r.code, r.error ?? '', ''))
      }
    } catch (e) {
      next(e)
    }
  }

  getMyRateOnPost = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const customerId = Number(req.user?.customer.customerId)
      const postId = Number(req.params.postId)
      const r = await this.customerService.getMyRateOnPost(customerId, postId)
      if (r.isSuccess) {
        res.status(200).json(ResponseData.success(r.getValue()))
      } else {
        res.status(r.code).json(ResponseData.failure(r.code, r.error ?? '', ''))
      }
    } catch (e) {
      next(e)
    }
  }

  delMyRateOnPost = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const customerId = Number(req.user?.customer.customerId)
      const postId = Number(req.params.postId)
      const r = await this.customerService.delMyRateOnPost(customerId, postId)
      if (r.isSuccess) {
        res.status(200).json(ResponseData.success(r.getValue()))
      } else {
        res.status(r.code).json(ResponseData.failure(r.code, r.error ?? '', ''))
      }
    } catch (e) {
      next(e)
    }
  }
  getAvgRateFromPost = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const postId = Number(req.params.postId)
      const r = await this.customerService.getAvgRateFromPost(postId)
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

  getSubscription = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const customerId = Number(req.user?.customer.customerId)
      const r = await this.customerService.getSubscription(customerId)
      if (r.isSuccess) {
        res.status(200).json(ResponseData.success(r.getValue()))
      } else {
        res.status(r.code).json(ResponseData.failure(r.code, r.error ?? '', ''))
      }
    } catch (e) {
      next(e)
    }
  }
  createSubscription = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const customerId = Number(req.user?.customer.customerId)
      const city = String(req.body.city)
      const district = String(req.body.district)

      const r = await this.customerService.createSubscription(customerId, city, district)
      if (r.isSuccess) {
        res.status(200).json(ResponseData.success(r.getValue()))
      } else {
        res.status(r.code).json(ResponseData.failure(r.code, r.error ?? '', ''))
      }
    } catch (e) {
      next(e)
    }
  }
  deleteSubscription = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const customerId = Number(req.user?.customer.customerId)
      const subscriptionId = Number(req.params.subscriptionId)
      const r = await this.customerService.deleteSubscription(customerId, subscriptionId)
      if (r.isSuccess) {
        res.status(200).json(ResponseData.success(r.getValue()))
      } else {
        res.status(r.code).json(ResponseData.failure(r.code, r.error ?? '', ''))
      }
    } catch (e) {
      next(e)
    }
  }
  getHistoryViewPost = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const customerId = Number(req.user?.customer.customerId)
      console.log('customerId', customerId)
      const r = await this.customerService.getViewedPost(customerId)
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
