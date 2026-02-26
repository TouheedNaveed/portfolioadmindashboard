import api from './axios';
import type { AuthResponse } from '@/types';

export const authApi = {
    signup: (data: { name: string; email: string; password: string; adminSecret: string }) =>
        api.post<AuthResponse>('/auth/signup', data),

    login: (data: { email: string; password: string }) =>
        api.post<AuthResponse>('/auth/login', data),

    refresh: () => api.post<{ accessToken: string }>('/auth/refresh'),

    logout: () => api.post('/auth/logout'),

    forgotPassword: (email: string) =>
        api.post<{ message: string }>('/auth/forgot-password', { email }),

    verifyResetToken: (token: string) =>
        api.get<{ valid: boolean }>(`/auth/verify-reset-token/${token}`),

    resetPassword: (token: string, newPassword: string) =>
        api.post<{ message: string }>('/auth/reset-password', { token, newPassword }),
};
