import { Router } from 'express';
import requireAuth from '../middleware/auth';
import {
    listNotifications,
    readAllNotifications,
    readNotification,
    removeNotification
} from '../controllers/notificationController';

const router = Router();

router.get('/', requireAuth, listNotifications);
router.patch('/read-all', requireAuth, readAllNotifications);
router.patch('/:id/read', requireAuth, readNotification);
router.delete('/:id', requireAuth, removeNotification);

export default router;