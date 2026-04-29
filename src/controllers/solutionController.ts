import { Response } from 'express';
import { Types, SortOrder } from 'mongoose';
import Solution from '../models/Solution';
import Problem from '../models/Problem';
import { AuthRequest } from '../middleware/auth';

const isDev = process.env.NODE_ENV === 'development';

const resolveId = (val: string | string[] | undefined): string | undefined => {
  if (!val) return undefined;
  return Array.isArray(val) ? val[0] : val;
};

// ─── Create a Solution ────────────────────────────────────────────────────────
export const createSolution = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = resolveId(req.user?.id);
    const problemId = resolveId(req.params.problemId);

    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    if (!problemId || !Types.ObjectId.isValid(problemId)) {
      res.status(400).json({ success: false, message: 'Invalid problem ID.' });
      return;
    }

    const problem = await Problem.findById(problemId);
    if (!problem) {
      res.status(404).json({ success: false, message: 'Problem not found.' });
      return;
    }

    const { code, language, explanation } = req.body;

    if (!code || !language) {
      res.status(400).json({ success: false, message: 'Code and language are required.' });
      return;
    }

    const solution = new Solution({
      problem: new Types.ObjectId(problemId),
      user: new Types.ObjectId(userId),
      code,
      language,
      explanation,
    });

    await solution.save();

    problem.solutionCount = (problem.solutionCount || 0) + 1;
    await problem.save();

    res.status(201).json({
      success: true,
      message: 'Solution submitted successfully.',
      data: solution,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Server error while creating solution.',
      ...(isDev && { debug: error.message }),
    });
  }
};

// ─── Get All Solutions for a Problem ─────────────────────────────────────────
export const getSolutionsByProblem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const problemId = resolveId(req.params.problemId);
    const sortBy = resolveId(req.query.sortBy as string | string[]) || 'score';

    if (!problemId || !Types.ObjectId.isValid(problemId)) {
      res.status(400).json({ success: false, message: 'Invalid problem ID.' });
      return;
    }

    const validSorts: Record<string, Record<string, SortOrder>> = {
      score:         { score: -1 },
      likeCount:     { likeCount: -1 },
      averageRating: { averageRating: -1 },
      newest:        { createdAt: -1 },
    };

    const sortQuery = validSorts[sortBy] ?? validSorts.score;

    const solutions = await Solution.find({ problem: new Types.ObjectId(problemId) })
      .populate('user', 'username email')
      .sort(sortQuery);

    res.json({
      success: true,
      count: solutions.length,
      data: solutions,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching solutions.',
      ...(isDev && { debug: error.message }),
    });
  }
};

// ─── Like / Unlike a Solution ─────────────────────────────────────────────────
export const likeSolution = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = resolveId(req.user?.id);
    const solutionId = resolveId(req.params.solutionId);

    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    if (!solutionId || !Types.ObjectId.isValid(solutionId)) {
      res.status(400).json({ success: false, message: 'Invalid solution ID.' });
      return;
    }

    const solution = await Solution.findById(solutionId);
    if (!solution) {
      res.status(404).json({ success: false, message: 'Solution not found.' });
      return;
    }

    const userObjectId = new Types.ObjectId(userId);
    const alreadyLiked = solution.likes.some(id => id.equals(userObjectId));

    if (alreadyLiked) {
      solution.likes = solution.likes.filter(id => !id.equals(userObjectId));
    } else {
      solution.likes.push(userObjectId);
    }

    await solution.save();

    res.json({
      success: true,
      message: alreadyLiked ? 'Solution unliked.' : 'Solution liked.',
      likeCount: solution.likeCount,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Server error while liking solution.',
      ...(isDev && { debug: error.message }),
    });
  }
};

// ─── Rate a Solution ──────────────────────────────────────────────────────────
export const rateSolution = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = resolveId(req.user?.id);
    const solutionId = resolveId(req.params.solutionId);

    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    if (!solutionId || !Types.ObjectId.isValid(solutionId)) {
      res.status(400).json({ success: false, message: 'Invalid solution ID.' });
      return;
    }

    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      res.status(400).json({ success: false, message: 'Rating must be between 1 and 5.' });
      return;
    }

    const solution = await Solution.findById(solutionId);
    if (!solution) {
      res.status(404).json({ success: false, message: 'Solution not found.' });
      return;
    }

    const userObjectId = new Types.ObjectId(userId);
    const existingIndex = solution.ratings.findIndex(r => r.user.equals(userObjectId));

    if (existingIndex !== -1) {
      solution.ratings[existingIndex].rating = rating;
      solution.ratings[existingIndex].comment = comment;
    } else {
      solution.ratings.push({ user: userObjectId, rating, comment, createdAt: new Date() });