import jwt from 'jsonwebtoken';
import { Response } from 'express';
import { JWT_SECRET, JWT_EXPIRES_IN, NODE_ENV } from '../config/env';
import { TokenPayload } from '../types/express';

export const generateToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn']
  });
};

export const generateUserToken = (userId: string, email?: string, role?: string): string => {
  const payload: TokenPayload = {
    userId,
    email,
    role
  };

  return generateToken(payload);
};

export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
};

export const getBearerToken = (authorizationHeader?: string): string | null => {
  if (!authorizationHeader) {
    return null;
  }

  const [scheme, token] = authorizationHeader.split(' ');
  if (scheme?.toLowerCase() !== 'bearer' || !token) {
    return null;
  }

  return token;
};

export const getTokenFromCookieHeader = (cookieHeader?: string): string | null => {
  if (!cookieHeader) {
    return null;
  }

  const entries = cookieHeader.split(';').map((entry) => entry.trim());
  const accessToken = entries.find((entry) => entry.startsWith('access_token='));

  if (!accessToken) {
    return null;
  }

  return decodeURIComponent(accessToken.replace('access_token=', ''));
};

export const setTokenCookie = (res: Response, token: string): void => {
  res.cookie('access_token', token, {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    httpOnly: true,
    sameSite: 'lax',
    secure: NODE_ENV === 'production',
    path: '/'
  });
};

export const clearTokenCookie = (res: Response): void => {
  res.cookie('access_token', '', {
    maxAge: 0,
    httpOnly: true,
    path: '/'
  });
};