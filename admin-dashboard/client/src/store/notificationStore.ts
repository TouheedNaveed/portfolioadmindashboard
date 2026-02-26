import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Contact } from '@/types';

interface NotificationState {
    notifications: Contact[];
    unreadCount: number;
    lastChecked: number; // epoch ms
    setNotifications: (contacts: Contact[]) => void;
    markAllRead: () => void;
    markRead: (id: string) => void;
    setLastChecked: (ts: number) => void;
}

export const useNotificationStore = create<NotificationState>()(
    persist(
        (set, get) => ({
            notifications: [],
            unreadCount: 0,
            lastChecked: 0,

            setNotifications: (contacts: Contact[]) => {
                // Only contacts that arrived after lastChecked are truly "new"
                const lastChecked = get().lastChecked;
                const newOnes = contacts.filter(
                    (c) => !c.read && new Date(c.created_at).getTime() > lastChecked
                );
                set({ notifications: contacts.slice(0, 20), unreadCount: newOnes.length });
            },

            markRead: (id: string) => {
                const updated = get().notifications.map((n) =>
                    n.id === id ? { ...n, read: true } : n
                );
                const unreadCount = updated.filter((n) => !n.read).length;
                set({ notifications: updated, unreadCount });
            },

            markAllRead: () => {
                const updated = get().notifications.map((n) => ({ ...n, read: true }));
                set({ notifications: updated, unreadCount: 0, lastChecked: Date.now() });
            },

            setLastChecked: (ts: number) => set({ lastChecked: ts }),
        }),
        { name: 'admin-notifications', partialize: (s) => ({ lastChecked: s.lastChecked }) }
    )
);
