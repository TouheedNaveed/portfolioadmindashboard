import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

export function ProtectedRoute() {
    const accessToken = useAuthStore((s) => s.accessToken);
    const hasHydrated = useAuthStore((s) => s._hasHydrated);

    // Wait for Zustand persist to rehydrate from localStorage before deciding.
    // Without this guard, the store starts with accessToken=null on every mount,
    // causing ProtectedRoute to redirect to /login before the stored token loads.
    // This was the root cause of the blank-screen-until-refresh bug.
    if (!hasHydrated) {
        return (
            <div style={{
                position: 'fixed',
                inset: 0,
                background: '#0C0C0E',
                zIndex: 50,
            }} />
        );
    }

    if (!accessToken) return <Navigate to="/login" replace />;
    return <Outlet />;
}
