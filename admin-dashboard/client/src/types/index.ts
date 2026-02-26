export interface User {
    id: string;
    name: string;
    email: string;
}

export interface AuthResponse {
    user: User;
    accessToken: string;
}

export interface Contact {
    id: string;
    name: string;
    email: string;
    subject?: string;
    message: string;
    read: boolean;
    ip_address?: string | null;
    created_at: string;
}

export interface ContactsResponse {
    contacts: Contact[];
    total: number;
    page: number;
    totalPages: number;
}

export interface ContactStats {
    total: number;
    thisMonth: number;
    unread: number;
    avgPerDay: number;
    monthlyChart: { month: string; count: number }[];
    trends: {
        total: { text: string; positive: boolean };
        thisMonth: { text: string; positive: boolean };
        unread: { text: string; positive: boolean };
        avgPerDay: { text: string; positive: boolean };
    };
}

export interface ContactFilters {
    search?: string;
    from?: string;
    to?: string;
    read?: string | boolean;
    page: number;
}
