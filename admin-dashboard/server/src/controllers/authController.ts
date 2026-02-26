import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { supabase } from '../lib/supabase';
import {
    generateAccessToken,
    createRefreshToken,
    verifyRefreshToken,
    deleteRefreshToken,
    deleteUserRefreshTokens,
    createPasswordResetToken,
    verifyPasswordResetToken,
    markResetTokenUsed,
} from '../services/tokenService';
import { sendPasswordResetEmail } from '../services/emailService';

const REFRESH_COOKIE = 'refresh_token';
const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' as const : 'lax' as const,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
};

// POST /api/auth/signup
export async function signup(req: Request, res: Response): Promise<void> {
    const { name, email, password, adminSecret } = req.body;

    if (!name || !email || !password || !adminSecret) {
        res.status(400).json({ error: 'All fields are required' });
        return;
    }

    if (adminSecret !== process.env.ADMIN_SECRET) {
        res.status(403).json({ error: 'Invalid admin secret' });
        return;
    }

    // Check if user already exists
    const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('email', email.toLowerCase())
        .single();

    if (existing) {
        res.status(409).json({ error: 'An account with this email already exists' });
        return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const { data: user, error } = await supabase
        .from('users')
        .insert({ name, email: email.toLowerCase(), password_hash: passwordHash })
        .select('id, name, email, created_at')
        .single();

    if (error || !user) {
        res.status(500).json({ error: 'Failed to create account' });
        return;
    }

    const accessToken = generateAccessToken(user.id, user.email);
    const refreshToken = await createRefreshToken(user.id);

    res.cookie(REFRESH_COOKIE, refreshToken, COOKIE_OPTIONS);
    res.status(201).json({ user: { id: user.id, name: user.name, email: user.email }, accessToken });
}

// POST /api/auth/login
export async function login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required' });
        return;
    }

    const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('email', email.toLowerCase())
        .single();

    if (!user) {
        res.status(401).json({ error: 'Invalid email or password' });
        return;
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
        res.status(401).json({ error: 'Invalid email or password' });
        return;
    }

    const accessToken = generateAccessToken(user.id, user.email);
    const refreshToken = await createRefreshToken(user.id);

    res.cookie(REFRESH_COOKIE, refreshToken, COOKIE_OPTIONS);
    res.json({ user: { id: user.id, name: user.name, email: user.email }, accessToken });
}

// POST /api/auth/refresh
export async function refresh(req: Request, res: Response): Promise<void> {
    const token = req.cookies[REFRESH_COOKIE];
    if (!token) {
        res.status(401).json({ error: 'No refresh token provided' });
        return;
    }

    const tokenData = await verifyRefreshToken(token);
    if (!tokenData) {
        res.clearCookie(REFRESH_COOKIE);
        res.status(401).json({ error: 'Invalid or expired refresh token' });
        return;
    }

    // Rotate: delete old, create new
    await deleteRefreshToken(token);
    const newRefreshToken = await createRefreshToken(tokenData.user_id);
    const accessToken = generateAccessToken(tokenData.user_id, tokenData.users.email);

    res.cookie(REFRESH_COOKIE, newRefreshToken, COOKIE_OPTIONS);
    res.json({ accessToken });
}

// POST /api/auth/logout
export async function logout(req: Request, res: Response): Promise<void> {
    const token = req.cookies[REFRESH_COOKIE];
    if (token) {
        await deleteRefreshToken(token);
    }
    res.clearCookie(REFRESH_COOKIE);
    res.json({ message: 'Logged out successfully' });
}

// POST /api/auth/forgot-password
export async function forgotPassword(req: Request, res: Response): Promise<void> {
    const { email } = req.body;
    if (!email) {
        res.status(400).json({ error: 'Email is required' });
        return;
    }

    // Always respond 200 to avoid email enumeration
    const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('email', email.toLowerCase())
        .single();

    if (user) {
        try {
            const token = await createPasswordResetToken(email.toLowerCase());
            await sendPasswordResetEmail(email.toLowerCase(), token);
        } catch (err) {
            console.error('Error sending reset email:', err);
        }
    }

    res.json({ message: 'If an account with that email exists, a reset link has been sent.' });
}

// GET /api/auth/verify-reset-token/:token
export async function verifyResetToken(req: Request, res: Response): Promise<void> {
    const token = req.params.token as string;
    const data = await verifyPasswordResetToken(token);
    res.json({ valid: !!data });
}

// POST /api/auth/reset-password
export async function resetPassword(req: Request, res: Response): Promise<void> {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
        res.status(400).json({ error: 'Token and newPassword are required' });
        return;
    }

    const tokenData = await verifyPasswordResetToken(token);
    if (!tokenData) {
        res.status(400).json({ error: 'Invalid or expired reset token' });
        return;
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    const { error } = await supabase
        .from('users')
        .update({ password_hash: passwordHash })
        .eq('email', tokenData.email);

    if (error) {
        res.status(500).json({ error: 'Failed to update password' });
        return;
    }

    await markResetTokenUsed(token);

    // Invalidate all refresh tokens for this user
    const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('email', tokenData.email)
        .single();

    if (user) await deleteUserRefreshTokens(user.id);

    res.json({ message: 'Password reset successfully' });
}
