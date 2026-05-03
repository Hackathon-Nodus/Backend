import { Router } from 'express';
import requireAuth from '../middleware/auth';
import { getMe, getPublicProfile, updateMe } from '../controllers/userController';
import { validateUpdateProfile } from '../validations/userSchema';

const router = Router();

router.get('/me', requireAuth, getMe);
router.put('/me', requireAuth, validateUpdateProfile, updateMe);
router.get('/:id', getPublicProfile);

export default router;