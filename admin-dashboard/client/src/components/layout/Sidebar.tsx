import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, MessageSquare, Settings, LogOut, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Avatar } from '@/components/ui/Avatar';
import { useEffect } from 'react';

const navItems = [
    { icon: LayoutDashboard, label: 'Overview', to: '/dashboard', end: true },
    { icon: MessageSquare, label: 'Contacts', to: '/dashboard/contacts' },
    { icon: Settings, label: 'Settings', to: '/dashboard/settings' },
];

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Close mobile sidebar on route change
    useEffect(() => {
        onClose();
    }, [location.pathname]);

    // Lock body scroll on mobile when menu open
    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const sidebarStyle: React.CSSProperties = {
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        width: 240,
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        background: '#0F0F12',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        transform: 'translateX(0)',
        transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease',
    };

    return (
        <>
            {/* Dark overlay backdrop for mobile */}
            {isOpen && (
                <div
                    onClick={onClose}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.65)',
                        backdropFilter: 'blur(4px)',
                        zIndex: 40,
                    }}
                />
            )}

            {/* Mobile sidebar: hidden by default (translateX(-100%)), shown when isOpen */}
            <style>{`
                @media (max-width: 1023px) {
                    .sidebar-panel {
                        transform: ${isOpen ? 'translateX(0)' : 'translateX(-100%)'} !important;
                        box-shadow: ${isOpen ? '20px 0 60px rgba(0,0,0,0.6)' : 'none'} !important;
                    }
                }
            `}</style>

            <aside className="sidebar-panel" style={sidebarStyle}>
                {/* Logo */}
                <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className="gradient-text" style={{ fontSize: 15, fontWeight: 700, fontFamily: 'Poppins, sans-serif', letterSpacing: '-0.02em' }}>AdminHub</span>
                        <span style={{ fontSize: 9, fontWeight: 600, padding: '3px 7px', borderRadius: 99, background: 'linear-gradient(135deg, #3B1FD4, #E03FD8)', color: '#fff', letterSpacing: '0.08em' }}>
                            ADMIN
                        </span>
                    </div>
                    <button
                        onClick={onClose}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', padding: 6, borderRadius: 8 }}
                        className="lg:hidden"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Nav */}
                <nav style={{ flex: 1, padding: '20px 12px', overflowY: 'auto', overflowX: 'hidden' }}>
                    <p style={{ fontSize: 10, fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '0 12px', marginBottom: 8 }}>
                        Navigation
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {navItems.map(({ icon: Icon, label, to, end }) => (
                            <NavLink
                                key={to}
                                to={to}
                                end={end}
                                style={({ isActive }) => ({
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 10,
                                    padding: '10px 12px',
                                    textDecoration: 'none',
                                    borderRadius: 8,
                                    fontSize: 14,
                                    fontWeight: 500,
                                    color: isActive ? '#F2F2ED' : 'var(--text-secondary)',
                                    background: isActive ? 'rgba(139,63,232,0.12)' : 'transparent',
                                    boxShadow: isActive ? 'inset 3px 0 0 0 #8B3FE8' : 'none',
                                    transition: 'all 0.15s ease',
                                })}
                            >
                                <Icon size={17} style={{ flexShrink: 0 }} />
                                <span>{label}</span>
                            </NavLink>
                        ))}
                    </div>
                </nav>

                {/* User Row */}
                <div style={{ padding: '14px 16px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                    <Avatar src={user?.avatar_url} name={user?.name} size="sm" />
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name || 'Admin'}</p>
                        <p style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        title="Logout"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', padding: 6, borderRadius: 8, flexShrink: 0 }}
                    >
                        <LogOut size={15} />
                    </button>
                </div>
            </aside>
        </>
    );
}
