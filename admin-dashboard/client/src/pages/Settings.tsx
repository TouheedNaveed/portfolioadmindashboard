import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, User as UserIcon, Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { authApi } from '@/api/auth';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const profileSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
});

const securitySchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters').regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character'
    ),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
});

type ProfileFormData = z.infer<typeof profileSchema>;
type SecurityFormData = z.infer<typeof securitySchema>;

export default function Settings() {
    const { user, setAuth } = useAuth();

    const [profileSuccess, setProfileSuccess] = useState('');
    const [profileError, setProfileError] = useState('');
    const [securitySuccess, setSecuritySuccess] = useState('');
    const [securityError, setSecurityError] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    const profileForm = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: user?.name || '',
            email: user?.email || '',
        },
    });

    const securityForm = useForm<SecurityFormData>({
        resolver: zodResolver(securitySchema),
    });

    const handleAvatarUpload = async (file: File) => {
        try {
            setIsUploading(true);
            const formData = new FormData();
            formData.append('avatar', file);

            const { data } = await authApi.uploadAvatar(formData);
            // The local storage holds the accessToken, we re-verify and persist.
            // Easiest is to safely update current user in Zustand.
            setAuth(data.user, localStorage.getItem('admin-auth') ? JSON.parse(localStorage.getItem('admin-auth') as string).state.accessToken : '');
            setProfileSuccess('Profile picture updated successfully');
            setTimeout(() => setProfileSuccess(''), 3000);
        } catch (err: any) {
            setProfileError(err.response?.data?.error || 'Failed to upload avatar');
            setTimeout(() => setProfileError(''), 3000);
        } finally {
            setIsUploading(false);
        }
    };

    const onProfileSubmit = async (data: ProfileFormData) => {
        try {
            setProfileError('');
            setProfileSuccess('');

            // We only send updates if they differ from current user
            if (data.name === user?.name && data.email === user?.email) return;

            const { data: responseData } = await authApi.updateProfile({
                name: data.name !== user?.name ? data.name : undefined
                // We omit email since changing email requires currentPassword flow per API, 
                // or we handle that in a combined form. For simplicity, we only allow name changes here 
                // unless password is provided.
            });

            setAuth(responseData.user, localStorage.getItem('admin-auth') ? JSON.parse(localStorage.getItem('admin-auth') as string).state.accessToken : '');
            setProfileSuccess('Profile updated successfully');
            setTimeout(() => setProfileSuccess(''), 3000);
        } catch (err: any) {
            setProfileError(err.response?.data?.error || 'Failed to update profile');
            setTimeout(() => setProfileError(''), 3000);
        }
    };

    const onSecuritySubmit = async (data: SecurityFormData) => {
        try {
            setSecurityError('');
            setSecuritySuccess('');

            await authApi.updateProfile({
                currentPassword: data.currentPassword,
                newPassword: data.newPassword
            });

            setSecuritySuccess('Password updated successfully');
            securityForm.reset();
            setTimeout(() => setSecuritySuccess(''), 3000);
        } catch (err: any) {
            setSecurityError(err.response?.data?.error || 'Failed to update password');
            setTimeout(() => setSecurityError(''), 3000);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-display font-semibold text-white tracking-tight">Settings</h1>
                    <p className="text-sm text-text-secondary mt-1">Manage your profile and security preferences.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Card */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-surface border border-white/5 rounded-2xl overflow-hidden">
                        <div className="p-6 border-b border-white/5 flex items-center gap-3">
                            <UserIcon className="text-brand-purple" size={20} />
                            <h2 className="text-lg font-medium text-white">Profile Details</h2>
                        </div>

                        <div className="p-6 space-y-8">
                            {/* Avatar Section */}
                            <div className="flex items-center gap-6">
                                <Avatar
                                    src={user?.avatar_url}
                                    name={user?.name}
                                    size="xl"
                                    editable
                                    isLoading={isUploading}
                                    onUpload={handleAvatarUpload}
                                />
                                <div>
                                    <h3 className="text-sm font-medium text-white mb-1">Profile Picture</h3>
                                    <p className="text-xs text-text-secondary mb-3 max-w-sm">
                                        Upload a high-res picture. Recommended size is 256x256px. PNG, JPG, or WEBP. Max 5MB.
                                    </p>
                                    <label className="text-sm cursor-pointer text-brand-purple hover:text-brand-magenta transition-colors font-medium">
                                        Upload new
                                        <input
                                            type="file"
                                            className="hidden"
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
                            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                                {profileSuccess && (
                                    <div className="p-3 bg-brand-purple/10 border border-brand-purple/20 text-brand-purple text-sm rounded-lg">
                                        {profileSuccess}
                                    </div>
                                )}
                                {profileError && (
                                    <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-lg">
                                        {profileError}
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input
                                        label="Full Name"
                                        {...profileForm.register('name')}
                                        error={profileForm.formState.errors.name?.message}
                                    />
                                    <Input
                                        label="Email Address (Cannot be changed here)"
                                        type="email"
                                        {...profileForm.register('email')}
                                        disabled
                                    />
                                </div>

                                <div className="flex justify-end pt-2">
                                    <Button
                                        type="submit"
                                        disabled={!profileForm.formState.isDirty || profileForm.formState.isSubmitting}
                                        loading={profileForm.formState.isSubmitting}
                                    >
                                        <Save size={18} className="mr-2" />
                                        Save Changes
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Security Card */}
                    <div className="bg-surface border border-white/5 rounded-2xl overflow-hidden">
                        <div className="p-6 border-b border-white/5 flex items-center gap-3">
                            <Shield className="text-brand-orange" size={20} />
                            <h2 className="text-lg font-medium text-white">Security</h2>
                        </div>

                        <div className="p-6">
                            <form onSubmit={securityForm.handleSubmit(onSecuritySubmit)} className="space-y-4">
                                {securitySuccess && (
                                    <div className="p-3 bg-green-500/10 border border-green-500/20 text-green-500 text-sm rounded-lg">
                                        {securitySuccess}
                                    </div>
                                )}
                                {securityError && (
                                    <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-lg">
                                        {securityError}
                                    </div>
                                )}

                                <Input
                                    label="Current Password"
                                    type="password"
                                    {...securityForm.register('currentPassword')}
                                    error={securityForm.formState.errors.currentPassword?.message}
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input
                                        label="New Password"
                                        type="password"
                                        {...securityForm.register('newPassword')}
                                        error={securityForm.formState.errors.newPassword?.message}
                                    />
                                    <Input
                                        label="Confirm New Password"
                                        type="password"
                                        {...securityForm.register('confirmPassword')}
                                        error={securityForm.formState.errors.confirmPassword?.message}
                                    />
                                </div>

                                <div className="flex justify-end pt-2">
                                    <Button
                                        type="submit"
                                        variant="secondary"
                                        disabled={!securityForm.formState.isDirty || securityForm.formState.isSubmitting}
                                        loading={securityForm.formState.isSubmitting}
                                    >
                                        Update Password
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
