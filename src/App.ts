import express, { Request, Response } from 'express';
import cors from 'cors';
import { connectDatabase } from './config/database';
import authRoutes from './routes/authRoutes';
import solutionRoutes from './routes/solutionRoutes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { env } from './config/env';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/v1/health', (_req: Request, res: Response) => {
    res.status(200).json({ status: 'ok' });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/solutions', solutionRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const start = async (): Promise<void> => {
    await connectDatabase();

    app.listen(env.PORT, () => {
        console.log(`Server is running on port ${env.PORT}`);
    });
};

void start();
