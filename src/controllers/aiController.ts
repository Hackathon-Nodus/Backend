import { NextFunction, Request, Response } from 'express';
import { refineProblem } from '../services/ai/refineService';
import { matchSolver } from '../services/ai/matchService';
import Problem from '../models/problem';
import User from '../models/User';
import Solution from '../models/Solution';
import { createNotification } from '../services/notificationService';
import { HttpError } from '../middleware/errorHandler';

export const refineProblemController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { title, description, category } = req.body;

    const result = await refineProblem(title, description, category || null);

    if (req.user?.id) {
      await createNotification(req.user.id, 'ai_result_ready', 'Your AI enhancement result is ready.');
    }

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const matchProblemController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const problem = await Problem.findById(req.params.problemId);
    if (!problem) {
      throw new HttpError(404, 'Problem not found');
    }

    const solvers = await User.find({ role: { $in: ['solver', 'user'] } })
      .limit(20)
      .select('name displayName skills repScore rating');

    const result = await matchSolver(problem.toObject(), solvers);

    const topSolverId = result.topPick || result.matches?.[0]?.solverId;
    if (topSolverId) {
      await createNotification(
        topSolverId,
        'solution_matched',
        `A problem was matched to you: ${problem.title}`
      );
    }

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const rankSolutionsController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const solutions = await Solution.find({
      problemId: req.params.problemId
    }).populate('createdBy', 'name displayName');

    const rankings = solutions.map((solution: any, index: number) => ({
      solutionId: solution._id,
      rank: index + 1,
      score: Math.max(0, 100 - (index * 10)),
      solverName: solution.createdBy?.displayName || solution.createdBy?.name || 'Unknown Solver'
    }));

    res.status(200).json({ success: true, data: { rankings } });
  } catch (error) {
    next(error);
  }
};

export const hintController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const problem = await Problem.findById(req.params.problemId).select('_id');
    if (!problem) {
      throw new HttpError(404, 'Problem not found');
    }

    const hints = [
      'Break down the problem into smaller parts',
      'Research similar solutions online',
      'Start with a simple MVP approach',
      'Test your solution with examples',
      'Document your thought process',
      'Consider edge cases carefully'
    ];
    const randomHint = hints[Math.floor(Math.random() * hints.length)];

    res.status(200).json({ success: true, data: { hint: randomHint } });
  } catch (error) {
    next(error);
  }
};
