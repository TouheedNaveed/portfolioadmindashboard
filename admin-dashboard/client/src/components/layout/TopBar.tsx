import { useLocation } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

function buildBreadcrumb(pathname: string): string {
    const parts = pathname.split('/').filter(Boolean);
    return parts
        .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
        .join(' / ');
}

export function TopBar() {
    const { pathname } = useLocation();
    const user = useAuthStore((s) => s.user);
    const crumb = buildBreadcrumb(pathname);

    return (
        <header style={{
            height: 64, background: 'rgba(12,12,14,0.85)', backdropFilter: 'blur(12px)',
            borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center',
            padding: '0 32px', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100,
        }}>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{crumb}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <Bell size={18} style={{ color: 'var(--text-muted)', cursor: 'pointer' }} />
                <div style={{
                    width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: 12, fontWeight: 600, color: '#F2F2ED',
                    background: 'linear-gradient(135deg, #3B1FD4, #E03FD8)', cursor: 'pointer',
                }}>
                    {user?.name?.charAt(0).toUpperCase() || 'A'}
                </div>
            </div>
        </header>
    );
}
