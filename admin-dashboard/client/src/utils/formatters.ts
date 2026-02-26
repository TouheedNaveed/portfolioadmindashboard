import { format, formatDistanceToNow } from 'date-fns';

export function formatDate(dateStr: string): string {
    return format(new Date(dateStr), 'MMM d, yyyy');
}

export function formatDateTime(dateStr: string): string {
    return format(new Date(dateStr), "MMM d, yyyy 'at' h:mm a");
}

export function formatRelative(dateStr: string): string {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
}

export function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trimEnd() + '…';
}
