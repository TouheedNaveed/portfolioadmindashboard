import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useNotifications } from '@/hooks/useNotifications';

export function DashboardLayout() {
    useNotifications(); // 🔔 Start polling for unread contacts
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();

    return (
        <>
            <style>{`
                @media (min-width: 1024px) {
                    .dashboard-content-area {
                        padding-left: 240px !important;
                    }
                }
            `}</style>
            <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
                <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

                <div
                    className="dashboard-content-area"
                    style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}
                >
                    <TopBar onMenuClick={() => setSidebarOpen(true)} />

                    {/* AnimatePresence + key on location.pathname so each
                        route transition triggers a fresh fade-in instead of
                        re-using the same static key that freezes at opacity:0 */}
                    <AnimatePresence mode="wait">
                        <motion.main
                            key={location.pathname}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.22, ease: 'easeOut' }}
                            style={{ flex: 1, padding: '32px 24px' }}
                        >
                            <Outlet />
                        </motion.main>
                    </AnimatePresence>
                </div>
            </div>
        </>
    );
}
