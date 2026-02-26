import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../lib/supabase';

const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY_DAYS = 7;

export function generateAccessToken(userId: string, email: string): string {
    return jwt.sign(
        { sub: userId, email },
        process.env.JWT_SECRET!,
        { expiresIn: ACCESS_TOKEN_EXPIRY }
    );
}

export function verifyAccessToken(token: string): { sub: string; email: string } {
    return jwt.verify(token, process.env.JWT_SECRET!) as { sub: string; email: string };
}

export async function createRefreshToken(userId: string): Promise<string> {
    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

    const { error } = await supabase.from('refresh_tokens').insert({
        token,
        user_id: userId,
        expires_at: expiresAt.toISOString(),
    });

    if (error) throw new Error(`Failed to store refresh token: ${error.message}`);
    return token;
}

export async function verifyRefreshToken(token: string) {
    const { data, error } = await supabase
        .from('refresh_tokens')
        .select('*, users(*)')
        .eq('token', token)
        .gt('expires_at', new Date().toISOString())
        .single();

    if (error || !data) return null;
    return data;
}

export async function deleteRefreshToken(token: string) {
    await supabase.from('refresh_tokens').delete().eq('token', token);
}

export async function deleteUserRefreshTokens(userId: string) {
    await supabase.from('refresh_tokens').delete().eq('user_id', userId);
}

export function generateResetToken(): string {
    return uuidv4().replace(/-/g, '') + uuidv4().replace(/-/g, '');
}

export async function createPasswordResetToken(email: string): Promise<string> {
    const token = generateResetToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiry

    // Invalidate any existing tokens for this email
    await supabase
        .from('password_reset_tokens')
        .update({ used: true })
        .eq('email', email)
        .eq('used', false);

    const { error } = await supabase.from('password_reset_tokens').insert({
        token,
        email,
        expires_at: expiresAt.toISOString(),
    });

    if (error) throw new Error(`Failed to create reset token: ${error.message}`);
    return token;
}

export async function verifyPasswordResetToken(token: string) {
    const { data, error } = await supabase
        .from('password_reset_tokens')
        .select('*')
        .eq('token', token)
        .eq('used', false)
        .gt('expires_at', new Date().toISOString())
        .single();

    if (error || !data) return null;
    return data;
}

export async function markResetTokenUsed(token: string) {
    await supabase
        .from('password_reset_tokens')
        .update({ used: true })
        .eq('token', token);
}
