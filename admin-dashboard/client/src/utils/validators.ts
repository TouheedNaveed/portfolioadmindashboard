import { z } from 'zod';

export const loginSchema = z.object({
    email: z.string().email('Enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const signupSchema = z
    .object({
        name: z.string().min(2, 'Name must be at least 2 characters'),
        email: z.string().email('Enter a valid email address'),
        password: z
            .string()
            .min(8, 'At least 8 characters')
            .regex(/[A-Z]/, 'At least one uppercase letter')
            .regex(/[0-9]/, 'At least one number')
            .regex(/[^A-Za-z0-9]/, 'At least one special character'),
        confirmPassword: z.string(),
        adminSecret: z.string().min(1, 'Admin code required'),
    })
    .refine((d) => d.password === d.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
    });

export const forgotSchema = z.object({
    email: z.string().email('Enter a valid email address'),
});

export const resetSchema = z
    .object({
        newPassword: z
            .string()
            .min(8, 'At least 8 characters')
            .regex(/[A-Z]/, 'At least one uppercase letter')
            .regex(/[0-9]/, 'At least one number')
            .regex(/[^A-Za-z0-9]/, 'At least one special character'),
        confirmPassword: z.string(),
    })
    .refine((d) => d.newPassword === d.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
    });

export type LoginForm = z.infer<typeof loginSchema>;
export type SignupForm = z.infer<typeof signupSchema>;
export type ForgotForm = z.infer<typeof forgotSchema>;
export type ResetForm = z.infer<typeof resetSchema>;

export function getPasswordStrength(password: string): number {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
}
