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
  NODE_ENV: str({ choices: ['development', 'test', 'production', 'staging'], default: 'development' }),
  PORT: port({ default: 3333 }),
  HOST: str({ default: 'localhost' }),

  // Database
  DB_HOST: str({ default: 'localhost' }),
  DB_PORT: str({ default: '1433' }),
  DB_USERNAME: str({ default: 'sa' }),
  DB_PASSWORD: str({ default: '' }),
  DB_DATABASE: str({ default: 'tro_tot_db' }),
  DB_CONNECTION: str({ default: 'mssql' }),

  // Redis
  REDIS_HOST: str({ default: 'localhost' }),
  REDIS_PORT: str({ default: '6380' }),

  // JWT
  JWT_ACCESS_TOKEN_SECRET: str({ default: '' }),
  JWT_ACCESS_TOKEN_EXPIRES_IN: str({ default: '3600' }),
  JWT_REFRESH_TOKEN_SECRET: str({ default: '' }),
  JWT_REFRESH_TOKEN_EXPIRES_IN: str({ default: '604800' }),

  // Mail Service
  MAIL_CLIENT_ID: str({ default: '' }),
  MAIL_CLIENT_SECRET: str({ default: '' }),
  MAIL_REFRESH_TOKEN: str({ default: '' }),
  MAIL_USER: str({ default: '' }),
  REDIRECT_URI: str({ default: '' }),

  // Drive
  DRIVE_CLIENT_ID: str({ default: '' }),
  DRIVE_SECRET_ID: str({ default: '' }),
  REFRESH_TOKEN_DRIVE: str({ default: '' }),

  // Python Services
  SEARCH_SERVICE_URL: str({ default: '' }),
  RECOMMEND_SERVICE_URL: str({ default: '' }),

  // AI Moderation
  MODERATION_SERVICE_URL: str({ default: '' }),
  MODERATION_THRESHOLD: num({ default: 0.9 }),

  // Frontend URL
  FRONTEND_URL: str({ default: 'http://localhost:3000' }),

  // WebSocket
  SOCKET_PORT: str({ default: '3333' }),
  SOCKET_PATH: str({ default: '/socket.io/' }),

  // Docker
  DOCKER_MYSQL_PORT: str({ default: '3307' }),
  DOCKER_REDIS_PORT: str({ default: '6380' }),

  // WebRTC / Coturn Configuration
  // STUN servers for ICE candidate gathering (public, no auth required)
  STUN_SERVER_URLS: str({ default: 'stun:stun.l.google.com:19302,stun:stun1.l.google.com:19302' }),
  // Coturn/TURN server IP address
  TURN_SERVER_IP: str({ default: '' }),
  // Coturn server port (default: 3478 for UDP/TCP, 5349 for TLS)
  TURN_SERVER_PORT: str({ default: '3478' }),
  // Coturn TLS port
  TURN_SERVER_TLS_PORT: str({ default: '5349' }),
  // Coturn credentials
  TURN_USERNAME: str({ default: '' }),
  TURN_CREDENTIAL: str({ default: '' }),
})

