import { Request, Response } from 'express';
import { getSolutionsByProblem, submitSolution } from '../services/solutionService';

export const submit = async (req: Request, res: Response): Promise<void> => {
    try {
        const created = await submitSolution({
            problemId: req.body.problemId,
            content: req.body.content,
            link: req.body.link
        });

        res.status(201).json(created);
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to create solution';
        res.status(500).json({ message });
    }
};

export const listByProblem = async (req: Request, res: Response): Promise<void> => {
    try {
        const { problemId } = req.params;
        const solutions = await getSolutionsByProblem(problemId);
        res.status(200).json(solutions);
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to fetch solutions';
        res.status(500).json({ message });
    }
};
