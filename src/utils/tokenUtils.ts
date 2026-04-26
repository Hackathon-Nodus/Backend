import jwt from 'jsonwebtoken';
import { Response } from 'express';
import { JWT_SECRET, JWT_EXPIRE, NODE_ENV } from '../config/env.js';
import { TokenPayload } from '../types/express.js';

export const generateToken = (userId: string): string => {
  const payload: TokenPayload = {
    user_id: userId,
    type: 'access'
  };
  
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRE as jwt.SignOptions['expiresIn']
  });
};

export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
};

export const setTokenCookie = (res: Response, token: string): void => {
  res.cookie('access_token', token, {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    httpOnly: true,
    sameSite: 'lax',
    secure: NODE_ENV === 'production',
    path: '/',
    domain: NODE_ENV === 'production' ? '.yourdomain.com' : undefined
  });
};

export const clearTokenCookie = (res: Response): void => {
  res.cookie('access_token', '', {
    maxAge: 0,
    httpOnly: true,
    path: '/'
  });
};