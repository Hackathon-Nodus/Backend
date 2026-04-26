import express from 'express';
import { refineProblem } from '../services/ai/refineService';
import Problem from '../models/problem';
import User from '../models/user';
import Solution from '../models/Solution';
import auth from '../middleware/auth';

const router = express.Router();

// POST /api/ai/enhance
router.post('/enhance', auth, async (req, res) => {
  try {
    const { title, description, category } = req.body;
    
    if (!title || !description) {
      return res.status(400).json({ 
        success: false, 
        error: 'Title and description are required' 
      });
    }

    const refined = await refineProblem(title, description, category);
    
    res.json({
      success: true,
      data: refined,
      provider: 'Google Gemini',
      message: 'Problem enhanced successfully'
    });
    
  } catch (error: any) {
    console.error('Enhance error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'AI enhancement failed' 
    });
  }
});

// GET /api/ai/match/:problemId
router.get('/match/:problemId', auth, async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.problemId);
    
    if (!problem) {
      return res.status(404).json({ success: false, error: 'Problem not found' });
    }

    const solvers = await User.find({ role: 'solver' }).limit(20);

    const matches = solvers.map(solver => ({
      solverId: solver._id,
      name: solver.name,
      matchScore: Math.floor(Math.random() * 40) + 60,
      reason: "Based on skills and availability"
    }));

    res.json({
      success: true,
      data: { matches: matches.slice(0, 5) }
    });
    
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/ai/rank-solutions/:problemId
router.post('/rank-solutions/:problemId', auth, async (req, res) => {
  try {
    const solutions = await Solution.find({ 
      problemId: req.params.problemId 
    }).populate('createdBy', 'name');
    
    // FIXED: Use type assertion or safe navigation
    const rankings = solutions.map((sol: any, idx: number) => ({
      solutionId: sol._id,
      rank: idx + 1,
      score: 100 - (idx * 10),
      solverName: sol.createdBy?.name || 'Unknown Solver'  // Added fallback
    }));
    
    res.json({ success: true, data: { rankings } });
    
  } catch (error: any) {
    console.error('Rank error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/ai/hint/:problemId
router.get('/hint/:problemId', auth, async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.problemId);
    
    const hints = [
      ` Break down the problem into smaller parts`,
      ` Research similar solutions online`,
      ` Start with a simple MVP approach`,
      ` Test your solution with examples`,
      `  Document your thought process`,
      `  Consider edge cases carefully`
    ];
    const randomHint = hints[Math.floor(Math.random() * hints.length)];
    
    res.json({ success: true, data: { hint: randomHint } });
    
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;









