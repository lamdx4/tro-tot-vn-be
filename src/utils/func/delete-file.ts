import * as fs from 'fs'

const deleteFile = (filePath: string) => {
  fs.unlink(filePath, (err) => {
    if (err) console.error(`❌ Không thể xóa file: ${filePath}`, err)
  })
}
const deleteFileFromDisk = (files: { [fieldname: string]: Express.Multer.File[] }) => {
  if (files) {
    if (files.imgs) {
      for (const img of files.imgs) {
        deleteFile(img.path)
      }
    }
    if (files.video) {
      for (const v of files.video) {
        deleteFile(v.path)
      }
    }
  }
}
const deleteFileFromDisk2 = (files: { [fieldname: string]: Express.Multer.File[] }) => {
  if (files) {
    if (files.newImgs) {
      for (const img of files.newImgs) {
        deleteFile(img.path)
      }
    }
    if (files.newVideo) {
      for (const v of files.newVideo) {
        deleteFile(v.path)
      }
    }
  }
}
const cleanupFiles = (req: any) => {
  try {
    // Handle single file (req.file)
    if (req.file && req.file.path) {
      deleteFile(req.file.path)
    }
    // Handle multiple files (req.files)
    if (req.files) {
      if (Array.isArray(req.files)) {
        req.files.forEach((f: any) => f.path && deleteFile(f.path))
      } else {
        Object.values(req.files).forEach((fileArray: any) => {
          if (Array.isArray(fileArray)) {
            fileArray.forEach((f: any) => f.path && deleteFile(f.path))
          }
        })
      }
    }
  } catch (err) {
    console.error('❌ Lỗi khi dọn dẹp file tạm:', err)
  }
}

export { deleteFileFromDisk, deleteFileFromDisk2, cleanupFiles }
