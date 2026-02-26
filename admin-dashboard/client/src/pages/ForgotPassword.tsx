import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { authApi } from '@/api/auth';
import { forgotSchema, type ForgotForm } from '@/utils/validators';

export default function ForgotPassword() {
    const [sent, setSent] = useState(false);
    const [sentEmail, setSentEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [countdown, setCountdown] = useState(0);

    const { register, handleSubmit, getValues, formState: { errors } } = useForm<ForgotForm>({
        resolver: zodResolver(forgotSchema),
        mode: 'onBlur',
    });

    const startCountdown = () => {
        setCountdown(60);
        const interval = setInterval(() => {
            setCountdown((c) => { if (c <= 1) { clearInterval(interval); return 0; } return c - 1; });
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

    const resend = async () => {
        setLoading(true);
        try {
            await authApi.forgotPassword(getValues('email'));
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
                            style={{ textAlign: 'center', padding: '16px 0' }}
                        >
                            <CheckCircle2 size={64} style={{ margin: '0 auto 20px', display: 'block', color: 'var(--success)' }} />
                            <h3 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>Check your inbox</h3>
                            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24 }}>
                                We've sent a reset link to <strong style={{ color: 'var(--text-primary)' }}>{sentEmail}</strong>
                            </p>
                            {countdown > 0 ? (
                                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Resend in {countdown}s</p>
                            ) : (
                                <button onClick={resend} disabled={loading} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12 }} className="gradient-text">
                                    Resend email
                                </button>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </AuthLayout>
    );
}
