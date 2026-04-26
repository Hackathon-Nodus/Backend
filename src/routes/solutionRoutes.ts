import { Router } from 'express';
import { listByProblem, submit } from '../controllers/solution';
import { validateSubmitSolution } from '../validations/solutionSchema';

const router = Router();

router.post('/', validateSubmitSolution, submit);
router.get('/:problemId', listByProblem);

export default router;
