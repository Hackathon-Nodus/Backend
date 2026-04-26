import express, { Request, Response } from 'express';
import cors from 'cors';
import { connectDatabase } from './config/database';
import authRoutes from './routes/authRoutes';
import solutionRoutes from './routes/solutionRoutes';
import aiRoutes from './routes/aiRoutes';
import userRoutes from './routes/userRoutes';
import notificationRoutes from './routes/notificationRoutes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { env } from './config/env';
import dotenv from "dotenv";
import path from "path";

const app = express();
dotenv.config({ path: path.resolve(__dirname, "../.env") });

app.use(cors());
app.use(express.json());

app.get('/api/v1/health', (_req: Request, res: Response) => {
    res.status(200).json({ status: 'ok' });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/solutions', solutionRoutes);
app.use('/api/v1/ai',aiRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/notifications', notificationRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const start = async (): Promise<void> => {
    await connectDatabase();

    app.listen(env.PORT, () => {
        console.log(`Server is running on port ${env.PORT}`);
    });
};

if (process.env.NODE_ENV !== 'test') {
    void start();
}

export default app;
