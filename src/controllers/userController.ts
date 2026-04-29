import { NextFunction, Request, Response } from 'express';
import { AuthenticatedRequest } from '../types/express';
import {
    getCurrentUserProfile,
    getPublicUserProfile,
    updateCurrentUserProfile
} from '../services/userService';
import { HttpError } from '../middleware/errorHandler';

export const getMe = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user?.id) {
            throw new HttpError(401, 'Unauthorized');
        }

        const profile = await getCurrentUserProfile(req.user.id);
        if (!profile) {
            throw new HttpError(404, 'User not found');
        }

        res.status(200).json(profile);
    } catch (error) {
        next(error);
    }
};

export const updateMe = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user?.id) {
            throw new HttpError(401, 'Unauthorized');
        }

        const profile = await updateCurrentUserProfile(req.user.id, req.body);
        if (!profile) {
            throw new HttpError(404, 'User not found');
        }

        res.status(200).json(profile);
    } catch (error) {
        next(error);
    }
};

export const getPublicProfile = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const profile = await getPublicUserProfile(req.params.id);
        if (!profile) {
            throw new HttpError(404, 'User not found');
        }

        res.status(200).json(profile);
    } catch (error) {
        next(error);
    }
};