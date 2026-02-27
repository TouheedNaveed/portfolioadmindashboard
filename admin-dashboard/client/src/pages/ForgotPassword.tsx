import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, CheckCircle2, RefreshCw, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { authApi } from '@/api/auth';
import { forgotSchema, type ForgotForm } from '@/utils/validators';

const RESEND_COOLDOWN = 30; // seconds

export default function ForgotPassword() {
    const [sent, setSent] = useState(false);
    const [sentEmail, setSentEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [resendCount, setResendCount] = useState(0);

    const { register, handleSubmit, getValues, formState: { errors } } = useForm<ForgotForm>({
        resolver: zodResolver(forgotSchema),
        mode: 'onBlur',
    });

    const startCountdown = () => {
        setCountdown(RESEND_COOLDOWN);
        const interval = setInterval(() => {
            setCountdown((c) => {
                if (c <= 1) { clearInterval(interval); return 0; }
                return c - 1;
            });
        }, 1000);
    };

    const onSubmit = async (data: ForgotForm) => {
        setLoading(true);
        try {
            await authApi.forgotPassword(data.email);
            setSentEmail(data.email);
            setSent(true);
            startCountdown();
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (countdown > 0 || loading) return;
        setLoading(true);
        try {
            await authApi.forgotPassword(getValues('email') || sentEmail);
            setResendCount((n) => n + 1);
            startCountdown();
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout>
            <div className="auth-card">
                <AnimatePresence mode="wait">
                    {!sent ? (
                        <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <Link to="/login" className="gradient-text" style={{ fontSize: 13, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 24 }}>
                                <ArrowLeft size={13} /> Back to login
                            </Link>
                            <h1 style={{ fontFamily: 'Poppins, sans-serif', fontSize: 36, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>
                                Reset password
                            </h1>
                            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 28 }}>
                                Enter your email and we'll send a reset link.
                            </p>
                            <form onSubmit={handleSubmit(onSubmit)} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                <Input label="Email Address" type="email" placeholder="you@example.com" error={errors.email?.message} {...register('email')} />
                                <Button type="submit" loading={loading} style={{ marginTop: 4 }}>Send Reset Link →</Button>
                            </form>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="success" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                            style={{ textAlign: 'center', padding: '8px 0' }}
                        >
                            {/* Icon */}
                            <div style={{
                                width: 64, height: 64, borderRadius: '50%',
                                background: 'rgba(34,197,94,0.1)',
                                border: '1px solid rgba(34,197,94,0.25)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 20px',
                            }}>
                                <Mail size={28} style={{ color: '#22C55E' }} />
                            </div>

                            <h3 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>
                                Check your inbox
                            </h3>
                            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 6, lineHeight: 1.6 }}>
                                We've sent a reset link to
                            </p>
                            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 28 }}>
                                {sentEmail}
                            </p>

                            {/* Resend section */}
                            <div style={{
                                padding: '16px',
                                borderRadius: 12,
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.07)',
                                marginBottom: 20,
                            }}>
                                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
                                    Didn't receive it? Check your spam folder or resend.
                                </p>

                                {countdown > 0 ? (
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                        <div style={{
                                            width: 32, height: 32, borderRadius: '50%',
                                            background: 'rgba(139,63,232,0.1)',
                                            border: '1px solid rgba(139,63,232,0.2)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: 11, fontWeight: 700, color: '#8B3FE8',
                                        }}>
                                            {countdown}
                                        </div>
                                        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                                            You can resend in {countdown}s
                                        </span>
                                    </div>
                                ) : (
                                    <button
                                        onClick={handleResend}
                                        disabled={loading}
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: 8,
                                            padding: '9px 18px',
                                            borderRadius: 9,
                                            border: '1px solid rgba(139,63,232,0.3)',
                                            background: 'rgba(139,63,232,0.08)',
                                            color: '#8B3FE8',
                                            fontSize: 13,
                                            fontWeight: 600,
                                            cursor: loading ? 'not-allowed' : 'pointer',
                                            opacity: loading ? 0.6 : 1,
                                            transition: 'all 0.15s ease',
                                        }}
                                    >
                                        <RefreshCw size={13} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
                                        {resendCount > 0 ? 'Send again' : 'Resend email'}
                                    </button>
                                )}
                            </div>

                            {resendCount > 0 && (
                                <motion.p
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                    style={{ fontSize: 12, color: 'var(--success)', marginBottom: 16 }}
                                >
                                    ✓ Link sent again — check your inbox
                                </motion.p>
                            )}

                            <Link to="/login" style={{ fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                <ArrowLeft size={12} /> Back to login
                            </Link>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </AuthLayout>
    );
}
