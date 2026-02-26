import { getPasswordStrength } from '@/utils/validators';

const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
const segmentColors = ['', 'var(--danger)', 'var(--warning)', '#84CC16', ''];
const isGradient = [false, false, false, false, true];

interface PasswordStrengthMeterProps {
    password: string;
}

export function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
    const strength = getPasswordStrength(password);
    if (!password) return null;

    return (
        <div style={{ marginTop: 8 }}>
            <div style={{ display: 'flex', gap: 4 }}>
                {[1, 2, 3, 4].map((i) => (
                    <div
                        key={i}
                        style={{
                            flex: 1, height: 6, borderRadius: 3,
                            background: i <= strength
                                ? (isGradient[i] ? 'linear-gradient(135deg, #3B1FD4, #E03FD8)' : segmentColors[i])
                                : 'var(--bg-elevated)',
                            transition: 'background 0.3s ease',
                        }}
                    />
                ))}
                <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 8, whiteSpace: 'nowrap', alignSelf: 'center' }}>
                    {labels[strength]}
                </span>
            </div>
        </div>
    );
}
