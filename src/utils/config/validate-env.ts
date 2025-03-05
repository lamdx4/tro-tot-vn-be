import { cleanEnv, str, email, json, port } from 'envalid'
cleanEnv(process.env, {
    NODE_ENV: str({ choices: ['development', 'test', 'production', 'staging'] }),
    PORT : port({ default: 3333 }),
    HOST: str(),
    DATABASE_URL: str(),
    DB_HOST: str(),
    DB_PORT: str(),
    DB_USERNAME: str(), 
    DB_PASSWORD: str(),
})
