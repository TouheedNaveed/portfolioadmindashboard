interface BadgeProps {
    status: 'read' | 'unread';
}

export function Badge({ status }: BadgeProps) {
    return (
        <span className={`badge badge-${status}`}>
            {status === 'unread' ? 'UNREAD' : 'READ'}
        </span>
    );
}
