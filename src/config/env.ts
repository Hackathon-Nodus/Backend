import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const getRequiredEnv = (key: string): string => {
    const value = process.env[key];
    if (!value) {
        throw new Error(`${key} is required but not defined in environment variables`);
    }
    return value;
};

const getEnv = (key: string, fallback: string): string => {
    return process.env[key] || fallback;
};

const getNumberEnv = (key: string, fallback: number): number => {
    const rawValue = process.env[key];
    if (!rawValue) {
        return fallback;
    }

    const parsed = Number.parseInt(rawValue, 10);
    return Number.isNaN(parsed) ? fallback : parsed;
};

interface EnvConfig {
    PORT: number;
    NODE_ENV: string;
    GEMINI_API_KEY: string;
    MONGO_URI: string;
    JWT_SECRET: string;
    JWT_REFRESH_TOKEN: string;
    JWT_EXPIRES_IN: string;
    JWT_REFRESH_EXPIRES_IN: string
}

export const PORT = getNumberEnv('PORT', 3000);
export const NODE_ENV = getEnv('NODE_ENV', 'development');
export const MONGO_URI = getEnv('MONGO_URI', 'mongodb://localhost:27017/myapp');
export const GEMINI_API_KEY =
    NODE_ENV === 'test' ? getEnv('GEMINI_API_KEY', 'test-gemini-key') : getRequiredEnv('GEMINI_API_KEY');
export const JWT_SECRET = getEnv('JWT_SECRET', 'your_jwt_secret');
export const JWT_REFRESH_TOKEN = getEnv('JWT_REFRESH_TOKEN', 'your_jwt_refresh_token');
export const JWT_EXPIRES_IN = getEnv('JWT_EXPIRES_IN', '1h');
export const JWT_REFRESH_EXPIRES_IN = getEnv('JWT_REFRESH_EXPIRES_IN', '7d');

export const env: EnvConfig = {
    PORT,
    NODE_ENV,
    MONGO_URI,
    GEMINI_API_KEY,
    JWT_SECRET,
    JWT_REFRESH_TOKEN,
    JWT_EXPIRES_IN,
    JWT_REFRESH_EXPIRES_IN
};