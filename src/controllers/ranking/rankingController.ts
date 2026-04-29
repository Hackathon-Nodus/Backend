import { Request, Response } from 'express';
import Solution from '../../models/Solution';
import { Types } from 'mongoose';
import { AuthRequest } from '../../middleware/auth';

const isDev = process.env.NODE_ENV === 'development';

// ─── Toggle Like ─────────────────────────────────────────────────────────────
export const toggleLike = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const solutionId = req.params.solutionId as string;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required. Please login.' });
      return;
    }

    if (!Types.ObjectId.isValid(solutionId)) {
      res.status(400).json({ success: false, message: 'Invalid solution ID.' });
      return;
    }

    const solution = await Solution.findById(solutionId);
    if (!solution) {
      res.status(404).json({ success: false, message: 'Solution not found.' });
      return;
    }

    if (solution.user.toString() === userId) {
      res.status(403).json({ success: false, message: 'You cannot like your own solution.' });
      return;
    }

    const userObjectId = new Types.ObjectId(userId);
    const hasLiked = solution.likes.some((id) => id.equals(userObjectId));

    if (hasLiked) {
      solution.likes = solution.likes.filter((id) => !id.equals(userObjectId));
    } else {
      solution.likes.push(userObjectId);
    }

    await solution.save();

    res.json({
      success: true,
      message: hasLiked ? 'Like removed.' : 'Solution liked.',
      likeCount: solution.likeCount,
      hasLiked: !hasLiked,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Server error while processing like.',
      ...(isDev && { debug: error.message }),
    });
  }
};

// ─── Add / Update Rating ──────────────────────────────────────────────────────
export const addRating = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const solutionId = req.params.solutionId as string;
    const { rating, comment } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    if (!Types.ObjectId.isValid(solutionId)) {
      res.status(400).json({ success: false, message: 'Invalid solution ID.' });
      return;
    }

    const ratingNum = Number(rating);
    if (!rating || isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      res.status(400).json({ success: false, message: 'Rating must be a number between 1 and 5.' });
      return;
    }

    const solution = await Solution.findById(solutionId);
    if (!solution) {
      res.status(404).json({ success: false, message: 'Solution not found.' });
      return;
    }

    if (solution.user.toString() === userId) {
      res.status(403).json({ success: false, message: 'You cannot rate your own solution.' });
      return;
    }

    const userObjectId = new Types.ObjectId(userId);
    const existingIndex = solution.ratings.findIndex((r) => r.user.equals(userObjectId));
    const isUpdate = existingIndex !== -1;

    if (isUpdate) {
      solution.ratings.splice(existingIndex, 1);
    }

    solution.ratings.push({
      user: userObjectId,
      rating: ratingNum,
      comment: comment?.trim(),
      createdAt: new Date(),
    });

    await solution.save();

    res.json({
      success: true,
      message: isUpdate ? 'Rating updated successfully.' : 'Rating submitted successfully.',
      averageRating: solution.averageRating,
      totalRatings: solution.totalRatings,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Server error while submitting rating.',
      ...(isDev && { debug: error.message }),
    });
  }
};

// ─── Get Solutions for a Problem ──────────────────────────────────────────────
export const getSolutionsByProblem = async (req: Request, res: Response): Promise<void> => {
  try {
    const problemId = req.params.problemId as string;
    const sort   = (req.query.sort   as string) || 'best';
    const page   = (req.query.page   as string) || '1';
    const limit  = (req.query.limit  as string) || '10';

    if (!Types.ObjectId.isValid(problemId)) {
      res.status(400).json({ success: false, message: 'Invalid problem ID.' });
      return;
    }

    const sortOptions: Record<string, Record<string, 1 | -1>> = {
      best:   { score: -1 },
      likes:  { likeCount: -1 },
      rating: { averageRating: -1, totalRatings: -1 },
      newest: { createdAt: -1 },
    };

    const sortOption = sortOptions[sort] ?? sortOptions.best;
    const pageNum  = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip     = (pageNum - 1) * limitNum;

    const [solutions, total] = await Promise.all([
      Solution.find({ problem: problemId })
        .populate('user', 'name username profilePicture')
        .populate('problem', 'title')
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Solution.countDocuments({ problem: problemId }),
    ]);

    res.json({
      success: true,
      count: solutions.length,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      sortBy: sort,
      solutions,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching solutions.',
      ...(isDev && { debug: error.message }),
    });
  }
};

// ─── Create a Solution for a Problem ─────────────────────────────────────────
export const createSolution = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const problemId = req.params.problemId as string;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    if (!Types.ObjectId.isValid(problemId)) {
      res.status(400).json({ success: false, message: 'Invalid problem ID.' });
      return;
    }

    const { code, language, explanation } = req.body;

    if (!code || !language) {
      res.status(400).json({ success: false, message: 'Code and language are required.' });
      return;
    }

    // Check if problem exists
    const Problem = (await import('../../models/Problem')).default;
    const problem = await Problem.findById(problemId);
    
    if (!problem) {
      res.status(404).json({ success: false, message: 'Problem not found.' });
      return;
    }

    // Create the solution
    const solution = new Solution({
      problem: new Types.ObjectId(problemId),
      user: new Types.ObjectId(userId),
      code,
      language,
      explanation: explanation || '',
      likes: [],
      ratings: [],
      likeCount: 0,
      averageRating: 0,
      totalRatings: 0,
      score: 0,
    });

    await solution.save();

    // Increment solution count on the problem
    problem.solutionCount += 1;
    await problem.save();

    res.status(201).json({
      success: true,
      message: 'Solution created successfully.',
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