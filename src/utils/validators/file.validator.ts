import ResponseData from '@/utils/data-types/response';

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
export const MAX_VIDEO_SIZE = 25 * 1024 * 1024; // 25MB
export const MAX_MESSAGE_FILE_SIZE = 25 * 1024 * 1024; // 25MB

export class FileValidator {
  /**
   * Validate a list of images for size
   */
  static validateImages(images: Express.Multer.File[] | undefined): string | null {
    if (!images || images.length === 0) return null;
    
    for (const img of images) {
      if (img.size > MAX_IMAGE_SIZE) {
        return 'IMAGE_SIZE_LIMIT_EXCEEDED';
      }
    }
    return null;
  }

  /**
   * Validate a video for size
   */
  static validateVideo(video: Express.Multer.File | undefined): string | null {
    if (!video) return null;
    
    if (video.size > MAX_VIDEO_SIZE) {
      return 'VIDEO_SIZE_LIMIT_EXCEEDED';
    }
    return null;
  }

  /**
   * Validate a single chat file for size
   */
  static validateMessageFile(file: Express.Multer.File | undefined): string | null {
    if (!file) return null;
    
    if (file.size > MAX_MESSAGE_FILE_SIZE) {
      return 'FILE_SIZE_LIMIT_EXCEEDED';
    }
    return null;
  }
}
