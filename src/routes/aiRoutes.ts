import express from 'express';
import auth from '../middleware/auth';
import {
  hintController,
  matchProblemController,
  rankSolutionsController,
  refineProblemController
} from '../controllers/aiController';
import { validateEnhancePayload, validateMatchRequest } from '../validations/ai.validation';

const router = express.Router();

// POST /api/ai/enhance
router.post('/enhance', auth, validateEnhancePayload, refineProblemController);

// GET /api/ai/match/:problemId
router.get('/match/:problemId', auth, validateMatchRequest, matchProblemController);

// POST /api/ai/rank-solutions/:problemId
router.post('/rank-solutions/:problemId', auth, rankSolutionsController);

// GET /api/ai/hint/:problemId
router.get('/hint/:problemId', auth, hintController);

export default router;

