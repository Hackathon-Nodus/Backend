// import express from 'express';
// import { refineProblemController,matchProblemController}  from '../controllers/aiController'; 

// const router=express.Router();

// router.post('/refine',refineProblemController);
// router.post('/match',matchProblemController);

// export default router;



import express from 'express';
import { refineProblem } from '../services/ai/refineService';
import problem from '../models/problem';
import Solution  from '../models/Solution';
import User  from '../models/user';
import requireAuth  from '../middleware/auth';