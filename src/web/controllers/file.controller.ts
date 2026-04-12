import { 
  Get, 
  Route, 
  Tags, 
  Path, 
  Controller,
  Request,
  Produces
} from '@tsoa/runtime'
import FileService from '@/services/file.service'
import { Response as ExpressResponse } from 'express'

@Route("files")
@Tags("Multimedia")
export class MultimediaController extends Controller {
  private fileService = new FileService()

  constructor() {
    super()
  }

  /**
   * Get a file by ID.
   * Serves the file as a stream with the correct Content-Type.
   */
  @Get("{fileId}")
  @Produces("image/*")
  public async getFile(
    @Path() fileId: number,
    @Request() req: any
  ): Promise<void> {
    const res = req.res as ExpressResponse
    try {
      const r = await this.fileService.getFile(fileId)
      if (r.isSuccess) {
        res.setHeader('Content-Type', r.getValue()!.metaData ?? 'application/octet-stream')
        r.getValue()!.data.pipe(res)
        return
      }
      
      this.setStatus(r.code)
      res.status(r.code).json({
        success: false,
        message: r.error || 'File not found'
      })
    } catch (error: any) {
      this.setStatus(500)
      res.status(500).json({
        success: false,
        message: error.message || 'Internal server error'
      })
    }
  }
}
