import express from 'express'
import exampleRouter from './example.router'
import authRouter from './auth.router'
import multiMediaRouter from './multimedia.router'
import adminRouter from './admin.router'
import postRouter from './post.router'
import customerRouter from './customer.router'
import searchRouter from './search.router'
import recommendRouter from './recommend.router'
import interactionRouter from './interaction.router'
import locationRouter from './location.router'
import chatRouter from '@/web/routers/chat.routes'
import videoCallRouter from './video-call.router'

const routerConfig = express.Router()

routerConfig.use('/files', multiMediaRouter)

routerConfig.use(`/examples`, exampleRouter)

routerConfig.use('/auth', authRouter)

routerConfig.use('/admin', adminRouter)

routerConfig.use('/post', postRouter)

routerConfig.use('/customer', customerRouter)

routerConfig.use('/search', searchRouter)

routerConfig.use('/recommend', recommendRouter)

routerConfig.use('/interactions', interactionRouter)

routerConfig.use('/location', locationRouter)

routerConfig.use('/chat', chatRouter)

routerConfig.use('/video-call', videoCallRouter)

export default routerConfig
