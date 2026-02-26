import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { motion } from 'framer-motion';
import { useState } from 'react';

const pageVariants = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
};

export function DashboardLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)' }} className="flex min-h-screen">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="flex-1 flex flex-col min-h-screen w-full lg:ml-[240px]">
                <TopBar onMenuClick={() => setSidebarOpen(true)} />
                <motion.main
                    key="dashboard-main"
                    variants={pageVariants}
                    initial="initial"
                    animate="animate"
                    className="flex-1 p-4 md:p-6 lg:p-8 overflow-x-hidden"
                >
                    <Outlet />
                </motion.main>
            </div>
        </div>
    );
}
