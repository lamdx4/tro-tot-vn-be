import express from 'express'
import multimediaController from '../controllers/file.controller'
import { getFileValidate } from '../validator/get-file.validate'
import authenticateMiddleware from '@/web/middlewares/authenticate.middleware'

const multiMediaRouter = express.Router()

multiMediaRouter.get('/:fileId', authenticateMiddleware, getFileValidate, multimediaController.getFile.bind(multimediaController))

export default multiMediaRouter
