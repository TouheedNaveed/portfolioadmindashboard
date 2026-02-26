import { Router } from 'express';
import {
    signup,
    login,
    refresh,
    logout,
    forgotPassword,
    verifyResetToken,
    resetPassword,
} from '../controllers/authController';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.get('/verify-reset-token/:token', verifyResetToken);
router.post('/reset-password', resetPassword);

export default router;
