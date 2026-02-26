import { Router } from 'express';
import multer from 'multer';
import {
    signup,
    login,
    refresh,
    logout,
    forgotPassword,
    verifyResetToken,
    resetPassword,
    updateProfile,
    uploadAvatar
} from '../controllers/authController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Public auth routes
router.post('/signup', signup);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.get('/verify-reset-token/:token', verifyResetToken);
router.post('/reset-password', resetPassword);

// Protected profile routes
router.patch('/profile', authMiddleware, updateProfile);
router.post('/profile/avatar', authMiddleware, upload.single('avatar'), uploadAvatar);

export default router;
