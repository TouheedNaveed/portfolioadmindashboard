import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
    withCredentials: true,
});

// Attach access token
api.interceptors.request.use((config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Auto-refresh on 401
let isRefreshing = false;
let failedQueue: Array<{ resolve: (v: string) => void; reject: (e: unknown) => void }> = [];

const processQueue = (error: unknown, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) prom.reject(error);
        else prom.resolve(token!);
    });
    failedQueue = [];
};

api.interceptors.response.use(
    (res) => res,
    async (error) => {
        const originalRequest = error.config;

        // ⚡ Never attempt token refresh for auth endpoints themselves.
        // Without this guard, a wrong-password login 401 triggers the refresh
        // flow, which also fails, and then does window.location.href = '/login'
        // causing a full page reload instead of showing the error message.
        const isAuthUrl = originalRequest?.url?.includes('/auth/login') ||
            originalRequest?.url?.includes('/auth/signup') ||
            originalRequest?.url?.includes('/auth/refresh') ||
            originalRequest?.url?.includes('/auth/logout');

        if (error.response?.status === 401 && !originalRequest._retry && !isAuthUrl) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then((token) => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return api(originalRequest);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const { data } = await axios.post('/api/auth/refresh', {}, { withCredentials: true });
                const { accessToken } = data;
                useAuthStore.getState().setAuth(useAuthStore.getState().user, accessToken);
                processQueue(null, accessToken);
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return api(originalRequest);
            } catch (err) {
                processQueue(err, null);
                useAuthStore.getState().clearAuth();
                window.location.href = '/login';
                return Promise.reject(err);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;
