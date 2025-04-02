import PostService from '@/services/post.service'
import ResponseData from '@/utils/data-types/response'
import deleteFileFromDisk from '@/utils/func/delete-file'
import { NextFunction, Request, Response } from 'express'
import { validationResult } from 'express-validator'
import { CreatePostDto } from './dto/create-post.dto'
import { CursorPaging } from '@/utils/data-types/paging-response'

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

  getMyPosts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      let r = await this.postService.getPosts(
        req.user?.customer!,
        req.query.status as string,
        isNaN(Number(req.query.cursor)) ? 0 : Number(req.query.cursor),
        Number(req.query.limit)
      )
      if (r.isSuccess) {
        res
          .status(200)
          .json(
            ResponseData.success(
              new CursorPaging(
                r.getValue()!,
                r.getValue()!.length > 0 ? r.getValue()![r.getValue()!.length - 1].postId : null
              ).toResponse()
            )
          )
      } else {
        res.status(r.code).json(new ResponseData(r.code, r.error ?? ''))
      }
    } catch (e) {
      next(e)
    }
  }

  getDetailPost = async (req: Request, res: Response, next: NextFunction) => {
    try {
      let r = await this.postService.getPostDetail(Number(req.params.postId))
      if (r.isSuccess) {
        res.status(200).json(ResponseData.success(r.getValue()))
      } else {
        res.status(r.code).json(new ResponseData(r.code, r.error ?? ''))
      }
    } catch (e) {
      next(e)
    }
  }
}
export default new PostController()
