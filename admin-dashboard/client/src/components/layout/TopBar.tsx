import { useLocation } from 'react-router-dom';
import { Bell, Menu } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { Avatar } from '@/components/ui/Avatar';

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
        <header className="h-16 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-40 border-b border-white/5 bg-[#0C0C0E]/85 backdrop-blur-md">
            <div className="flex items-center gap-3">
                <button
                    onClick={onMenuClick}
                    className="p-2 -ml-2 text-text-secondary hover:text-white transition-colors lg:hidden rounded-lg hover:bg-white/5"
                >
                    <Menu size={20} />
                </button>
                <p className="text-sm text-text-secondary hidden sm:block">{crumb}</p>
                <p className="text-sm text-text-secondary sm:hidden font-medium">AdminHub</p>
            </div>

            <div className="flex items-center gap-4 lg:gap-6">
                <button className="text-text-muted hover:text-white transition-colors">
                    <Bell size={18} />
                </button>
                <div className="pl-4 lg:pl-6 border-l border-white/10 flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium text-white leading-tight">{user?.name}</p>
                        <p className="text-[11px] text-text-secondary">{user?.email}</p>
                    </div>
                    <Avatar src={user?.avatar_url} name={user?.name} size="sm" />
                </div>
            </div>
        </header>
    );
}
