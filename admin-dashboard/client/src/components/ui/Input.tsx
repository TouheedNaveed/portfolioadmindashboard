import { type InputHTMLAttributes, forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    showPasswordToggle?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, showPasswordToggle, type, className = '', ...props }, ref) => {
        const [showPw, setShowPw] = useState(false);
        const inputType = showPasswordToggle ? (showPw ? 'text' : 'password') : type;

        return (
            <div style={{ width: '100%' }}>
                {label && <label className="field-label">{label}</label>}
                <div style={{ position: 'relative' }}>
                    <input
                        ref={ref}
                        type={inputType}
                        className={`input-base ${error ? 'error' : ''} ${className}`}
                        style={showPasswordToggle ? { paddingRight: 44 } : undefined}
                        {...props}
                    />
                    {showPasswordToggle && (
                        <button
                            type="button"
                            onClick={() => setShowPw((v) => !v)}
                            style={{
                                position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                                background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                                display: 'flex', alignItems: 'center',
                            }}
                            aria-label={showPw ? 'Hide password' : 'Show password'}
                        >
                            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    )}
                </div>
                {error && <p className="field-error" role="alert" aria-live="polite">{error}</p>}
            </div>
        );
    }
);
Input.displayName = 'Input';
