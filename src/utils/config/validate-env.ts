import { cleanEnv, str, email, json, port, num } from 'envalid'
cleanEnv(process.env, {
    // Application
    NODE_ENV: str({ choices: ['development', 'test', 'production', 'staging'] }),
    PORT : port({ default: 3333 }),
    HOST: str(),
    
    // Database - NO DEFAULTS (must be explicit)
    DATABASE_URL: str(),
    DB_HOST: str(),
    DB_PORT: str(),
    DB_USERNAME: str(), 
    DB_PASSWORD: str(),
    DB_DATABASE: str(),
    
    // Redis - NO DEFAULTS (must be explicit)
    REDIS_HOST: str(),
    REDIS_PORT: str(),
    
    // JWT - NO DEFAULTS for secrets (must be explicit)
    JWT_ACCESS_TOKEN_SECRET: str(),
    JWT_ACCESS_TOKEN_EXPIRES_IN: str({ default: '3600' }), // 1 hour - reasonable default
    JWT_REFRESH_TOKEN_SECRET: str(),
    JWT_REFRESH_TOKEN_EXPIRES_IN: str({ default: '604800' }), // 7 days - reasonable default
    
    // Mail Service - NO DEFAULTS (must be explicit)
    MAIL_CLIENT_ID: str(),
    MAIL_CLIENT_SECRET: str(),
    MAIL_REFRESH_TOKEN: str(),
    MAIL_USER: str(),
    
    // Python Services - NO DEFAULTS (must be explicit)
    SEARCH_SERVICE_URL: str(),
    RECOMMEND_SERVICE_URL: str(),
    
    // AI Moderation - NO DEFAULTS (must be explicit)
    MODERATION_SERVICE_URL: str(),
    MODERATION_THRESHOLD: num(),

    // Frontend URL - NO DEFAULT (must be explicit)
    FRONTEND_URL: str(),

    // WebRTC / Coturn Configuration
    // STUN servers for ICE candidate gathering (public, no auth required)
    STUN_SERVER_URLS: str({ default: 'stun:stun.l.google.com:19302,stun:stun1.l.google.com:19302' }),
    // Coturn/TURN server IP address
    TURN_SERVER_IP: str(),
    // Coturn server port (default: 3478 for UDP/TCP, 5349 for TLS)
    TURN_SERVER_PORT: str({ default: '3478' }),
    // Coturn TLS port
    TURN_SERVER_TLS_PORT: str({ default: '5349' }),
    // Coturn credentials
    TURN_USERNAME: str(),
    TURN_CREDENTIAL: str(),
})
