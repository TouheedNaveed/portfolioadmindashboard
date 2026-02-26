import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNotifications } from '@/hooks/useNotifications';

const pageVariants = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
};

export function DashboardLayout() {
    useNotifications(); // 🔔 Start polling for unread contacts
    const [sidebarOpen, setSidebarOpen] = useState(false);

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
                    <motion.main
                        key="dashboard-main"
                        variants={pageVariants}
                        initial="initial"
                        animate="animate"
                        style={{ flex: 1, padding: '32px 24px' }}
                    >
                        <Outlet />
                    </motion.main>
                </div>
            </div>
        </>
    );
}
