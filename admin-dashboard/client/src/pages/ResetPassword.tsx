import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { PasswordStrengthMeter } from '@/components/ui/PasswordStrengthMeter';
import { authApi } from '@/api/auth';
import { resetSchema, type ResetForm } from '@/utils/validators';

export default function ResetPassword() {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();
    const [tokenValid, setTokenValid] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(false);
    const [serverError, setServerError] = useState('');

    const { register, handleSubmit, watch, formState: { errors } } = useForm<ResetForm>({
        resolver: zodResolver(resetSchema),
        mode: 'onBlur',
    });
    const password = watch('newPassword', '');

    useEffect(() => {
        if (!token) { setTokenValid(false); return; }
        authApi.verifyResetToken(token).then(({ data }) => setTokenValid(data.valid)).catch(() => setTokenValid(false));
    }, [token]);

    const onSubmit = async (data: ResetForm) => {
        if (!token) return;
        setLoading(true);
        setServerError('');
        try {
            await authApi.resetPassword(token, data.newPassword);
            navigate('/login', { state: { toast: 'Password reset successfully. Please sign in.' } });
        } catch (err: unknown) {
            setServerError((err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    const checks = [
        { label: 'At least 8 characters', ok: password.length >= 8 },
        { label: 'One uppercase letter', ok: /[A-Z]/.test(password) },
        { label: 'One number', ok: /[0-9]/.test(password) },
        { label: 'One special character', ok: /[^A-Za-z0-9]/.test(password) },
    ];

    if (tokenValid === null) {
        return <AuthLayout><div className="auth-card" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Verifying link…</div></AuthLayout>;
    }

    if (!tokenValid) {
        return (
            <AuthLayout>
                <div className="auth-card" style={{ textAlign: 'center' }}>
                    <AlertCircle size={48} style={{ color: 'var(--danger)', margin: '0 auto 16px', display: 'block' }} />
                    <h3 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>Link expired</h3>
                    <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24 }}>This password reset link has expired or already been used.</p>
                    <Link to="/forgot-password" className="gradient-text" style={{ fontSize: 14, textDecoration: 'none', fontWeight: 500 }}>Request a new link →</Link>
                </div>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout>
            <motion.div className="auth-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                <h1 style={{ fontFamily: 'Poppins, sans-serif', fontSize: 36, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>
                    Set new password
                </h1>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 28 }}>
                    Choose a strong password for your account.
                </p>

                {serverError && (
                    <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, padding: '12px 16px', marginBottom: 20, color: 'var(--danger)', fontSize: 14 }} role="alert">
                        {serverError}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                        <Input label="New Password" showPasswordToggle placeholder="••••••••" error={errors.newPassword?.message} {...register('newPassword')} />
                        <PasswordStrengthMeter password={password} />
                    </div>
                    <Input label="Confirm Password" showPasswordToggle placeholder="••••••••" error={errors.confirmPassword?.message} {...register('confirmPassword')} />

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {checks.map((c) => (
                            <div key={c.label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: c.ok ? 'var(--success)' : 'var(--text-muted)' }}>
                                <Check size={12} /> {c.label}
                            </div>
                        ))}
                    </div>

                    <Button type="submit" loading={loading} style={{ marginTop: 4 }}>Set New Password →</Button>
                </form>
            </motion.div>
        </AuthLayout>
    );
}
