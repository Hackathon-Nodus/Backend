import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import {
  createSolution,
  getSolutionsByProblem,
  likeSolution,
  rateSolution,
  deleteSolution,
} from '../controllers/solutionController';

const router = Router();

// ─── Public Routes ────────────────────────────────────────────────────────────
// GET /api/solutions/problems/:problemId?sortBy=score|likeCount|averageRating|newest
router.get('/problems/:problemId', getSolutionsByProblem);

// ─── Protected Routes ─────────────────────────────────────────────────────────
// POST /api/solutions/problems/:problemId   - Submit a solution
router.post('/problems/:problemId', requireAuth, createSolution);

// POST /api/solutions/:solutionId/like     - Like/Unlike a solution
router.post('/:solutionId/like', requireAuth, likeSolution);

// POST /api/solutions/:solutionId/rate     - Rate a solution (1-5)
router.post('/:solutionId/rate', requireAuth, rateSolution);

// DELETE /api/solutions/:solutionId        - Delete your solution
router.delete('/:solutionId', requireAuth, deleteSolution);

export default router;