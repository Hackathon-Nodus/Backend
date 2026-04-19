import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { User, IUser } from '../models/User.js';
import { generateToken, setTokenCookie, clearTokenCookie, verifyToken } from '../utils/tokenUtils.js';
import { AppError } from '../middleware/errorMiddleware.js';
import { RegisterInput, LoginInput, ApiResponse } from '../types/express.js';

export const register = async (
  req: Request<{}, {}, RegisterInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, password, gender, dateOfBirth, height, weight, fitnessGoal } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      throw new AppError('Name, email and password are required', 400);
    }

    if (password.length < 6) {
      throw new AppError('Password must be at least 6 characters', 400);
    }

    // Check for existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError('Email already exists', 409);
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      gender,
      dateOfBirth,
      height,
      weight,
      fitnessGoal
    });

    // Generate token and set cookie
    const token = generateToken(user._id as string);
    setTokenCookie(res, token);

    const response: ApiResponse<{ user: Partial<IUser>; token: string }> = {
      success: true,
      message: 'User registered successfully',
      data: {
        user: user.toJSON(),
        token
      }
    };

    res.status(201).json(response);
  } catch (err) {
    next(err);
  }
};

export const login = async (
  req: Request<{}, {}, LoginInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError('Email and password are required', 400);
    }

    // Find user with password field
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    // Check if user is active
    if (!user.isActive) {
      throw new AppError('Account has been deactivated. Please contact support.', 401);
    }

    // Compare passwords
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    
    if (!isPasswordMatch) {
      throw new AppError('Invalid credentials', 401);
    }

    // Generate token and set cookie
    const token = generateToken(user._id as string);
    setTokenCookie(res, token);

    const response: ApiResponse<{ user: Partial<IUser>; token: string }> = {
      success: true,
      message: 'Login successful',
      data: {
        user: user.toJSON(),
        token
      }
    };

    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    clearTokenCookie(res);
    
    const response: ApiResponse = {
      success: true,
      message: 'Logout successful'
    };

    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
};

export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await User.findById(req.user?._id).select('-password');
    
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const response: ApiResponse<{ user: Partial<IUser> }> = {
      success: true,
      data: {
        user: user.toJSON()
      }
    };

    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
};

export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.cookies.access_token;
    
    if (!token) {
      throw new AppError('No token provided', 401);
    }

    const decoded = verifyToken(token);
    const newToken = generateToken(decoded.user_id);
    setTokenCookie(res, newToken);

    const response: ApiResponse<{ token: string }> = {
      success: true,
      message: 'Token refreshed successfully',
      data: { token: newToken }
    };

    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const allowedUpdates = ['name', 'gender', 'dateOfBirth', 'height', 'weight', 'fitnessGoal'];
    const updates = Object.keys(req.body)
      .filter(key => allowedUpdates.includes(key))
      .reduce((obj: any, key) => {
        obj[key] = req.body[key];
        return obj;
      }, {});

    const user = await User.findByIdAndUpdate(
      req.user?._id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const response: ApiResponse<{ user: Partial<IUser> }> = {
      success: true,
      message: 'Profile updated successfully',
      data: { user: user.toJSON() }
    };

    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
};