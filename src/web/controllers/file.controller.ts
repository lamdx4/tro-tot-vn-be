import FileService from '@/services/file.service'
import CloudDriveService from '@/services/google-drive.service'
import ResponseData from '@/utils/data-types/response'
import { NextFunction, Request, Response } from 'express'

class FileController {
  private fileService: FileService
  constructor() {
    this.fileService = new FileService()
  }
  async getFile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const r = await this.fileService.getFile(Number(req.params.fileId))
      if (r.isSuccess) {
        res.setHeader('Content-Type', r.getValue()!.metaData ?? 'application/octet-stream')
        r.getValue()!.data.pipe(res)
        return
      }
      if (r.code === 404) {
        res.status(404).json(ResponseData.error(404, 'File not found', ''))
        return
      }
      if (!r) {
        res.status(404).json(ResponseData.error(404, 'File not found', ''))
        return
      }
      res.status(r.code).json(ResponseData.error(r.code, r.error ?? '', ''))
    } catch (e) {
      next(e)
    }
  }
}
export default new FileController()
