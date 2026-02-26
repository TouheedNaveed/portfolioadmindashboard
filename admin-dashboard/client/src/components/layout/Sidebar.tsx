import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, MessageSquare, Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const navItems = [
    { icon: LayoutDashboard, label: 'Overview', to: '/dashboard', end: true },
    { icon: MessageSquare, label: 'Contacts', to: '/dashboard/contacts' },
    { icon: Settings, label: 'Settings', to: '/dashboard/settings' },
];

export function Sidebar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <aside style={{
            width: 240, minHeight: '100vh', background: 'var(--bg-surface)',
            borderRight: '1px solid var(--border-subtle)', display: 'flex',
            flexDirection: 'column', flexShrink: 0, position: 'fixed', left: 0, top: 0, bottom: 0,
        }}>
            {/* Logo */}
            <div style={{ height: 64, display: 'flex', alignItems: 'center', padding: '0 24px', borderBottom: '1px solid var(--border-subtle)' }}>
                <span className="gradient-text" style={{ fontSize: 16, fontWeight: 700 }}>AdminHub</span>
                <span style={{ fontSize: 10, fontWeight: 500, padding: '2px 8px', borderRadius: 9999, background: 'linear-gradient(135deg, #3B1FD4, #E03FD8)', color: '#F2F2ED', marginLeft: 8, letterSpacing: '0.05em' }}>
                    ADMIN
                </span>
            </div>

            {/* Nav */}
            <nav style={{ flex: 1, padding: '20px 0' }}>
                <p style={{ fontSize: 10, fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '0 24px', marginBottom: 8 }}>
                    Navigation
                </p>
                {navItems.map(({ icon: Icon, label, to, end }) => (
                    <NavLink
                        key={to}
                        to={to}
                        end={end}
                        style={({ isActive }) => ({
                            display: 'flex', alignItems: 'center', gap: 12,
                            padding: '10px 24px', textDecoration: 'none',
                            fontSize: 14, fontWeight: 500,
                            color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                            background: isActive ? 'rgba(139,63,232,0.1)' : 'transparent',
                            borderLeft: isActive ? '3px solid #8B3FE8' : '3px solid transparent',
                            transition: 'all 0.15s ease',
                            position: 'relative',
                        })}
                        className={({ isActive }) => isActive ? '' : 'sidebar-nav-item'}
                    >
                        <Icon size={18} />
                        {label}
                    </NavLink>
                ))}
            </nav>

            {/* User row */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                    width: 32, height: 32, borderRadius: '50%', flexShrink: 0, display: 'flex',
                    alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600,
                    color: '#F2F2ED', background: 'linear-gradient(135deg, #3B1FD4, #E03FD8)',
                }}>
                    {user?.name?.charAt(0).toUpperCase() || 'A'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name || 'Admin'}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</p>
                </div>
                <button onClick={handleLogout} title="Logout" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', flexShrink: 0, padding: 4 }}>
                    <LogOut size={16} />
                </button>
            </div>
        </aside>
    );
}
