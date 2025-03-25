import deleteFileFromDisk from '@/utils/func/delete-file'
import { NextFunction, Request, Response } from 'express'
import * as fs from 'fs'

class PostController {
  createPost = async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log(req.body)
      const files = req.files as { imgs: Express.Multer.File[]; video: Express.Multer.File[] }
      console.log(files)
      res.json({ message: 'Create post successfully' })
    } catch (e) {
      next(e)
    } finally {
      deleteFileFromDisk(req.files as any)
    }
  }
}
export default new PostController()
