import { MultimediaFileRepository } from '@/infras/repositories'
import { Result } from '@/utils/data-types/result'
import CloudDriveService from './google-drive.service'

export default class FileService {
  private multiMediaFile: MultimediaFileRepository
  private ggloudService: CloudDriveService
  constructor() {
    this.multiMediaFile = new MultimediaFileRepository()
    this.ggloudService = CloudDriveService.gI()
  }

  async getFile(fileId: number) {
    const fileIdInCloud = await this.multiMediaFile.findOneBy({
      fileId: fileId
    })
    if (!fileIdInCloud) {
      return Result.fail(404, 'FILE_NOT_FOUND')
    }
    const file = await this.ggloudService.downloadFileToStream(fileIdInCloud.fileCloudId)
    if (!file) {
      return Result.fail(404, 'FILE_NOT_FOUND')
    }
    return Result.ok(file)
  }
}
