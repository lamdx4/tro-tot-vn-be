import { drive_v3, google } from 'googleapis'
import { PassThrough, Readable } from 'stream'
import { ConfigService } from './config.service'
import path from 'path'
import fs, { createReadStream } from 'fs'

export interface FileDataDrive {
  data: Readable
  metaData: string | null
}

/**
 * CloudDrive handles interactions with Google Drive,
 * such as copying, retrieving URLs, deleting, and uploading files.
 */
export default class CloudDriveService {
  public static instance: CloudDriveService
  private drive: drive_v3.Drive

  private constructor() {
    const configService = ConfigService.gI()
    const auth = new google.auth.OAuth2(
      configService.getOrThrow('DRIVE_CLIENT_ID'),
      configService.getOrThrow('DRIVE_SECRET_ID'),
      configService.getOrThrow('REDIRECT_URI')
    )
    auth.setCredentials({
      refresh_token: configService.getOrThrow('REFRESH_TOKEN_DRIVE')
    })
    this.drive = google.drive({
      version: 'v3',
      auth: auth
    })
  }

  async downloadFileToStream(fileId: string): Promise<FileDataDrive | null> {
    try {
      const metadataRes = await this.drive.files.get({
        fileId,
        fields: 'mimeType'
      })
      metadataRes.data.mimeType
      const response = await this.drive.files.get(
        { fileId, alt: 'media', fields: 'id, mimeType' },
        { responseType: 'stream' }
      )
      return {
        data: response.data,
        metaData: metadataRes.data.mimeType ?? null
      }
    } catch (err) {
      console.error('Error downloading file:', err)
      return null
    }
  }

  /**
   * Copies a file on Drive and returns the public webContentLink.
   * @param idFile The id of the file to copy.
   */
  async copyFile(idFile: string): Promise<string | null> {
    try {
      const res = await this.drive.files.copy({
        fileId: idFile,
        fields: 'webContentLink'
      })
      if (res.data.id) return res.data.id
    } catch (err) {
      console.error('Error copying file:', err)
      return null
    }
    return null
  }

  /**
   * Retrieves a file's public URL from Google Drive.
   * @param idFile The id of the file.
   */
  async getUrlFile(idFile: string): Promise<string | null | undefined> {
    try {
      const res = await this.drive.files.get({
        fileId: idFile,
        fields: 'webContentLink'
      })
      return res.data.webContentLink
    } catch (err) {
      console.error('Error retrieving file URL:', err)
      return null
    }
  }

  /**
   * Get public download URL for a file
   */
  async getFileUrl(fileId: string): Promise<string | null> {
    const url = await this.getUrlFile(fileId)
    return url ?? null
  }

  /**
   * Deletes a file from Google Drive.
   * @param id The id of the file to delete.
   */
  async delete(id: string): Promise<boolean> {
    try {
      await this.drive.files.delete({
        fileId: id
      })
      return true
    } catch (err) {
      console.error('Error deleting file:', err)
      return false
    }
  }

  /**
   * Uploads a file to Google Drive.
   * Automatically sets permissions to allow anyone write access
   * and retrieves a public webViewLink.
   * @param buff The file content as a Buffer or Readable stream.
   */
  async uploadFile(file: Express.Multer.File): Promise<string | null> {
    try {
      if (!file.path && !file.buffer) {
        console.error('[GoogleDriveService] File object is invalid: no path or buffer found')
        return null
      }

      let mediaBody: Readable
      if (file.path) {
        const filePath = path.resolve(file.path)
        console.log(`[GoogleDriveService] Attempting to upload from path: ${filePath}`)
        
        if (fs.existsSync(filePath)) {
          mediaBody = createReadStream(filePath)
        } else {
          console.error(`[GoogleDriveService] File NOT found at path: ${filePath}. Current directory: ${process.cwd()}`)
          // Fallback to buffer only if path exists but file is missing (unlikely but safe)
          if (file.buffer) {
            console.log('[GoogleDriveService] Falling back to buffer because file at path was missing')
            mediaBody = Readable.from(file.buffer)
          } else {
            return null
          }
        }
      } else {
        console.log('[GoogleDriveService] No path found, uploading directly from buffer')
        mediaBody = Readable.from(file.buffer)
      }

      const createResponse = await this.drive.files.create({
        requestBody: { name: file.originalname, mimeType: file.mimetype },
        media: { body: mediaBody, mimeType: file.mimetype }
      })

      const fileId = createResponse.data.id
      if (!fileId) {
        throw new Error('Failed to create file on Google Drive')
      }
      // Set file permissions for public access
      await this.drive.permissions.create({
        fileId,
        requestBody: {
          role: 'writer',
          type: 'anyone'
        }
      })
      // Retrieve public webViewLink
      await this.drive.files.get({
        fileId,
        fields: 'webViewLink'
      })
      return fileId
    } catch (err) {
      console.error('Error uploading file:', err)
      return null
    }
  }

  async uploadFiles(files: Express.Multer.File[]): Promise<
    | {
      fileId: string
      fileType: string
    }[]
    | null
  > {
    console.log('Uploading files:', files)
    const listId = []
    try {
      for (const file of files) {
        let mediaBody: Readable

        if (file.path) {
          const filePath = path.resolve(file.path)
          if (fs.existsSync(filePath)) {
            mediaBody = createReadStream(filePath)
          } else if (file.buffer) {
            mediaBody = Readable.from(file.buffer)
          } else {
            continue
          }
        } else if (file.buffer) {
          mediaBody = Readable.from(file.buffer)
        } else {
          continue
        }

        const createResponse = await this.drive.files.create({
          requestBody: { name: file.originalname, mimeType: file.mimetype },
          media: { body: mediaBody, mimeType: file.mimetype }
        })

        const fileId = createResponse.data.id
        if (!fileId) {
          throw new Error('Failed to create file on Google Drive')
        }
        // Set file permissions for public access
        await this.drive.permissions.create({
          fileId,
          requestBody: {
            role: 'writer',
            type: 'anyone'
          }
        })
        // Retrieve public webViewLink
        await this.drive.files.get({
          fileId,
          fields: 'webViewLink'
        })
        listId.push({
          fileId: fileId,
          fileType: file.mimetype
        })
      }
      return listId
    } catch (err) {
      for (const id of listId) {
        await this.delete(id.fileId)
      }
      return null
    }
  }

  public static gI(): CloudDriveService {
    if (CloudDriveService.instance) {
      return CloudDriveService.instance
    }
    return (CloudDriveService.instance = new CloudDriveService())
  }
}
