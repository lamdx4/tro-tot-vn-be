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
export { deleteFileFromDisk, deleteFileFromDisk2 }
