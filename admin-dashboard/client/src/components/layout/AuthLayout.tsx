import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface AuthLayoutProps {
    children: ReactNode;
}

const pageVariants: any = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] as const } },
    exit: { opacity: 0, y: -8, transition: { duration: 0.25, ease: 'easeIn' } },
};

export function AuthLayout({ children }: AuthLayoutProps) {
    return (
        <div style={{
            minHeight: '100vh', background: 'var(--bg-base)',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', padding: '40px 20px', position: 'relative', overflow: 'hidden',
        }}>
            {/* Iridescent orb */}
            <div style={{
                position: 'fixed', top: '-100px', right: '-100px', width: 600, height: 600,
                borderRadius: '50%', pointerEvents: 'none', zIndex: 0, opacity: 0.12,
                background: 'linear-gradient(135deg, #3B1FD4, #8B3FE8, #E03FD8, #FF6B35)',
                filter: 'blur(80px)',
            }} />

            {/* Logo */}
            <div style={{ marginBottom: 28, textAlign: 'center', position: 'relative', zIndex: 1 }}>
                <span className="gradient-text" style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.01em' }}>
                    AdminHub
                </span>
                {' '}
                <span style={{
                    fontSize: 11, fontWeight: 500, padding: '3px 10px', borderRadius: 9999,
                    background: 'linear-gradient(135deg, #3B1FD4, #E03FD8)',
                    color: 'var(--text-primary)', letterSpacing: '0.05em', verticalAlign: 'middle',
                }}>
                    ADMIN
                </span>
            </div>

            <motion.div
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                style={{ width: '100%', maxWidth: 480, position: 'relative', zIndex: 1 }}
            >
                {children}
            </motion.div>

            <p style={{ marginTop: 24, fontSize: 12, color: 'var(--text-muted)', position: 'relative', zIndex: 1 }}>
                AdminHub © {new Date().getFullYear()}
            </p>
        </div>
    );
}
