import { useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { Avatar } from '@/components/ui/Avatar';
import { NotificationPanel } from '@/components/ui/NotificationPanel';

function buildBreadcrumb(pathname: string): string {
    const parts = pathname.split('/').filter(Boolean);
    return parts
        .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
        .join(' / ');
}

interface TopBarProps {
    onMenuClick: () => void;
}

export function TopBar({ onMenuClick }: TopBarProps) {
    const { pathname } = useLocation();
    const user = useAuthStore((s) => s.user);
    const crumb = buildBreadcrumb(pathname);

    return (
        <>
            <style>{`
                .topbar-hamburger { display: flex; }
                .topbar-username { display: none; }
                @media (min-width: 1024px) {
                    .topbar-hamburger { display: none !important; }
                    .topbar-username { display: block !important; }
                }
            `}</style>
            <header style={{
                height: 64,
                background: 'rgba(12,12,14,0.9)',
                backdropFilter: 'blur(12px)',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                display: 'flex',
                alignItems: 'center',
                padding: '0 24px',
                justifyContent: 'space-between',
                position: 'sticky',
                top: 0,
                zIndex: 30,
                flexShrink: 0,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button
                        className="topbar-hamburger"
                        onClick={onMenuClick}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--text-secondary)',
                            padding: 6,
                            borderRadius: 8,
                            marginLeft: -6,
                            alignItems: 'center',
                        }}
                        aria-label="Open navigation menu"
                    >
                        <Menu size={20} />
                    </button>
                    <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{crumb}</p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {/* 🔔 Live notification panel */}
                    <NotificationPanel />

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 12, borderLeft: '1px solid rgba(255,255,255,0.08)' }}>
                        <div className="topbar-username" style={{ textAlign: 'right' }}>
                            <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.2 }}>{user?.name}</p>
                            <p style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{user?.email}</p>
                        </div>
                        <Avatar src={user?.avatar_url} name={user?.name} size="sm" />
                    </div>
                </div>
            </header>
        </>
    );
}
