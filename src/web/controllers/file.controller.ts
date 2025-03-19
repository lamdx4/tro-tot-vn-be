import CloudDriveService from '@/services/google-drive.service'
import ResponseData from '@/utils/response'
import { NextFunction, Request, Response } from 'express'

class FileController {
  private cloud = CloudDriveService.gI()

  async getFile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const examples = await this.cloud.downloadFileToStream(req.params.fileId)
      if (!examples) {
        res.status(404).json(ResponseData.error(404, 'File not found', ''))
        return
      }
      res.setHeader('Content-Type', examples.metaData ?? 'application/octet-stream')
      examples.data.pipe(res)
    } catch (e) {
      next(e)
    }
  }
}
export default new FileController()
