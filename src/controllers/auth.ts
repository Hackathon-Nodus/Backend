import { Request, Response } from 'express';
import { loginAdmin, registerAdmin } from '../services/authService';

export const register = async (req: Request, res: Response): Promise<void> => {
    const admin = await registerAdmin(req.body);
    res.status(201).json(admin);
};

export const login = async (req: Request, res: Response): Promise<void> => {
    const result = await loginAdmin(req.body);
    res.status(200).json(result);
};
