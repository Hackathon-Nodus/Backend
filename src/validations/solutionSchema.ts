import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';

const isNonEmptyString = (value: unknown): value is string => {
    return typeof value === 'string' && value.trim().length > 0;
};

export const validateSubmitSolution = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const { problemId, content, link } = req.body;

    if (!isNonEmptyString(problemId)) {
        res.status(400).json({ message: 'problemId is required' });
        return;
    }

    if (!Types.ObjectId.isValid(problemId)) {
        res.status(400).json({ message: 'problemId must be a valid ObjectId' });
        return;
    }

    if (!isNonEmptyString(content)) {
        res.status(400).json({ message: 'content is required' });
        return;
    }

    if (content.trim().length < 10) {
        res.status(400).json({ message: 'content must be at least 10 characters' });
        return;
    }

    if (link !== undefined && link !== null && typeof link !== 'string') {
        res.status(400).json({ message: 'link must be a string when provided' });
        return;
    }

    next();
};
