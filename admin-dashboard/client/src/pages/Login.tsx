import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { loginSchema, type LoginForm } from '@/utils/validators';

export default function Login() {
    const { login } = useAuth();
    const [serverError, setServerError] = useState('');
    const [loading, setLoading] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
        resolver: zodResolver(loginSchema),
        mode: 'onBlur',
    });

    const onSubmit = async (data: LoginForm) => {
        setServerError('');
        setLoading(true);
        try {
            await login(data.email, data.password);
        } catch (err: unknown) {
            const message = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Invalid email or password';
            setServerError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout>
            <div className="auth-card">
                <h1 style={{ fontFamily: 'Poppins, sans-serif', fontSize: 40, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8, lineHeight: 1.1 }}>
                    Welcome back
                </h1>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 28 }}>
                    Sign in to your admin account
                </p>

                {serverError && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
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

                <form onSubmit={handleSubmit(onSubmit)} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <Input
                        label="Email"
                        type="email"
                        placeholder="you@example.com"
                        error={errors.email?.message}
                        {...register('email')}
                    />
                    <div>
                        <Input
                            label="Password"
                            showPasswordToggle
                            placeholder="••••••••"
                            error={errors.password?.message}
                            {...register('password')}
                        />
                        <div style={{ textAlign: 'right', marginTop: 6 }}>
                            <Link to="/forgot-password" className="gradient-text" style={{ fontSize: 12, textDecoration: 'none' }}>
                                Forgot password?
                            </Link>
                        </div>
                    </div>

                    <Button type="submit" loading={loading} style={{ marginTop: 4 }}>
                        Sign In →
                    </Button>
                </form>
            </div>

            <p style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: 'var(--text-muted)' }}>
                Don't have an account?{' '}
                <Link to="/signup" className="gradient-text" style={{ textDecoration: 'none', fontWeight: 500 }}>Sign up</Link>
            </p>
        </AuthLayout>
    );
}
