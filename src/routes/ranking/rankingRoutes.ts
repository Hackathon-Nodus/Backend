import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import {
  createSolution,
  toggleLike,
  addRating,
  getSolutionsByProblem,
} from '../../controllers/ranking/rankingController';

const router = Router();

// POST /api/ranking/problems/:problemId/solutions (auth required)
router.post('/problems/:problemId/solutions', requireAuth, createSolution);

// POST /api/ranking/solutions/:solutionId/like  (auth required)
router.post('/solutions/:solutionId/like', requireAuth, toggleLike);

// POST /api/ranking/solutions/:solutionId/rate  (auth required)
router.post('/solutions/:solutionId/rate', requireAuth, addRating);

// GET  /api/ranking/problems/:problemId/solutions  (public)
// Query: ?sort=best|likes|rating|newest  &page=1&limit=10
router.get('/problems/:problemId/solutions', getSolutionsByProblem);

export default router;