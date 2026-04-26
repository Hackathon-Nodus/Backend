import { Document, Schema, model, Types } from 'mongoose';

export type NotificationType =
    | 'solution_matched'
    | 'ai_result_ready'
    | 'new_ranking'
    | 'system';

export interface INotification extends Document {
    userId: Types.ObjectId;
    type: NotificationType;
    message: string;
    read: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true
        },
        type: {
            type: String,
            enum: ['solution_matched', 'ai_result_ready', 'new_ranking', 'system'],
            required: true
        },
        message: {
            type: String,
            required: true,
            trim: true,
            maxlength: 500
        },
        read: {
            type: Boolean,
            default: false,
            index: true
        }
    },
    {
        timestamps: true
    }
);

notificationSchema.index({ userId: 1, createdAt: -1 });

export const Notification = model<INotification>('Notification', notificationSchema);
export default Notification;