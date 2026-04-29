

import { Request, Response, NextFunction } from 'express';

// Extend Express Request type
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email: string;
                name: string;
                roles: string[];
            };
        }
    }
}

// Simple auth without JWT for now (since your teammate's code doesn't use JWT)
export const requireAuth = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    // Get user ID from header (as per your teammate's implementation)
    const userId = req.headers['x-user-id'] as string;
    
    if (!userId) {
        res.status(401).json({ 
            success: false,
            message: 'Unauthorized. Missing x-user-id header.' 
        });
        return;
    }

    // Add user to request
    req.user = { 
        id: userId,
        email: '',
        name: '',
        roles: ['client']
    };
    next();
};

export default requireAuth;