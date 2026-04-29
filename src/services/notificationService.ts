import { Types } from 'mongoose';
import Notification, { INotification, NotificationType } from '../models/Notification';

export const createNotification = async (
    userId: string,
    type: NotificationType,
    message: string
): Promise<INotification> => {
    return Notification.create({
        userId: new Types.ObjectId(userId),
        type,
        message
    });
};

export const getNotificationsForUser = async (userId: string): Promise<INotification[]> => {
    return Notification.find({ userId: new Types.ObjectId(userId) }).sort({ createdAt: -1 });
};

export const markNotificationAsRead = async (
    notificationId: string,
    userId: string
): Promise<INotification | null> => {
    return Notification.findOneAndUpdate(
        {
            _id: new Types.ObjectId(notificationId),
            userId: new Types.ObjectId(userId)
        },
        { read: true },
        { new: true }
    );
};

export const markAllNotificationsAsRead = async (userId: string): Promise<number> => {
    const result = await Notification.updateMany(
        { userId: new Types.ObjectId(userId), read: false },
        { read: true }
    );

    return result.modifiedCount;
};

export const deleteNotification = async (
    notificationId: string,
    userId: string
): Promise<boolean> => {
    const result = await Notification.findOneAndDelete({
        _id: new Types.ObjectId(notificationId),
        userId: new Types.ObjectId(userId)
    });

    return Boolean(result);
};