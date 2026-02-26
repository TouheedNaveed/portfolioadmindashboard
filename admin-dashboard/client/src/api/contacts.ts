import api from './axios';
import type { ContactsResponse, ContactStats, Contact, ContactFilters } from '@/types';

export const contactsApi = {
    list: (filters: Partial<ContactFilters>) => {
        const params: Record<string, string | number> = {};
        if (filters.page) params.page = filters.page;
        if (filters.search) params.search = filters.search;
        if (filters.from) params.from = filters.from;
        if (filters.to) params.to = filters.to;
        if (filters.read !== '' && filters.read !== undefined) params.read = String(filters.read);
        return api.get<ContactsResponse>('/contacts', { params });
    },

    stats: () => api.get<ContactStats>('/contacts/stats'),

    get: (id: string) => api.get<{ contact: Contact }>(`/contacts/${id}`),

    updateRead: (id: string, read: boolean) =>
        api.patch<{ contact: Contact }>(`/contacts/${id}/read`, { read }),

    delete: (id: string) => api.delete<{ message: string }>(`/contacts/${id}`),

    bulkRead: (ids: string[], read: boolean) =>
        api.patch<{ count: number }>('/contacts/bulk-read', { ids, read }),
};
