import { PostRepository } from '@/infras/repositories'
import AdminService from '@/services/admin.service'
import { ConfigService } from '@/services/config.service'
import ResponseData from '@/utils/data-types/response'
import { tr } from '@faker-js/faker/.'
import { Request, Response, NextFunction } from 'express'

class AdminController {
  private adminService: AdminService

  constructor() {
    this.adminService = new AdminService()
  }

  resetPasswordOfModerator = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const newPassword = String(req.body.newPassword)
      console.log('newPassword', newPassword)
      const moderatorId = Number(req.params.moderatorId)
      console.log('moderatorId', moderatorId)
      const result = await this.adminService.resetPasswordOfModerator(newPassword, moderatorId)
      if (result.isSuccess) {
        res.status(200).json(ResponseData.success(result.getValue()))
      } else if (result.code === 404) {
        res.status(404).json(ResponseData.error(404, 'User not found', 'User not found'))
      } else {
        res.status(500).json(ResponseData.error(500, 'Internal Server Error', 'An unexpected error occurred'))
      }
    } catch (error) {
      next(error)
    }
  }

  //DONE
  async getReviewPost(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.adminService.listPostPending()
      if (result.isSuccess) {
        res.status(200).json(ResponseData.success(result.getValue()))
      } else if (result.code === 404) {
        res.status(404).json(ResponseData.error(404, 'No pending posts found', 'No pending posts found'))
      } else {
        res.status(500).json(ResponseData.error(500, 'Internal Server Error', 'An unexpected error occurred'))
      }
    } catch (error) {
      console.error('Error in resetPassword:', error)
      res.status(500).json(ResponseData.error(500, 'INTERNAL_ERROR', 'Something went wrong'))
    }
  }

  //DONE
  async moderatePost(req: Request, res: Response, next: NextFunction) {
    try {
      const actionType = String(req.body.actionType)
      const postId = Number(req.params.postId)
      const reason = String(req.body.reason)
      const reviewerId = Number(req.user?.admin.adminId)

      const result = await this.adminService.moderatePost(reviewerId, actionType, postId, reason)
      if (result.isSuccess) {
        res.status(200).json(ResponseData.success(result.getValue()))
      } else {
        res
          .status(result.code)
          .json(
            ResponseData.error(
              result.code,
              result.error ?? 'NOT_DEFINE_ERROR',
              result.error ?? 'An unexpected error occurred'
            )
          )
      }
    } catch (error) {
      next(error)
    }
  }

  //DONE
  async getHistoryOfPost(req: Request, res: Response, next: NextFunction) {
    try {
      const postId = Number(req.params.postId)
      const result = await this.adminService.getHistoryOfPost(postId)
      if (result.isSuccess) {
        res.status(200).json(ResponseData.success(result.getValue()))
      } else
        res
          .status(result.code)
          .json(
            ResponseData.error(
              result.code,
              result.error ?? 'NOT_DEFINE_ERROR',
              result.error ?? 'An unexpected error occurred'
            )
          )
    } catch (error) {
      next(error)
    }
  }

  //DONE
  async getHistoryByModeratorId(req: Request, res: Response, next: NextFunction) {
    try {
      const moderatorId = Number(req.params.moderatorId)
      const result = await this.adminService.getHistoryByModeratorId(moderatorId)
      if (result.isSuccess) {
        res.status(200).json(ResponseData.success(result.getValue()))
      } else {
        res
          .status(result.code)
          .json(
            ResponseData.error(
              result.code,
              result.error ?? 'NOT_DEFINE_ERROR',
              result.error ?? 'An unexpected error occurred'
            )
          )
      }
    } catch (error) {
      next(error)
    }
  }

  //DONE
  async getModerators(req: Request, res: Response, next: NextFunction) {
    try {
      const key = req.query.key ? String(req.query.key) : null
      const result = await this.adminService.getModeratorsService(key)
      if (result.isSuccess) {
        res.status(200).json(ResponseData.success(result.getValue()))
      } else {
        res
          .status(result.code)
          .json(
            ResponseData.error(
              result.code,
              result.error ?? 'NOT_DEFINE_ERROR',
              result.error ?? 'An unexpected error occurred'
            )
          )
      }
    } catch (error) {
      next(error)
    }
  }

  //DONE
  async addModerator(req: Request, res: Response, next: NextFunction) {
    try {
      const { firstName, lastName, email, phone, gender, birthday, password } = req.body
      console.log('req.body', req.body)
      const result = await this.adminService.addModeratorsService(
        firstName,
        lastName,
        email,
        phone,
        gender,
        birthday,
        password
      )
      if (result.isSuccess) {
        res.status(200).json(ResponseData.success(result.getValue()))
      } else if (result.code === 400) {
        res.status(400).json(ResponseData.error(400, 'Email or phone already exists', 'Email or phone already exists'))
      } else if (result.code === 404) {
        res.status(404).json(ResponseData.error(404, 'User not found', 'User not found'))
      } else {
        res.status(500).json(ResponseData.error(500, 'Internal Server Error', 'An unexpected error occurred'))
      }
    } catch (error) {
      console.error('Error in resetPassword:', error)
      res.status(500).json(ResponseData.error(500, 'INTERNAL_ERROR', 'Something went wrong'))
    }
  }

  // DONE
  async setModeratorStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const status = String(req.body.status)
      console.log('status', status)
      console.log('req.params', req.params)
      const moderatorId = Number(req.params.moderatorId)
      const result = await this.adminService.updateModeratorService(status, moderatorId)
      if (result.isSuccess) {
        res.status(200).json(ResponseData.success(result.getValue()))
      } else if (result.code === 404) {
        res.status(404).json(ResponseData.error(404, 'User not found', 'User not found'))
      } else {
        res.status(500).json(ResponseData.error(500, 'Internal Server Error', 'An unexpected error occurred'))
      }
    } catch (error) {
      console.error('Error in resetPassword:', error)
      res.status(500).json(ResponseData.error(500, 'INTERNAL_ERROR', 'Something went wrong'))
    }
  }

  //DONE
  async getProfileModerator(req: Request, res: Response, next: NextFunction) {
    try {
      const adminId = Number(req.params.moderatorId)
      console.log('adminId', adminId)
      const result = await this.adminService.getProfileModeratorService(adminId)
      if (result.isSuccess) {
        res.status(200).json(ResponseData.success(result.getValue()))
      } else if (result.code === 404) {
        res.status(404).json(ResponseData.error(404, 'MODERATOR_NOT_FOUND', 'User not found'))
      } else {
        res.status(500).json(ResponseData.error(500, 'Internal Server Error', 'An unexpected error occurred'))
      }
    } catch (error) {
      console.error('Error in resetPassword:', error)
      res.status(500).json(ResponseData.error(500, 'INTERNAL_ERROR', 'Something went wrong'))
    }
  }

  //DONE
  async getMyProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const adminId = Number(req.user?.admin.adminId)
      console.log(req.user)
      const result = await this.adminService.getMyProfileService(adminId)
      if (result.isSuccess) {
        res.status(200).json(ResponseData.success(result.getValue()))
      } else if (result.code === 404) {
        res.status(404).json(ResponseData.error(404, 'User not found', 'User not found'))
      } else {
        res.status(500).json(ResponseData.error(500, 'Internal Server Error', 'An unexpected error occurred'))
      }
    } catch (error) {
      console.error('Error in resetPassword:', error)
      res.status(500).json(ResponseData.error(500, 'INTERNAL_ERROR', 'Something went wrong'))
    }
  }

  async updateMyProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const accountId = Number(req.user?.admin.accountId)
      const gender = req.body.gender ? String(req.body.gender) : undefined
      const birthday = req.body.birthday ? String(req.body.birthday) : undefined
      const firstName = req.body.firstName ? String(req.body.firstName) : undefined
      const lastName = req.body.lastName ? String(req.body.lastName) : undefined
      const phone = req.body.phone ? String(req.body.phone) : undefined
      const email = req.body.email ? String(req.body.email) : undefined

      const result = await this.adminService.updateMyProfileService(
        accountId,
        phone,
        email,
        gender,
        birthday,
        firstName,
        lastName
      )
      if (result.isSuccess) {
        res.status(200).json(ResponseData.success(result.getValue()))
      } else if (result.code === 404) {
        res.status(404).json(ResponseData.error(404, 'User not found', 'User not found'))
      } else if (result.code === 400) {
        res.status(400).json(ResponseData.error(400, 'Email or phone already exists', 'Email or phone already exists'))
      } else if (result.code === 200 && result.getValue() === 'No changes detected') {
        res.status(200).json(ResponseData.success('No changes detected'))
      } else {
        res.status(500).json(ResponseData.error(500, 'Internal Server Error', 'An unexpected error occurred'))
      }
    } catch (error) {
      console.error('Error in resetPassword:', error)
      res.status(500).json(ResponseData.error(500, 'INTERNAL_ERROR', 'Something went wrong'))
    }
  }
  getStatistics = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.adminService.getStatisticsForDashBoard()
      if (result.isSuccess) {
        res.status(200).json(ResponseData.success(result.getValue()))
      } else {
        res
          .status(result.code)
          .json(
            ResponseData.error(
              result.code,
              result.error ?? 'NOT_DEFINE_ERROR',
              result.error ?? 'An unexpected error occurred'
            )
          )
      }
    } catch (error) {
      next(error)
    }
  }
}
export default new AdminController()
