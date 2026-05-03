import { NextFunction, Request, Response } from 'express';

export const validateMatchInput = (problem: any, solvers: any[]) => {
  if (!problem) {
    throw new Error("Problem is required");
  }

  if (!solvers || !Array.isArray(solvers)) {
    throw new Error("Solvers must be an array");
  }

  const hasTitle = problem.title || problem.refinedTitle;

  if (!hasTitle) {
    throw new Error("Problem must have a title");
  }

  return true;
};

export const validateEnhancePayload = (req: Request, res: Response, next: NextFunction): void => {
  const { title, description } = req.body;

  if (typeof title !== 'string' || title.trim().length < 3) {
    res.status(400).json({ message: 'title must be at least 3 characters' });
    return;
  }

  if (typeof description !== 'string' || description.trim().length < 10) {
    res.status(400).json({ message: 'description must be at least 10 characters' });
    return;
  }

  next();
};

export const validateMatchRequest = (req: Request, res: Response, next: NextFunction): void => {
  const { problemId } = req.params;
  if (!problemId) {
    res.status(400).json({ message: 'problemId is required' });
    return;
  }

  next();
};