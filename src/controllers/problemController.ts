import { Request, Response } from 'express';
import Problem from '../models/Problem';
import { Types } from 'mongoose';
import { AuthRequest } from '../middleware/auth';

const isDev = process.env.NODE_ENV === 'development';

// ─── Create a Problem ─────────────────────────────────────────────────────────
export const createProblem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userIdRaw = req.user?.id;
    const userId = Array.isArray(userIdRaw) ? userIdRaw[0] : userIdRaw;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const { title, description, code, language, tags, difficulty, testCases } = req.body;

    if (!title || !description) {
      res.status(400).json({ success: false, message: 'Title and description are required.' });
      return;
    }

    const problem = new Problem({
      user: new Types.ObjectId(userId),
      title,
      description,
      code,
      language,
      tags: tags || [],
      difficulty: difficulty || 'Medium',
      testCases: testCases || [],
    });

    await problem.save();

    res.status(201).json({
      success: true,
      message: 'Problem created successfully.',
      data: problem,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Server error while creating problem.',
      ...(isDev && { debug: error.message }),
    });
  }
};

// ─── Get All Problems (with pagination & filters) ─────────────────────────────
export const getAllProblems = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Build filter query
    const filter: any = {};
    
    if (req.query.difficulty) {
      filter.difficulty = Array.isArray(req.query.difficulty)
        ? req.query.difficulty[0]
        : req.query.difficulty;
    }

    if (req.query.tag) {
      filter.tags = Array.isArray(req.query.tag)
        ? req.query.tag[0]
        : req.query.tag;
    }

    if (req.query.search) {
      const search = Array.isArray(req.query.search)
        ? req.query.search[0]
        : req.query.search;
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const problems = await Problem.find(filter)
      .populate('user', 'username email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Problem.countDocuments(filter);

    res.json({
      success: true,
      data: problems,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching problems.',
      ...(isDev && { debug: error.message }),
    });
  }
};

// ─── Get Single Problem by ID ─────────────────────────────────────────────────
export const getProblemById = async (req: Request, res: Response): Promise<void> => {
  try {
    const problemIdRaw = req.params.id;
    const problemId = Array.isArray(problemIdRaw) ? problemIdRaw[0] : problemIdRaw;

    if (!Types.ObjectId.isValid(problemId)) {
      res.status(400).json({ success: false, message: 'Invalid problem ID.' });
      return;
    }

    const problem = await Problem.findById(problemId)
      .populate('user', 'username email');

    if (!problem) {
      res.status(404).json({ success: false, message: 'Problem not found.' });
      return;
    }

    // Increment view count
    problem.viewCount += 1;
    await problem.save();

    res.json({
      success: true,
      data: problem,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching problem.',
      ...(isDev && { debug: error.message }),
    });
  }
};

// ─── Update a Problem ─────────────────────────────────────────────────────────
export const updateProblem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const problemIdRaw = req.params.id;
    const problemId = Array.isArray(problemIdRaw) ? problemIdRaw[0] : problemIdRaw;
    const userIdRaw = req.user?.id;
    const userId = Array.isArray(userIdRaw) ? userIdRaw[0] : userIdRaw;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    if (!Types.ObjectId.isValid(problemId)) {
      res.status(400).json({ success: false, message: 'Invalid problem ID.' });
      return;
    }

    const problem = await Problem.findById(problemId);

    if (!problem) {
      res.status(404).json({ success: false, message: 'Problem not found.' });
      return;
    }

    // Check if user is the owner
    if (problem.user.toString() !== userId) {
      res.status(403).json({ success: false, message: 'You can only update your own problems.' });
      return;
    }

    const { title, description, code, language, tags, difficulty, testCases } = req.body;

    // Update fields
    if (title) problem.title = title;
    if (description) problem.description = description;
    if (code) problem.code = code;
    if (language) problem.language = language;
    if (tags) problem.tags = tags;
    if (difficulty) problem.difficulty = difficulty;
    if (testCases) problem.testCases = testCases;

    await problem.save();

    res.json({
      success: true,
      message: 'Problem updated successfully.',
      data: problem,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Server error while updating problem.',
      ...(isDev && { debug: error.message }),
    });
  }
};

// ─── Delete a Problem ─────────────────────────────────────────────────────────
export const deleteProblem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const problemIdRaw = req.params.id;
    const problemId = Array.isArray(problemIdRaw) ? problemIdRaw[0] : problemIdRaw;
    const userIdRaw = req.user?.id;
    const userId = Array.isArray(userIdRaw) ? userIdRaw[0] : userIdRaw;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    if (!Types.ObjectId.isValid(problemId)) {
      res.status(400).json({ success: false, message: 'Invalid problem ID.' });
      return;
    }

    const problem = await Problem.findById(problemId);

    if (!problem) {
      res.status(404).json({ success: false, message: 'Problem not found.' });
      return;
    }

    // Check if user is the owner
    if (problem.user.toString() !== userId) {
      res.status(403).json({ success: false, message: 'You can only delete your own problems.' });
      return;
    }

    await Problem.findByIdAndDelete(problemId);

    res.json({
      success: true,
      message: 'Problem deleted successfully.',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Server error while deleting problem.',
      ...(isDev && { debug: error.message }),
    });
  }
};

// ─── Get Problems by User ─────────────────────────────────────────────────────
export const getProblemsByUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userIdRaw = req.user?.id;
    const userId = Array.isArray(userIdRaw) ? userIdRaw[0] : userIdRaw;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const problems = await Problem.find({ user: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: problems,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user problems.',
      ...(isDev && { debug: error.message }),
    });
  }
};