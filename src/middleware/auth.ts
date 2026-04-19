import { NextFunction, Response } from 'express';
import { AuthenticatedRequest } from '../types/express';

export const requireAuth = (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): void => {
    const userId = req.header('x-user-id');

    if (!userId) {
        res.status(401).json({ message: 'Unauthorized. Missing x-user-id header.' });
        return;
    }

    req.user = { id: userId };
    next();
};
