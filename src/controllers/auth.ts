import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { Types } from 'mongoose';
import { AuthRequest } from '../middleware/auth';

const isDev = process.env.NODE_ENV === 'development';

// ─── Register ─────────────────────────────────────────────────────────────────
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      res.status(400).json({ success: false, message: 'All fields are required.' });
      return;
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      res.status(400).json({ success: false, message: 'User already exists.' });
      return;
    }

    const user = new User({ username, email, password });
    await user.save();

    res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      data: {
        user: { id: user._id, username: user.username, email: user.email },
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Server error while registering user.',
      ...(isDev && { debug: error.message }),
    });
  }
};

// ─── Login ───────────────────────────────────────────────────────────────────
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email and password are required.' });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid credentials.' });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid credentials.' });
      return;
    }

    // ✅ CREATE TOKEN HERE
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET as string,
      { expiresIn: '1d' }
    );

    // ✅ RETURN TOKEN
    res.json({
      success: true,
      message: 'Login successful.',
      data: {
        token, // 👈 IMPORTANT
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
        },
      },
    });

  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Server error while logging in.',
      ...(isDev && { debug: error.message }),
    });
  }
};

// ─── Get Current User ───────────────────────────────────────────────────────
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const user = await User.findById(userId).select('-password');
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user.',
      ...(isDev && { debug: error.message }),
    });
  }
};

// ─── Logout ─────────────────────────────────────────────────────────────────
export const logout = async (_req: AuthRequest, res: Response): Promise<void> => {
  res.json({
    success: true,
    message: 'Logout successful.',
  });
};