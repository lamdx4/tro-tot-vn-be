import PostService from '@/services/post.service'
import ResponseData from '@/utils/data-types/response'
import deleteFileFromDisk from '@/utils/func/delete-file'
import { NextFunction, Request, Response } from 'express'
import { validationResult } from 'express-validator'
import { CreatePostDto } from './dto/create-post.dto'

class PostController {
  private postService: PostService
  constructor() {
    this.postService = new PostService()
  }
  createPost = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        res.status(400).json(new ResponseData(400, 'Invalid Request', errors.array()))
        return
      }
      const dto = req.body as CreatePostDto
      const files = req.files as { imgs: Express.Multer.File[]; video: Express.Multer.File[] }
      let r = await this.postService.createPost(req.user?.customer!, dto, files.imgs, files.video[0])
      if (r.isSuccess) {
        res.status(200).json(new ResponseData(200, 'Upload successfully'))
      } else {
        res.status(r.code).json(new ResponseData(r.code, r.error ?? ''))
      }
    } catch (e) {
      next(e)
    } finally {
      deleteFileFromDisk(req.files as any)
    }
  }
}
export default new PostController()
