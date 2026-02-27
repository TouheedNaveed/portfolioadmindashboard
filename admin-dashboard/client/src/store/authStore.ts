import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';

interface AuthState {
    user: User | null;
    accessToken: string | null;
    _hasHydrated: boolean;
    setAuth: (user: User | null, token: string) => void;
    clearAuth: () => void;
    setHasHydrated: (v: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            accessToken: null,
            _hasHydrated: false,
            setAuth: (user, accessToken) => set({ user, accessToken }),
            clearAuth: () => set({ user: null, accessToken: null }),
            setHasHydrated: (v) => set({ _hasHydrated: v }),
        }),
        {
            name: 'admin-auth',
            partialize: (state) => ({ user: state.user, accessToken: state.accessToken }),
            // Called once localStorage values have been restored into the store
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true);
            },
        }
    )
);
