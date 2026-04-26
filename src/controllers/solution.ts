import { NextFunction, Response } from 'express';
import { getSolutionsByProblem, submitSolution } from '../services/solutionService';
import { AuthenticatedRequest } from '../types/express';
import { HttpError } from '../middleware/errorHandler';

export const submit = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user?.id) {
            throw new HttpError(401, 'Unauthorized');
        }

        const created = await submitSolution({
            problemId: req.body.problemId,
            createdBy: req.user.id,
            content: req.body.content,
            link: req.body.link
        });

        res.status(201).json(created);
    } catch (error) {
        next(error);
    }
};

export const listByProblem = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const problemId = req.params.problemId || String(req.query.problemId || '');
        if (!problemId) {
            throw new HttpError(400, 'problemId is required');
        }

        const solutions = await getSolutionsByProblem(problemId);
        res.status(200).json(solutions);
    } catch (error) {
        next(error);
    }
};
