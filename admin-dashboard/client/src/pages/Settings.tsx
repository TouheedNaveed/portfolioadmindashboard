import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, User as UserIcon, Shield, CheckCircle2, AlertCircle, Camera } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { authApi } from '@/api/auth';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const profileSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email(),
});

const securitySchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters').regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        'Must include uppercase, lowercase, number & special character'
    ),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
}).refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
});

type ProfileFormData = z.infer<typeof profileSchema>;
type SecurityFormData = z.infer<typeof securitySchema>;

function Alert({ type, message }: { type: 'success' | 'error'; message: string }) {
    const isSuccess = type === 'success';
    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '12px 16px',
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 500,
            background: isSuccess ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
            border: `1px solid ${isSuccess ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}`,
            color: isSuccess ? '#22C55E' : '#EF4444',
        }}>
            {isSuccess ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
            {message}
        </div>
    );
}

function SectionCard({ title, icon, children, accent = '#8B3FE8' }: {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    accent?: string;
}) {
    return (
        <div style={{
            background: '#141418',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 16,
            overflow: 'hidden',
        }}>
            {/* Card Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '18px 24px',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                background: 'rgba(255,255,255,0.015)',
            }}>
                <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: `${accent}18`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: accent,
                }}>
                    {icon}
                </div>
                <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{title}</h2>
            </div>
            <div style={{ padding: 24 }}>
                {children}
            </div>
        </div>
    );
}

export default function Settings() {
    const { user, setAuth } = useAuth();

    const [profileSuccess, setProfileSuccess] = useState('');
    const [profileError, setProfileError] = useState('');
    const [securitySuccess, setSecuritySuccess] = useState('');
    const [securityError, setSecurityError] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    const profileForm = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
        defaultValues: { name: user?.name || '', email: user?.email || '' },
    });

    const securityForm = useForm<SecurityFormData>({
        resolver: zodResolver(securitySchema),
    });

    const showMessage = (setter: (v: string) => void, msg: string) => {
        setter(msg);
        setTimeout(() => setter(''), 4000);
    };

    const getToken = () => {
        try {
            return JSON.parse(localStorage.getItem('admin-auth') as string)?.state?.accessToken || '';
        } catch { return ''; }
    };

    const handleAvatarUpload = async (file: File) => {
        try {
            setIsUploading(true);
            const formData = new FormData();
            formData.append('avatar', file);
            const { data } = await authApi.uploadAvatar(formData);
            setAuth(data.user, getToken());
            showMessage(setProfileSuccess, 'Profile picture updated successfully');
        } catch (err: any) {
            showMessage(setProfileError, err.response?.data?.error || 'Failed to upload avatar');
        } finally {
            setIsUploading(false);
        }
    };

    const onProfileSubmit = async (data: ProfileFormData) => {
        if (data.name === user?.name) return;
        try {
            setProfileError('');
            const { data: res } = await authApi.updateProfile({ name: data.name });
            setAuth(res.user, getToken());
            showMessage(setProfileSuccess, 'Profile updated successfully');
        } catch (err: any) {
            showMessage(setProfileError, err.response?.data?.error || 'Failed to update profile');
        }
    };

    const onSecuritySubmit = async (data: SecurityFormData) => {
        try {
            setSecurityError('');
            await authApi.updateProfile({ currentPassword: data.currentPassword, newPassword: data.newPassword });
            showMessage(setSecuritySuccess, 'Password changed successfully');
            securityForm.reset();
        } catch (err: any) {
            showMessage(setSecurityError, err.response?.data?.error || 'Failed to update password');
        }
    };

    return (
        <div style={{ maxWidth: 800 }}>
            {/* Page Header */}
            <div style={{ marginBottom: 32 }}>
                <h1 style={{
                    fontSize: 28,
                    fontWeight: 700,
                    fontFamily: 'Poppins, sans-serif',
                    color: 'var(--text-primary)',
                    margin: '0 0 6px 0',
                }}>
                    Settings
                </h1>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0 }}>
                    Manage your profile and account security preferences.
                </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                {/* ── Profile Card ─────────────────────────────────── */}
                <SectionCard title="Profile Details" icon={<UserIcon size={16} />} accent="#8B3FE8">
                    {/* Avatar Row */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 20,
                        padding: '4px 0 24px',
                        borderBottom: '1px solid rgba(255,255,255,0.06)',
                        marginBottom: 24,
                    }}>
                        <div style={{ position: 'relative', flexShrink: 0 }}>
                            <Avatar
                                src={user?.avatar_url}
                                name={user?.name}
                                size="xl"
                                editable
                                isLoading={isUploading}
                                onUpload={handleAvatarUpload}
                            />
                        </div>
                        <div>
                            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                                Profile Picture
                            </p>
                            <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 12, maxWidth: 300 }}>
                                Recommended: 256×256px · PNG, JPG, or WEBP · Max 5 MB
                            </p>
                            <label style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 6,
                                fontSize: 13,
                                fontWeight: 500,
                                color: '#8B3FE8',
                                cursor: 'pointer',
                                padding: '7px 14px',
                                borderRadius: 8,
                                border: '1px solid rgba(139,63,232,0.3)',
                                background: 'rgba(139,63,232,0.06)',
                                transition: 'all 0.15s ease',
                            }}>
                                <Camera size={14} />
                                Choose Photo
                                <input
                                    type="file"
                                    style={{ display: 'none' }}
                                    accept="image/jpeg,image/png,image/webp"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleAvatarUpload(file);
                                    }}
                                />
                            </label>
                        </div>
                    </div>

                    {/* Profile Form */}
                    <form onSubmit={profileForm.handleSubmit(onProfileSubmit)}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {profileSuccess && <Alert type="success" message={profileSuccess} />}
                            {profileError && <Alert type="error" message={profileError} />}

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                <Input
                                    label="Full Name"
                                    {...profileForm.register('name')}
                                    error={profileForm.formState.errors.name?.message}
                                />
                                <Input
                                    label="Email Address"
                                    type="email"
                                    {...profileForm.register('email')}
                                    disabled
                                />
                            </div>

                            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: -4 }}>
                                Email address cannot be changed. Contact support if needed.
                            </p>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 4 }}>
                                <button
                                    type="submit"
                                    disabled={!profileForm.formState.isDirty || profileForm.formState.isSubmitting}
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 8,
                                        padding: '10px 22px',
                                        borderRadius: 10,
                                        fontSize: 14,
                                        fontWeight: 600,
                                        border: 'none',
                                        cursor: profileForm.formState.isDirty ? 'pointer' : 'not-allowed',
                                        background: profileForm.formState.isDirty
                                            ? 'linear-gradient(135deg, #3B1FD4, #E03FD8)'
                                            : 'rgba(255,255,255,0.07)',
                                        color: profileForm.formState.isDirty ? '#fff' : 'var(--text-muted)',
                                        opacity: profileForm.formState.isSubmitting ? 0.6 : 1,
                                        transition: 'all 0.2s ease',
                                    }}
                                >
                                    <Save size={15} />
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </form>
                </SectionCard>

                {/* ── Security Card ─────────────────────────────────── */}
                <SectionCard title="Security" icon={<Shield size={16} />} accent="#FF6B35">
                    <form onSubmit={securityForm.handleSubmit(onSecuritySubmit)}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {securitySuccess && <Alert type="success" message={securitySuccess} />}
                            {securityError && <Alert type="error" message={securityError} />}

                            <Input
                                label="Current Password"
                                type="password"
                                showPasswordToggle
                                {...securityForm.register('currentPassword')}
                                error={securityForm.formState.errors.currentPassword?.message}
                            />

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                <Input
                                    label="New Password"
                                    type="password"
                                    showPasswordToggle
                                    {...securityForm.register('newPassword')}
                                    error={securityForm.formState.errors.newPassword?.message}
                                />
                                <Input
                                    label="Confirm New Password"
                                    type="password"
                                    showPasswordToggle
                                    {...securityForm.register('confirmPassword')}
                                    error={securityForm.formState.errors.confirmPassword?.message}
                                />
                            </div>

                            {/* Password requirements hint */}
                            <div style={{
                                padding: '10px 14px',
                                borderRadius: 8,
                                background: 'rgba(255,107,53,0.05)',
                                border: '1px solid rgba(255,107,53,0.12)',
                                fontSize: 12,
                                color: 'var(--text-secondary)',
                                lineHeight: 1.7,
                            }}>
                                Password must be at least 8 characters and include: uppercase, lowercase, number, and special character (@$!%*?&)
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 4 }}>
                                <Button
                                    type="submit"
                                    variant="secondary"
                                    disabled={!securityForm.formState.isDirty || securityForm.formState.isSubmitting}
                                    loading={securityForm.formState.isSubmitting}
                                >
                                    Update Password
                                </Button>
                            </div>
                        </div>
                    </form>
                </SectionCard>

            </div>
        </div>
    );
}
