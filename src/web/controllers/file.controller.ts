import { 
  Get, 
  Route, 
  Tags, 
  Path, 
  Controller,
  Request,
  Produces,
  Response
} from '@tsoa/runtime'
import FileService from '@/services/file.service'
import { Response as ExpressResponse } from 'express'
import ResponseData from '@/utils/data-types/response'

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
  @Response(404, "File Not Found")
  @Response(500, "Internal Server Error")
  public async getFile(
    @Path() fileId: number,
    @Request() req: any
  ): Promise<void> {
    const res = req.res as ExpressResponse
    try {
      const r = await this.fileService.getFile(fileId)
      if (r.isSuccess) {
        const streamData = r.getValue()!
        res.setHeader('Content-Type', streamData.metaData ?? 'application/octet-stream')
        
        await new Promise<void>((resolve, reject) => {
          streamData.data.pipe(res)
          streamData.data.on('end', () => {
            res.end()
            resolve()
          })
          streamData.data.on('error', (err: any) => {
            reject(err)
          })
        })
        return
      }
      
      if (r.code === 404) {
        this.setStatus(404)
        res.status(404).json(ResponseData.notFound('File not found'))
        return
      }

      this.setStatus(r.code)
      res.status(r.code).json(ResponseData.error(r.code, r.error ?? '', ''))
    } catch (error: any) {
      this.setStatus(500)
      res.status(500).json(ResponseData.error(500, 'Internal Server Error', error.message))
    }
  }
}
