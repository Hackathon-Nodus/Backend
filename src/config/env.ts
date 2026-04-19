import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });


interface EnvConfig {
    PORT: number,
    NODE_ENV: string,
    MONGO_URI: string,
    JWT_SECRET: string,
    JWT_REFRESH_TOKEN: string,
    JWT_EXPIRES_IN: string,
    JWT_REFRESH_EXPIRES_IN: string
}

export const env: EnvConfig = {
    PORT: parseInt(process.env.PORT || '3000', 10),
    NODE_ENV: process.env.NODE_ENV || 'development',
    MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/myapp',
    JWT_SECRET: process.env.JWT_SECRET || 'your_jwt_secret',
    JWT_REFRESH_TOKEN: process.env.JWT_REFRESH_TOKEN || 'your_jwt_refresh_token',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1h',
    JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
}