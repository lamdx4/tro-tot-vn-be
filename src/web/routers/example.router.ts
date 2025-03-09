import express from 'express'
import exampleController from '../controllers/example.controller'

const exampleRouter = express.Router()

// Use controller instance methods (with proper binding)
exampleRouter.get('/', exampleController.getAll.bind(exampleController))
exampleRouter.get('/:id', exampleController.getById.bind(exampleController))
exampleRouter.post('/', exampleController.create.bind(exampleController))

export default exampleRouter