import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, X, MessageSquare, CheckCheck, ExternalLink } from 'lucide-react';
import { useNotificationStore } from '@/store/notificationStore';
import { contactsApi } from '@/api/contacts';
import { formatRelative, truncateText } from '@/utils/formatters';

const panelStyles = `
.notif-dropdown {
    position: absolute;
    top: calc(100% + 10px);
    right: 0;
    width: 360px;
    max-height: 480px;
    border-radius: 14px;
    background: #18181E;
    border: 1px solid rgba(255,255,255,0.09);
    box-shadow: 0 20px 60px rgba(0,0,0,0.5);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    z-index: 9999;
}
@media (max-width: 520px) {
    .notif-dropdown {
        position: fixed;
        top: 70px;
        left: 12px;
        right: 12px;
        width: auto;
        max-height: calc(100dvh - 90px);
        border-radius: 12px;
    }
}
`;

export function NotificationPanel() {
    const [isOpen, setIsOpen] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    const notifications = useNotificationStore((s) => s.notifications);
    const unreadCount = useNotificationStore((s) => s.unreadCount);
    const markAllRead = useNotificationStore((s) => s.markAllRead);
    const markRead = useNotificationStore((s) => s.markRead);

    // Close on outside click
    useEffect(() => {
        if (!isOpen) return;
        const handler = (e: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [isOpen]);

    // Close on Escape
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsOpen(false);
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, []);

    const handleMarkAllRead = async () => {
        const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);
        markAllRead();
        if (unreadIds.length > 0) {
            try { await contactsApi.bulkRead(unreadIds, true); } catch { /* silent */ }
        }
    };

    const handleItemClick = async (id: string) => {
        markRead(id);
        setIsOpen(false);
        try { await contactsApi.updateRead(id, true); } catch { /* silent */ }
        navigate(`/dashboard/contacts/${id}`);
    };

    return (
        <div ref={panelRef} style={{ position: 'relative' }}>
            <style>{panelStyles}</style>

            {/* ── Bell button ────────────────────────────── */}
            <button
                onClick={() => setIsOpen((p) => !p)}
                aria-label={unreadCount > 0 ? `${unreadCount} unread notifications` : 'No unread notifications'}
                aria-haspopup="true"
                aria-expanded={isOpen}
                style={{
                    position: 'relative',
                    background: isOpen ? 'rgba(255,255,255,0.08)' : 'none',
                    border: `1px solid ${isOpen ? 'rgba(255,255,255,0.1)' : 'transparent'}`,
                    cursor: 'pointer',
                    color: unreadCount > 0 ? '#fff' : 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 36,
                    height: 36,
                    borderRadius: 9,
                    transition: 'all 0.15s ease',
                }}
            >
                <Bell size={17} />
                {unreadCount > 0 && (
                    <span
                        aria-hidden="true"
                        style={{
                            position: 'absolute',
                            top: -4,
                            right: -4,
                            minWidth: 16,
                            height: 16,
                            borderRadius: 99,
                            background: 'linear-gradient(135deg, #E03FD8, #8B3FE8)',
                            color: '#fff',
                            fontSize: 9,
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '0 4px',
                            boxShadow: '0 0 0 2px #0C0C0E',
                        }}
                    >
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* ── Dropdown ───────────────────────────────── */}
            {isOpen && (
                <div className="notif-dropdown" role="dialog" aria-label="Notifications">

                    {/* Header */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '13px 16px',
                        borderBottom: '1px solid rgba(255,255,255,0.07)',
                        flexShrink: 0,
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                                Notifications
                            </span>
                            {unreadCount > 0 && (
                                <span style={{
                                    fontSize: 11,
                                    fontWeight: 600,
                                    padding: '2px 7px',
                                    borderRadius: 99,
                                    background: 'rgba(139,63,232,0.15)',
                                    color: '#8B3FE8',
                                }}>
                                    {unreadCount} new
                                </span>
                            )}
                        </div>
                        <div style={{ display: 'flex', gap: 4 }}>
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllRead}
                                    title="Mark all as read"
                                    aria-label="Mark all as read"
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', padding: 6, borderRadius: 6 }}
                                >
                                    <CheckCheck size={15} />
                                </button>
                            )}
                            <button
                                onClick={() => setIsOpen(false)}
                                aria-label="Close notifications"
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: 6, borderRadius: 6 }}
                            >
                                <X size={15} />
                            </button>
                        </div>
                    </div>

                    {/* List */}
                    <div style={{ overflowY: 'auto', flex: 1, overflowX: 'hidden' }}>
                        {notifications.length === 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', gap: 12, color: 'var(--text-muted)' }}>
                                <Bell size={28} style={{ opacity: 0.3 }} />
                                <p style={{ fontSize: 13, textAlign: 'center', lineHeight: 1.6, margin: 0 }}>
                                    No new messages.<br />You're all caught up!
                                </p>
                            </div>
                        ) : (
                            notifications.map((n) => (
                                <button
                                    key={n.id}
                                    onClick={() => handleItemClick(n.id)}
                                    style={{
                                        display: 'flex',
                                        width: '100%',
                                        gap: 12,
                                        padding: '12px 16px',
                                        border: 'none',
                                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                                        borderLeft: n.read ? '3px solid transparent' : '3px solid #8B3FE8',
                                        background: n.read ? 'transparent' : 'rgba(139,63,232,0.04)',
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        transition: 'background 0.15s ease',
                                    }}
                                    aria-label={`Message from ${n.name}`}
                                >
                                    <div style={{
                                        width: 34,
                                        height: 34,
                                        borderRadius: '50%',
                                        background: n.read ? 'rgba(255,255,255,0.05)' : 'rgba(139,63,232,0.12)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0,
                                        color: n.read ? 'var(--text-muted)' : '#8B3FE8',
                                        marginTop: 2,
                                    }}>
                                        <MessageSquare size={14} />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 3 }}>
                                            <span style={{
                                                fontSize: 13,
                                                fontWeight: n.read ? 500 : 600,
                                                color: n.read ? 'var(--text-secondary)' : 'var(--text-primary)',
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                maxWidth: 170,
                                            }}>
                                                {n.name}
                                            </span>
                                            <span style={{ fontSize: 10, color: 'var(--text-muted)', flexShrink: 0, marginLeft: 8 }}>
                                                {formatRelative(n.created_at)}
                                            </span>
                                        </div>
                                        <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {truncateText(n.message, 55)}
                                        </p>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <button
                            onClick={() => { setIsOpen(false); navigate('/dashboard/contacts?read=false'); }}
                            aria-label="View all messages"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 6,
                                padding: '12px',
                                borderTop: '1px solid rgba(255,255,255,0.07)',
                                borderLeft: 'none',
                                borderRight: 'none',
                                borderBottom: 'none',
                                background: 'none',
                                cursor: 'pointer',
                                fontSize: 13,
                                fontWeight: 500,
                                color: '#8B3FE8',
                                width: '100%',
                                flexShrink: 0,
                            }}
                        >
                            <ExternalLink size={13} />
                            View all messages
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
