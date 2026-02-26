import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/api/auth';
import type { User } from '@/types';

export function useAuth() {
    const { user, accessToken, setAuth, clearAuth } = useAuthStore();
    const navigate = useNavigate();

    const login = useCallback(
        async (email: string, password: string) => {
            const { data } = await authApi.login({ email, password });
            setAuth(data.user as User, data.accessToken);
            navigate('/dashboard');
        },
        [setAuth, navigate]
    );

    const signup = useCallback(
        async (name: string, email: string, password: string, adminSecret: string) => {
            const { data } = await authApi.signup({ name, email, password, adminSecret });
            setAuth(data.user as User, data.accessToken);
            navigate('/dashboard');
        },
        [setAuth, navigate]
    );

    const logout = useCallback(async () => {
        try {
            await authApi.logout();
        } finally {
            clearAuth();
            navigate('/login');
        }
    }, [clearAuth, navigate]);

    return { user, accessToken, isAuthenticated: !!accessToken, login, signup, logout, setAuth };
}
