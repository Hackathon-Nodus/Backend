import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email?: string;
  };
}

export const requireAuth = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
      return;
    }

    const token = authHeader.split(' ')[1];

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not configured');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;
    req.user = { id: decoded.id, email: decoded.email };
    next();

  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      res.status(401).json({ success: false, message: 'Token has expired. Please login again.' });
      return;
    }
    if (error.name === 'JsonWebTokenError') {
      res.status(401).json({ success: false, message: 'Invalid token.' });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};