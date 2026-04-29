// import { Request, Response } from 'express';
// import { loginAdmin, registerAdmin } from '../services/authService';

// export const register = async (req: Request, res: Response): Promise<void> => {
//     const admin = await registerAdmin(req.body);
//     res.status(201).json(admin);
// };

// export const login = async (req: Request, res: Response): Promise<void> => {
//     const result = await loginAdmin(req.body);
//     res.status(200).json(result);
// };

import { Request, Response } from "express";
import { loginAdmin, registerAdmin } from "../services/authService";

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await registerAdmin(req.body);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: user,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await loginAdmin(req.body);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};