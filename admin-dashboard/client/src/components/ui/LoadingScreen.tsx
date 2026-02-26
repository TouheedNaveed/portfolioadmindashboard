import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function LoadingScreen({ forceMinimumDuration = true }: { forceMinimumDuration?: boolean }) {
    const [visible, setVisible] = useState(true);
    const [exiting, setExiting] = useState(false);

    useEffect(() => {
        if (!forceMinimumDuration) {
            // For simple suspense fallbacks that unmount themselves when ready
            return;
        }

        // Show every time the page loads / refreshes with deliberate premium delay
        const exitTimer = setTimeout(() => setExiting(true), 2200);
        const removeTimer = setTimeout(() => setVisible(false), 2900);

        return () => {
            clearTimeout(exitTimer);
            clearTimeout(removeTimer);
        };
    }, [forceMinimumDuration]);

    if (!visible) return null;

    return (
        <AnimatePresence>
            {!exiting && (
                <motion.div
                    key="loader"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, y: "-100%" }}
                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                        position: 'fixed', inset: 0, zIndex: 9999,
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center',
                        background: "#0C0C0E"
                    }}
                >
                    {/* Ambient orbs */}
                    <div
                        style={{
                            position: 'absolute',
                            width: 500, height: 500, borderRadius: '50%',
                            pointerEvents: 'none',
                            background: "radial-gradient(circle, rgba(139,63,232,0.18) 0%, transparent 70%)",
                            filter: "blur(60px)",
                            top: "50%", left: "50%",
                            transform: "translate(-60%, -60%)",
                        }}
                    />
                    <div
                        style={{
                            position: 'absolute',
                            width: 400, height: 400, borderRadius: '50%',
                            pointerEvents: 'none',
                            background: "radial-gradient(circle, rgba(224,63,216,0.12) 0%, transparent 70%)",
                            filter: "blur(80px)",
                            bottom: "20%", right: "20%",
                        }}
                    />

                    {/* Center content */}
                    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 40 }}>
                        {/* Spinning gradient ring */}
                        <motion.div
                            initial={{ scale: 0.6, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
                            style={{ position: 'relative' }}
                        >
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 3, ease: "linear", repeat: Infinity }}
                                style={{
                                    width: 80, height: 80, borderRadius: '50%',
                                    background: "conic-gradient(from 0deg, #3B1FD4, #8B3FE8, #E03FD8, #FF6B35, #3B1FD4)",
                                    padding: 2,
                                }}
                            >
                                <div
                                    style={{
                                        width: '100%', height: '100%', borderRadius: '50%',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        background: "#0C0C0E"
                                    }}
                                >
                                    <span
                                        style={{
                                            fontFamily: 'Poppins, sans-serif',
                                            fontWeight: 800,
                                            fontSize: 20,
                                            background: "linear-gradient(135deg, #3B1FD4 0%, #8B3FE8 30%, #E03FD8 65%, #FF6B35 100%)",
                                            WebkitBackgroundClip: "text",
                                            WebkitTextFillColor: "transparent",
                                            backgroundClip: "text",
                                        }}
                                    >
                                        TN
                                    </span>
                                </div>
                            </motion.div>
                        </motion.div>

                        {/* Name */}
                        <motion.div
                            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
                        >
                            <h1
                                style={{
                                    fontFamily: 'Poppins, sans-serif',
                                    fontWeight: 800,
                                    fontSize: "clamp(28px, 4vw, 40px)",
                                    letterSpacing: "-0.03em",
                                    background: "linear-gradient(135deg, #3B1FD4 0%, #8B3FE8 30%, #E03FD8 65%, #FF6B35 100%)",
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                    backgroundClip: "text",
                                    margin: 0,
                                    lineHeight: 1
                                }}
                            >
                                Touheed Naveed
                            </h1>
                            <p
                                style={{
                                    fontSize: 14,
                                    fontWeight: 500,
                                    textTransform: 'uppercase',
                                    color: "#4A4A5A",
                                    letterSpacing: "0.2em",
                                    margin: 0
                                }}
                            >
                                Full-Stack Developer
                            </p>
                        </motion.div>

                        {/* Loading bar */}
                        <motion.div
                            style={{
                                width: 192, height: 1, borderRadius: 9999, overflow: 'hidden',
                                background: "rgba(255,255,255,0.07)"
                            }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                        >
                            <motion.div
                                style={{
                                    height: '100%', borderRadius: 9999,
                                    background: "linear-gradient(90deg, #3B1FD4, #8B3FE8, #E03FD8, #FF6B35)",
                                }}
                                initial={{ width: "0%" }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 1.4, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
                            />
                        </motion.div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
