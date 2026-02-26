import { useEffect, useRef } from 'react';
import { contactsApi } from '@/api/contacts';
import { useNotificationStore } from '@/store/notificationStore';

const POLL_INTERVAL_MS = 60_000; // 1 minute

/**
 * useNotifications – Polls the contacts API for unread messages.
 * Call once near the root of the authenticated layout (DashboardLayout).
 */
export function useNotifications() {
    const setNotifications = useNotificationStore((s) => s.setNotifications);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const poll = async () => {
        try {
            const { data } = await contactsApi.list({ page: 1, read: false });
            setNotifications(data.contacts);
        } catch {
            // silently ignore – don't disrupt UX on network blip
        }
    };

    useEffect(() => {
        poll(); // immediate first load
        timerRef.current = setInterval(poll, POLL_INTERVAL_MS);
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);
}
