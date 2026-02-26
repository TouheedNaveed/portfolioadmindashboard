import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, MessageSquare, Settings, LogOut, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Avatar } from '@/components/ui/Avatar';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

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
    }, [location.pathname, onClose]);

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <>
            {/* Mobile Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
                    onClick={onClose}
                />
            )}

            {/* Sidebar Container */}
            <aside
                className={`
                    fixed inset-y-0 left-0 z-50 flex flex-col w-[240px] h-[100dvh]
                    bg-[#0C0C0E] border-r border-white/5
                    transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
                    ${isOpen ? 'translate-x-0 shadow-2xl shadow-brand-purple/20' : '-translate-x-full'}
                    lg:translate-x-0 lg:shadow-none
                `}
            >
                {/* Header Logo */}
                <div className="h-16 flex items-center justify-between px-6 border-b border-white/5 shrink-0">
                    <div className="flex items-center gap-2">
                        <span className="gradient-text text-base font-bold font-display tracking-tight">AdminHub</span>
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gradient-to-br from-brand-purple to-brand-magenta text-white tracking-wider">
                            ADMIN
                        </span>
                    </div>
                    {/* Mobile Close Button */}
                    <button
                        onClick={onClose}
                        className="lg:hidden p-1.5 -mr-2 text-text-secondary hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 py-6 overflow-y-auto overflow-x-hidden">
                    <p className="text-[10px] font-medium text-text-muted uppercase tracking-widest px-6 mb-3">
                        Navigation
                    </p>
                    <div className="space-y-1 px-3">
                        {navItems.map(({ icon: Icon, label, to, end }) => (
                            <NavLink
                                key={to}
                                to={to}
                                end={end}
                                className={({ isActive }) => `
                                    flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                                    ${isActive
                                        ? 'text-white bg-brand-purple/10 shadow-[inset_3px_0_0_0_#8B3FE8]'
                                        : 'text-text-secondary hover:text-white hover:bg-white/5'
                                    }
                                `}
                            >
                                <Icon size={18} className="shrink-0" />
                                <span>{label}</span>
                            </NavLink>
                        ))}
                    </div>
                </nav>

                {/* User Profile Footer */}
                <div className="p-4 border-t border-white/5 mt-auto flex items-center justify-between hover:bg-white/[0.02] transition-colors shrink-0">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                        <Avatar src={user?.avatar_url} name={user?.name} size="sm" />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{user?.name || 'Admin'}</p>
                            <p className="text-[11px] text-text-muted truncate">{user?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        title="Logout"
                        className="p-2 text-text-muted hover:text-brand-orange hover:bg-brand-orange/10 rounded-lg transition-colors shrink-0 ml-2"
                    >
                        <LogOut size={16} />
                    </button>
                </div>
            </aside>
        </>
    );
}
