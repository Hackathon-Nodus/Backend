import express from 'express';
import {
  register,
  login,
  logout,
  getMe,
  refreshToken,
  updateProfile
} from '../controllers/authController.js';
import { protect, authorize, authRateLimit } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes with rate limiting
router.post('/register', authRateLimit(5), register);
router.post('/login', authRateLimit(5), login);
router.post('/refresh-token', authRateLimit(10), refreshToken);

// Protected routes
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

// Admin only routes (example)
router.get('/admin/users', protect, authorize('admin'), async (req, res, next) => {
  try {
    // This is just an example - you can implement actual admin routes
    res.status(200).json({ success: true, message: 'Admin access granted' });
  } catch (err) {
    next(err);
  }
});

export default router;