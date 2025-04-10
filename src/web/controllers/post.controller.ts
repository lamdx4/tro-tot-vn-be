import PostService from '@/services/post.service'
import ResponseData from '@/utils/data-types/response'
import { deleteFileFromDisk, deleteFileFromDisk2 } from '@/utils/func/delete-file'
import { NextFunction, Request, Response } from 'express'
import { validationResult } from 'express-validator'
import { CreatePostDto } from './dto/create-post.dto'
import { CursorPaging } from '@/utils/data-types/paging-response'
import { UpdatePostDto } from './dto/update-post.dto'

class PostController {
  private postService: PostService
  constructor() {
    this.postService = new PostService()
  }

  editPost = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        res.status(400).json(new ResponseData(400, 'Invalid Request', errors.array()))
        return
      }
      const dto = req.body as UpdatePostDto
      dto.oldFiles = JSON.parse(req.body.oldFiles) as Array<number>
      const files = req.files as { newImgs: Express.Multer.File[]; newVideo: Express.Multer.File[] }
      let r = await this.postService.editPost(
        req.user?.customer!.customerId!,
        Number(req.params.postId),
        dto,
        files.newImgs,
        files.newVideo[0]
      )
      if (r.isSuccess) {
        res.status(200).json(new ResponseData(200, 'Upload successfully'))
      } else {
        res.status(r.code).json(new ResponseData(r.code, r.error ?? ''))
      }
    } catch (e) {
      next(e)
    } finally {
      deleteFileFromDisk2(req.files as any)
    }
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
      let r = await this.postService.getPostDetail(Number(req.params.postId), req.headers['authorization'])
      if (r.isSuccess) {
        res.status(200).json(ResponseData.success(r.getValue()))
      } else {
        res.status(r.code).json(new ResponseData(r.code, r.error ?? ''))
      }
    } catch (e) {
      next(e)
    }
  }

  getDetailMyPost = async (req: Request, res: Response, next: NextFunction) => {
    try {
      let r = await this.postService.getDetailMyPost(Number(req.params.postId), req.user?.customer!.customerId!)
      if (r.isSuccess) {
        res.status(200).json(ResponseData.success(r.getValue()))
      } else {
        res.status(r.code).json(new ResponseData(r.code, r.error ?? ''))
      }
    } catch (e) {
      next(e)
    }
  }

  getLastPost = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const limit = Number(req.query.limit) || 4
      const r = await this.postService.getLastPost(limit)
      if (r.isSuccess) {
        res.status(200).json(ResponseData.success(r.getValue()))
      } else {
        res.status(r.code).json(new ResponseData(r.code, r.error ?? ''))
      }
    } catch (e) {
      next(e)
    }
  }

  hideMyPost = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const postId = Number(req.body.postId)
      const customerId = Number(req.user?.customer.customerId)
      console.log('postId', postId)
      console.log('customerId', customerId)
      let r = await this.postService.hidePost(postId, customerId)
      if (r.isSuccess) {
        res.status(200).json(ResponseData.success(r.getValue()))
      } else {
        res.status(r.code).json(new ResponseData(r.code, r.error ?? ''))
      }
    } catch (e) {}
  }

  unHideMyPost = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const postId = Number(req.body.postId)
      const customerId = Number(req.user?.customer.customerId)
      let r = await this.postService.unHidePost(postId, customerId)
      if (r.isSuccess) {
        res.status(200).json(ResponseData.success(r.getValue()))
      } else {
        res.status(r.code).json(new ResponseData(r.code, r.error ?? ''))
      }
    } catch (e) {}
  }

  searchPost = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const keyword = String(req.query.keyword)
      const city = String(req.query.city)
      const district = String(req.query.district)
      const ward = String(req.query.ward)
      const acreage = req.query.acreage
        ? String(req.query.acreage)
            .split('-')
            .map((val: string) => Number(val))
        : null
      const price = req.query.price
        ? String(req.query.price)
            .split('-')
            .map((val: string) => Number(val))
        : null
      const interiorCondition = String(req.query.interiorCondition)
      const limit = Number(req.query.limit) || 4
      const cursor = isNaN(Number(req.query.cursor)) ? null : Number(req.query.cursor)
      const r = await this.postService.searchPost(
        keyword,
        city,
        district,
        ward,
        interiorCondition,
        acreage,
        price,
        cursor,
        limit
      )
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
