import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });


interface EnvConfig {
    PORT: number,
    NODE_ENV: string,
    GEMINI_API_KEY: string,
    MONGO_URI: string,
    JWT_SECRET: string,
    JWT_REFRESH_TOKEN: string,
    JWT_EXPIRES_IN: string,
    JWT_REFRESH_EXPIRES_IN: string
}

const getRequiredEnv=(key:string):string=>{
    const value=process.env[key];
    if(!value){
        throw new Error(`${key} is required but not defined in environment variables`);
    }
    return value;
};
export const env: EnvConfig = {
    PORT: parseInt(process.env.PORT || '3000', 10),
    NODE_ENV: process.env.NODE_ENV || 'development',
    MONGO_URI: process.env.MONGO_URI || 'mongodb+srv://root:12345@cluster0.b5cjst2.mongodb.net/?appName=Cluster0',
    GEMINI_API_KEY: getRequiredEnv('GEMINI_API_KEY'),
    JWT_SECRET: process.env.JWT_SECRET || 'your_jwt_secret',
    JWT_REFRESH_TOKEN: process.env.JWT_REFRESH_TOKEN || 'your_jwt_refresh_token',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1h',
    JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
}
    // MONGO_URI: process.env.MONGO_URI ||'mongodb://localhost:27017/myapp' ,
