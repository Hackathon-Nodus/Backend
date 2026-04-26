import { NextFunction, Response } from 'express';
import { AuthenticatedRequest } from '../types/express';
import {
    deleteNotification,
    getNotificationsForUser,
    markAllNotificationsAsRead,
    markNotificationAsRead
} from '../services/notificationService';
import { HttpError } from '../middleware/errorHandler';

export const listNotifications = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user?.id) {
            throw new HttpError(401, 'Unauthorized');
        }

        const notifications = await getNotificationsForUser(req.user.id);
        res.status(200).json(notifications);
    } catch (error) {
        next(error);
    }
};

export const readNotification = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user?.id) {
            throw new HttpError(401, 'Unauthorized');
        }

        const updated = await markNotificationAsRead(req.params.id, req.user.id);
        if (!updated) {
            throw new HttpError(404, 'Notification not found');
        }

        res.status(200).json(updated);
    } catch (error) {
        next(error);
    }
};

export const readAllNotifications = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user?.id) {
            throw new HttpError(401, 'Unauthorized');
        }

        const modifiedCount = await markAllNotificationsAsRead(req.user.id);
        res.status(200).json({ modifiedCount });
    } catch (error) {
        next(error);
    }
};

export const removeNotification = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user?.id) {
            throw new HttpError(401, 'Unauthorized');
        }

        const deleted = await deleteNotification(req.params.id, req.user.id);
        if (!deleted) {
            throw new HttpError(404, 'Notification not found');
        }

        res.status(204).send();
    } catch (error) {
        next(error);
    }
};