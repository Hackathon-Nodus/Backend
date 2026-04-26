import { NextFunction, Response } from 'express';
import { AuthenticatedRequest } from '../types/express';
import { getBearerToken, getTokenFromCookieHeader, verifyToken } from '../utils/tokenUtils';

export const requireAuth = (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): void => {
    const bearerToken = getBearerToken(req.header('authorization'));
    const cookieToken = getTokenFromCookieHeader(req.header('cookie'));
    const token = bearerToken || cookieToken;

    if (!token) {
        res.status(401).json({ message: 'Unauthorized. Missing bearer token.' });
        return;
    }

    try {
        const payload = verifyToken(token);
        req.user = {
            id: payload.userId,
            email: payload.email,
            role: payload.role
        };
        next();
    } catch (error) {
        res.status(401).json({ message: 'Unauthorized. Invalid or expired token.' });
    }
};

export default requireAuth;