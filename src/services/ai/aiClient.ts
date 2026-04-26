import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();
const apiKey=process.env.GEMINI_API_KEY!;
if(!apiKey){
    throw new Error("Api key is not defined in environment variable");
}
export const genAI=new GoogleGenerativeAI(apiKey);
