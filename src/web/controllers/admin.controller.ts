import { PostRepository } from '@/infras/repositories'
import AdminService from '@/services/admin.service'
import ResponseData from '@/utils/data-types/response'
import { Request, Response, NextFunction } from 'express'

class AdminController {
  private adminService: AdminService

  constructor() {
    this.adminService = new AdminService() 
  }

  async reviewPost(req: Request, res: Response, next: NextFunction) {
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
  async moderatePost(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, message, postId } = req.body
      const result = await this.adminService.moderatePost(status, postId, message)
      if (result.isSuccess) {
        res.status(200).json(ResponseData.success(result.getValue()))
      } else if (result.code === 400) {
        res
          .status(400)
          .json(
            ResponseData.error(
              404,
              "Rejection reason is required when status is 'Reject'",
              "Rejection reason is required when status is 'Reject'"
            )
          )
      } else if (result.code === 404) {
        res
          .status(404)
          .json(
            ResponseData.error(
              404,
              'Post not found or status not changed',
              'The specified post was not found or the status was not changed'
            )
          )
      } else {
        res.status(500).json(ResponseData.error(500, 'Internal Server Error', 'An unexpected error occurred'))
      }
    } catch (error) {
      console.error('Error in resetPassword:', error)
      res.status(500).json(ResponseData.error(500, 'INTERNAL_ERROR', 'Something went wrong'))
    }
  }
    async moderateHistory(req: Request, res: Response, next: NextFunction) {
      try {
        const { id } = req.params; // 👈 Lấy đúng param tên 'id'
        const { accountId, actionType, reason } = req.body;
        console.log('reason', reason)

        const postId = Number(id);
  
        const result = await this.adminService.moderateHistory(Number(postId), accountId, actionType, reason)
        if (result.isSuccess) {
          res.status(200).json(ResponseData.success(result.getValue()))
        } else if (result.code === 404) {
          res
            .status(404)
            .json(ResponseData.error(404, 'Post not found or status not changed', 'The specified post was not found'))
        } else {
          res.status(500).json(ResponseData.error(500, 'Internal Server Error', 'An unexpected error occurred'))
        }
      } catch (error) {
        console.error('Error in resetPassword:', error)
        res.status(500).json(ResponseData.error(500, 'INTERNAL_ERROR', 'Something went wrong'))
      }
    }
  async getHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params
      const postId = Number(id);

      const result = await this.adminService.getHistory(postId)
      if (result.isSuccess) {
        res.status(200).json(ResponseData.success(result.getValue()))
      } else if (result.code === 404) {
        res
          .status(404)
          .json(ResponseData.error(404, 'Post not found or status not changed', 'The specified post was not found'))
      } else {
        res.status(500).json(ResponseData.error(500, 'Internal Server Error', 'An unexpected error occurred'))
      }
    } catch (error) {
      console.error('Error in resetPassword:', error)
      res.status(500).json(ResponseData.error(500, 'INTERNAL_ERROR', 'Something went wrong'))
    }
  }
}
export default new AdminController()
