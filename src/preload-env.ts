// Preload environment variables before any other imports
import dotenv from 'dotenv'

// Load environment variables
const envResult = dotenv.config({ path: `.env.${process.env.NODE_ENV || 'development'}` })

if (envResult.error) {
  // Try fallback to .env
  dotenv.config()
}

// Validate and export environment variables using envalid
import { cleanEnv, str, port, num } from 'envalid'

export const env = cleanEnv(process.env, {
  // Application
  NODE_ENV: str({ choices: ['development', 'test', 'production', 'staging'] }),
  PORT: port(),
  HOST: str(),

  // Database
  DB_HOST: str(),
  DB_PORT: port(),
  DB_USERNAME: str(),
  DB_PASSWORD: str(),
  DB_DATABASE: str(),
  DB_CONNECTION: str(),

  // Redis
  REDIS_HOST: str(),
  REDIS_PORT: port(),
  REDIS_PASSWORD: str(),

  // JWT
  JWT_ACCESS_TOKEN_SECRET: str(),
  JWT_ACCESS_TOKEN_EXPIRES_IN: str(),
  JWT_REFRESH_TOKEN_SECRET: str(),
  JWT_REFRESH_TOKEN_EXPIRES_IN: str(),

  // Mail Service
  MAIL_CLIENT_ID: str(),
  MAIL_CLIENT_SECRET: str(),
  MAIL_REFRESH_TOKEN: str(),
  MAIL_USER: str(),
  REDIRECT_URI: str(),

  // Drive
  DRIVE_CLIENT_ID: str(),
  DRIVE_SECRET_ID: str(),
  REFRESH_TOKEN_DRIVE: str(),

  // Python Services
  SEARCH_SERVICE_URL: str(),
  RECOMMEND_SERVICE_URL: str(),

  // AI Moderation
  MODERATION_SERVICE_URL: str(),
  MODERATION_THRESHOLD: num(),

  // Frontend URL
  FRONTEND_URL: str(),

  // WebSocket
  SOCKET_PORT: port(),
  SOCKET_PATH: str(),

  // WebRTC / Coturn Configuration
  STUN_SERVER_URLS: str(),
  TURN_SERVER_IP: str({ default: '' }), // Optional: if missing, will fallback to Redis discovery
  TURN_SERVER_PORT: port(),
  TURN_SERVER_TLS_PORT: port(),
  TURN_USERNAME: str(),
  TURN_CREDENTIAL: str(),

  // Firebase
  FIREBASE_SERVICE_ACCOUNT_PATH: str(),
})
