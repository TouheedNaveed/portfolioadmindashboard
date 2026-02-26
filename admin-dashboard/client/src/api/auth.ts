import api from './axios';
import type { AuthResponse, User } from '@/types';

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

    updateProfile: (data: { name?: string; email?: string; currentPassword?: string; newPassword?: string }) =>
        api.patch<{ user: User }>('/auth/profile', data),

    uploadAvatar: (formData: FormData) =>
        api.post<{ user: User; avatarUrl: string }>('/auth/profile/avatar', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }),
};
