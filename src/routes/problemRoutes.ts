import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import {
  createProblem,
  getAllProblems,
  getProblemById,
  updateProblem,
  deleteProblem,
  getProblemsByUser,
} from '../controllers/problemController';

const router = Router();

// ─── Public Routes ───────────────────────────────────────────────────────────
// GET /api/problems - Get all problems (with pagination & filters)
// Query: ?page=1&limit=10&difficulty=Easy&tag=javascript&search=two sum
router.get('/', getAllProblems);

// GET /api/problems/:id - Get single problem by ID
router.get('/:id', getProblemById);

// ─── Protected Routes (Auth Required) ─────────────────────────────────────────
// POST /api/problems - Create a new problem
router.post('/', requireAuth, createProblem);

// GET /api/problems/user/my - Get current user's problems
router.get('/user/my', requireAuth, getProblemsByUser);

// PUT /api/problems/:id - Update a problem
router.put('/:id', requireAuth, updateProblem);

// DELETE /api/problems/:id - Delete a problem
router.delete('/:id', requireAuth, deleteProblem);

export default router;