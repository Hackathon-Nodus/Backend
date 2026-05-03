import { NextFunction, Request, Response } from 'express';

const isStringArray = (value: unknown): value is string[] => {
    return Array.isArray(value) && value.every((item) => typeof item === 'string');
};

export const validateUpdateProfile = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const { displayName, bio, skills } = req.body;

    if (displayName !== undefined) {
        if (typeof displayName !== 'string' || displayName.trim().length === 0) {
            res.status(400).json({ message: 'displayName must be a non-empty string' });
            return;
        }

        if (displayName.trim().length > 50) {
            res.status(400).json({ message: 'displayName must be at most 50 characters' });
            return;
        }
    }

    if (bio !== undefined) {
        if (typeof bio !== 'string') {
            res.status(400).json({ message: 'bio must be a string' });
            return;
        }

        if (bio.trim().length > 300) {
            res.status(400).json({ message: 'bio must be at most 300 characters' });
            return;
        }
    }

    if (skills !== undefined) {
        if (!isStringArray(skills)) {
            res.status(400).json({ message: 'skills must be an array of strings' });
            return;
        }

        if (skills.length > 10) {
            res.status(400).json({ message: 'skills can include at most 10 items' });
            return;
        }
    }

    next();
};