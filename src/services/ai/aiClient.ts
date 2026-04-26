import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../../config/env';

const apiKey = env.GEMINI_API_KEY;
if (!apiKey) {
    throw new Error("Api key is not defined in environment variable");
}

export const genAI = new GoogleGenerativeAI(apiKey);

export const generateJson = async <T>(prompt: string, fallback: T): Promise<T> => {
    if (env.NODE_ENV === 'test') {
        return fallback;
    }

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const content = response.text();

        if (!content) {
            return fallback;
        }

        const cleanContent = content.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanContent) as T;
    } catch (error) {
        console.error('AI provider error:', error);
        return fallback;
    }
};
