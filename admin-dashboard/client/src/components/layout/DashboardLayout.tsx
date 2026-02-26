import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { motion } from 'framer-motion';

const pageVariants = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
};

export function DashboardLayout() {
    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)' }}>
            <Sidebar />
            <div style={{ marginLeft: 240, flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                <TopBar />
                <motion.main
                    key="dashboard-main"
                    variants={pageVariants}
                    initial="initial"
                    animate="animate"
                    style={{ flex: 1, padding: 32 }}
                >
                    <Outlet />
                </motion.main>
            </div>
        </div>
    );
}
