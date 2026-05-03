import { Router } from 'express';
import { listByProblem, submit } from '../controllers/solution';
import { validateSubmitSolution } from '../validations/solutionSchema';
import requireAuth from '../middleware/auth';

const router = Router();

router.post('/', requireAuth, validateSubmitSolution, submit);
router.get('/', requireAuth, listByProblem);
router.get('/:problemId', requireAuth, listByProblem);

export default router;
