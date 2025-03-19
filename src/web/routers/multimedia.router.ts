import express from 'express'
import multimediaController from '../controllers/file.controller'
import { getFileValidate } from '../validator/get-file.validate'

const multiMediaRouter = express.Router()

multiMediaRouter.get('/:fileId', getFileValidate, multimediaController.getFile.bind(multimediaController))

export default multiMediaRouter
