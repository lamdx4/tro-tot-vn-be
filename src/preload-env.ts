// Preload environment variables before any other imports
import dotenv from 'dotenv'

// Load environment variables
const envResult = dotenv.config({ path: `.env.${process.env.NODE_ENV || 'development'}` })

if (envResult.error) {
  // Try fallback to .env
  dotenv.config()
}

// Export empty object to satisfy module import
export {}

