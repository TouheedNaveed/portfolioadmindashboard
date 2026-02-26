import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Lock } from 'lucide-react';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { PasswordStrengthMeter } from '@/components/ui/PasswordStrengthMeter';
import { useAuth } from '@/hooks/useAuth';
import { signupSchema, type SignupForm } from '@/utils/validators';
import { motion, AnimatePresence } from 'framer-motion';

export default function Signup() {
    const { signup } = useAuth();
    const [serverError, setServerError] = useState('');
    const [loading, setLoading] = useState(false);

    const { register, handleSubmit, watch, formState: { errors } } = useForm<SignupForm>({
        resolver: zodResolver(signupSchema),
        mode: 'onBlur',
    });

    const password = watch('password', '');

    const onSubmit = async (data: SignupForm) => {
        setServerError('');
        setLoading(true);
        try {
            await signup(data.name, data.email, data.password, data.adminSecret);
        } catch (err: unknown) {
            const message = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to create account';
            setServerError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout>
            <div className="auth-card">
                <h1 style={{ fontFamily: 'Poppins, sans-serif', fontSize: 40, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8, lineHeight: 1.1 }}>
                    Create account
                </h1>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 28, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Lock size={14} /> Admin access only
                </p>

                <AnimatePresence>
                    {serverError && (
                        <motion.div
                            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            style={{
                                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                                borderRadius: 12, padding: '12px 16px', marginBottom: 20,
                                color: 'var(--danger)', fontSize: 14,
                            }}
                            role="alert"
                        >
                            {serverError}
                        </motion.div>
                    )}
                </AnimatePresence>

                <form onSubmit={handleSubmit(onSubmit)} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <Input label="Full Name" placeholder="Your name" error={errors.name?.message} {...register('name')} />
                    <Input label="Email" type="email" placeholder="you@example.com" error={errors.email?.message} {...register('email')} />
                    <div>
                        <Input label="Password" showPasswordToggle placeholder="••••••••" error={errors.password?.message} {...register('password')} />
                        <PasswordStrengthMeter password={password} />
                    </div>
                    <Input label="Confirm Password" showPasswordToggle placeholder="••••••••" error={errors.confirmPassword?.message} {...register('confirmPassword')} />
                    <Input label="Invite Code" type="password" placeholder="Enter invite code" error={errors.adminSecret?.message} {...register('adminSecret')} />

                    <Button type="submit" loading={loading} style={{ marginTop: 4 }}>
                        Create Account →
                    </Button>
                </form>
            </div>

            <p style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: 'var(--text-muted)' }}>
                Already have an account?{' '}
                <Link to="/login" className="gradient-text" style={{ textDecoration: 'none', fontWeight: 500 }}>Sign in</Link>
            </p>
        </AuthLayout>
    );
}
