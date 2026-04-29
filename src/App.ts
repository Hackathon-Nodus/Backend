import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

import connectDB from './config/database';
import errorHandler from './middleware/errorHandler';
import authRoutes from './routes/authRoutes';
import rankingRoutes from './routes/ranking/rankingRoutes';
import problemRoutes from './routes/problemRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Connect to MongoDB ───────────────────────────────────────────────────────
connectDB();

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/ranking', rankingRoutes);
app.use('/api/problems', problemRoutes);

// ─── Health / Home ────────────────────────────────────────────────────────────
app.get('/', (_req, res) => {
  res.json({
    message: '✅ Backend is running successfully!',
    status: 'success',
    branch: 'feature/ranking-feedback-system',
    role: 'Birtukan – Ranking and Feedback System',
  });
});

app.get('/health', (_req, res) => {
  res.json({ status: 'healthy', db: 'connected' });
});

// ─── Global Error Handler (must be last) ─────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`📌 Problem routes ready:`);
  console.log(`   → POST /api/problems (create problem)`);
  console.log(`   → GET  /api/problems (list all problems)`);
  console.log(`   → GET  /api/problems/:id (get problem by ID)`);
  console.log(`   → PUT  /api/problems/:id (update problem)`);
  console.log(`   → DELETE /api/problems/:id (delete problem)`);
  console.log(`📌 Solution routes ready:`);
  console.log(`   → POST /api/ranking/problems/:problemId/solutions (create solution)`);
  console.log(`   → GET  /api/ranking/problems/:problemId/solutions (get solutions)`);
  console.log(`📌 Ranking routes ready:`);
  console.log(`   → POST /api/ranking/solutions/:solutionId/like`);
  console.log(`   → POST /api/ranking/solutions/:solutionId/rate`);
});

export default app;