import multer, { StorageEngine } from 'multer'
import { Request, Response, NextFunction } from 'express'
import ResponseData from '@/utils/data-types/response'

// Cấu hình lưu trữ file
const storage: StorageEngine = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`)
  }
})

// Cấu hình multer
const upload = multer({
  storage
}).fields([
  { name: 'video', maxCount: 1 },
  { name: 'imgs', maxCount: 12 }
])

const uploadMiddleware = (req: Request, res: Response, next: NextFunction) => {
  upload(req, res, (err) => {
    try {
      if (err) {
        res.status(400).json(new ResponseData(400, err.message))
        return
      }

      const files = req.files as { [fieldname: string]: Express.Multer.File[] }
      // Kiểm tra dung lượng file
      if (!files) {
        res.status(400).json(new ResponseData(400, `File không tồn tại.`))
        return
      }
      if (files.video) {
        const video = files.video[0]
        if (video.size > 25 * 1024 * 1024) {
          res.status(400).json(new ResponseData(400, `Video vượt quá 25MB.`))
          return
        }
      } else files.video = []

      if (files.imgs) {
        for (const img of files.imgs) {
          if (img.size > 5 * 1024 * 1024) {
            res.status(400).json(new ResponseData(400, `Ảnh vượt quá 5MB.`))
            return
          }
        }
      } else files.img = []
      next()
    } catch (e) {
      next(e)
    }
  })
}

export default uploadMiddleware
