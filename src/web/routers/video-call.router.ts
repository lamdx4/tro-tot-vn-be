import express from 'express'
import videoCallController from '../controllers/video-call.controller'

const videoCallRouter = express.Router()

// Public endpoint - no authentication required
// Get ICE server configuration for WebRTC
videoCallRouter.get('/ice-config', videoCallController.getIceConfig.bind(videoCallController))

export default videoCallRouter

