import React, { type ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger';
    loading?: boolean;
    children: React.ReactNode;
}

export function Button({ variant = 'primary', loading, children, disabled, className = '', ...props }: ButtonProps) {
    const cls = `btn-${variant} ${className}`;
    return (
        <button className={cls} disabled={disabled || loading} {...props}>
            {loading ? <Loader2 size={16} className="animate-spin" /> : children}
        </button>
    );
}
