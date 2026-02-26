import { Camera, Loader2, User as UserIcon } from 'lucide-react';
import React, { useRef, useState } from 'react';

interface AvatarProps {
    src?: string | null;
    name?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    editable?: boolean;
    onUpload?: (file: File) => Promise<void>;
    isLoading?: boolean;
}

export function Avatar({
    src,
    name,
    size = 'md',
    editable = false,
    onUpload,
    isLoading = false
}: AvatarProps) {
    const [isHovering, setIsHovering] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const sizeClasses = {
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-16 h-16 text-lg',
        xl: 'w-24 h-24 text-2xl',
    };

    const getInitial = (name?: string) => {
        return name ? name.charAt(0).toUpperCase() : '?';
    };

    const handleClick = () => {
        if (editable && !isLoading) {
            fileInputRef.current?.click();
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && onUpload) {
            await onUpload(file);
        }
        // Reset input so the same file can be selected again if needed
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="relative inline-block">
            <div
                className={`
          relative rounded-full overflow-hidden flex items-center justify-center font-semibold
          bg-surface-elevated border border-white/10 shrink-0
          ${sizeClasses[size]}
          ${editable && !isLoading ? 'cursor-pointer' : ''}
          ${editable ? 'ring-2 ring-transparent transition-all hover:ring-brand-purple' : ''}
        `}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                onClick={handleClick}
            >
                {src ? (
                    <img src={src} alt={name || "Avatar"} className="w-full h-full object-cover" />
                ) : (
                    <span className="text-text-secondary">
                        {name ? getInitial(name) : <UserIcon size={size === 'sm' || size === 'md' ? 16 : 32} />}
                    </span>
                )}

                {/* Hover/Upload Overlay */}
                {editable && (isHovering || isLoading) && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm transition-opacity">
                        {isLoading ? (
                            <Loader2 className="w-1/3 h-1/3 text-white animate-spin" />
                        ) : (
                            <Camera className="w-1/3 h-1/3 text-white/90" />
                        )}
                    </div>
                )}
            </div>

            {editable && (
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                />
            )}
        </div>
    );
}
