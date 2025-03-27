import { PostRepository } from '@/infras/repositories';
import AdminService from '@/services/admin.service';
import ResponseData from '@/utils/data-types/response';
import { Request, Response, NextFunction } from 'express'

class AdminController {
    private adminService: AdminService;

    constructor() {
        const postRepository = new PostRepository(); // Khởi tạo repository
        this.adminService = new AdminService(postRepository); // Truyền vào AdminService
    }

    
    async reviewPost(req: Request, res: Response, next: NextFunction){
        try {
            const result = await this.adminService.ListPostPending()
            if(result.isSuccess){
                res.status(200).json(ResponseData.success(result.getValue()))
            }else if(result.code === 404){
                res.status(404).json(ResponseData.error(404, "No pending posts found", "No pending posts found"))
            }else{
                res.status(500).json(ResponseData.error(500, "Internal Server Error", "An unexpected error occurred")) 
            }
        } catch (error) {
            console.error('Error in resetPassword:', error)
            res.status(500).json(ResponseData.error(500, 'INTERNAL_ERROR', 'Something went wrong'))
        }
    }
    async changStatusPost(req: Request, res: Response, next: NextFunction){
        try { 
            const {status, message, postId} = req.body;
            const result = await this.adminService.changStatusService(status, postId, message)
            if(result.isSuccess){
                res.status(200).json(ResponseData.success((await result).getValue()))
            }else if(result.code === 400){
                res.status(400).json(ResponseData.error(404, "Rejection reason is required when status is 'Reject'", "Rejection reason is required when status is 'Reject'"))
            }else if(result.code === 404){
                res.status(404).json(ResponseData.error(404, "Post not found or status not changed", "The specified post was not found or the status was not changed"))
            }else{
                res.status(500).json(ResponseData.error(500, "Internal Server Error", "An unexpected error occurred")) 
            }
        } catch (error) {
            console.error('Error in resetPassword:', error)
            res.status(500).json(ResponseData.error(500, 'INTERNAL_ERROR', 'Something went wrong'))
        }
    }
}
export default new AdminController()