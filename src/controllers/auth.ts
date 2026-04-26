import { NextFunction, Request, Response } from 'express';
import { loginAdmin, registerAdmin } from '../services/authService';
import { setTokenCookie } from '../utils/tokenUtils';

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const result = await registerAdmin(req.body);
        setTokenCookie(res, result.token);
        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const result = await loginAdmin(req.body);
        setTokenCookie(res, result.token);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};
