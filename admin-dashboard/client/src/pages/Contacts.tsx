import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Eye, Trash2, X, ChevronLeft, ChevronRight, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { contactsApi } from '@/api/contacts';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useDebounce } from '@/hooks/useDebounce';
import { formatDate, truncateText } from '@/utils/formatters';
import type { Contact, ContactFilters } from '@/types';

export default function Contacts() {
    const navigate = useNavigate();
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const [filters, setFilters] = useState<ContactFilters>({
        search: '', from: '', to: '', read: '', page: 1,
    });
    const debouncedSearch = useDebounce(filters.search, 300);

    const fetchContacts = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await contactsApi.list({ ...filters, search: debouncedSearch });
            setContacts(data.contacts);
            setTotal(data.total);
            setTotalPages(data.totalPages);
        } finally {
            setLoading(false);
        }
    }, [filters.page, filters.from, filters.to, filters.read, debouncedSearch]);

    useEffect(() => { fetchContacts(); }, [fetchContacts]);

    const hasActiveFilters = filters.search || filters.from || filters.to || filters.read;
    const clearFilters = () => setFilters({ search: '', from: '', to: '', read: '', page: 1 });

    const toggleSelect = (id: string) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === contacts.length) setSelectedIds(new Set());
        else setSelectedIds(new Set(contacts.map((c) => c.id)));
    };

    const handleBulkRead = async (read: boolean) => {
        await contactsApi.bulkRead([...selectedIds], read);
        setSelectedIds(new Set());
        fetchContacts();
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        await contactsApi.delete(deleteId);
        setDeleteId(null);
        setSelectedIds((prev) => { const next = new Set(prev); next.delete(deleteId); return next; });
        fetchContacts();
    };

    const pages = Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
        if (totalPages <= 5) return i + 1;
        const start = Math.max(1, Math.min(filters.page - 2, totalPages - 4));
        return start + i;
    });

    return (
        <div>
            <h2 style={{ fontFamily: 'Poppins, sans-serif', fontSize: 32, fontWeight: 700, color: 'var(--text-primary)' }}>Contacts</h2>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24 }}>Manage your contact form submissions</p>

            {/* Filter Bar */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ position: 'relative', width: 280 }}>
                    <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        className="input-base"
                        style={{ paddingLeft: 38 }}
                        placeholder="Search by name or email..."
                        value={filters.search}
                        onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value, page: 1 }))}
                    />
                </div>
                <input type="date" className="input-base" style={{ width: 160 }} placeholder="From" value={filters.from}
                    onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value, page: 1 }))} />
                <input type="date" className="input-base" style={{ width: 160 }} placeholder="To" value={filters.to}
                    onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value, page: 1 }))} />
                <select className="input-base" style={{ width: 160 }}
                    value={filters.read === undefined ? '' : String(filters.read)}
                    onChange={(e) => setFilters(f => ({ ...f, read: e.target.value === '' ? '' : e.target.value === 'true', page: 1 }))}>
                    <option value="">All Status</option>
                    <option value="false">Unread</option>
                    <option value="true">Read</option>
                </select>
                {hasActiveFilters && (
                    <button onClick={clearFilters} className="gradient-text" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <X size={12} /> Clear Filters
                    </button>
                )}
            </div>

            {/* Bulk Actions */}
            <AnimatePresence>
                {selectedIds.size > 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                        style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, padding: '10px 16px', background: 'var(--bg-surface)', borderRadius: 8, border: '1px solid var(--border-subtle)' }}
                    >
                        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{selectedIds.size} selected</span>
                        <Button variant="secondary" onClick={() => handleBulkRead(true)} style={{ height: 32, fontSize: 12 }}>Mark as Read</Button>
                        <Button variant="danger" onClick={() => handleBulkRead(false)} style={{ height: 32, fontSize: 12 }}>Mark Unread</Button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Table */}
            <div style={{ borderRadius: 8, border: '1px solid var(--border-subtle)', overflowX: 'auto' }}>
                <table className="data-table" style={{ minWidth: 800 }}>
                    <thead>
                        <tr>
                            <th style={{ width: 40 }}>
                                <input type="checkbox" checked={contacts.length > 0 && selectedIds.size === contacts.length} onChange={toggleSelectAll}
                                    style={{ accentColor: '#8B3FE8' }} />
                            </th>
                            <th>Name</th><th>Email</th><th>Message</th><th>Date</th><th>Status</th><th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Loading…</td></tr>
                        ) : contacts.length === 0 ? (
                            <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40 }}>
                                <MessageSquare size={32} style={{ color: 'var(--text-muted)', margin: '0 auto 12px', display: 'block' }} />
                                <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>No contacts found</p>
                                <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Try adjusting your filters</p>
                            </td></tr>
                        ) : (
                            <AnimatePresence>
                                {contacts.map((c, i) => (
                                    <motion.tr
                                        key={c.id}
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, height: 0 }}
                                        transition={{ delay: i * 0.03 }}
                                        style={{ background: selectedIds.has(c.id) ? 'var(--bg-hover)' : (i % 2 === 0 ? 'var(--bg-surface)' : 'var(--bg-base)') }}
                                    >
                                        <td>
                                            <input type="checkbox" checked={selectedIds.has(c.id)} onChange={() => toggleSelect(c.id)} style={{ accentColor: '#8B3FE8' }} />
                                        </td>
                                        <td style={{ fontWeight: 500 }}>{c.name}</td>
                                        <td style={{ color: 'var(--text-secondary)' }}>{c.email}</td>
                                        <td style={{ color: 'var(--text-secondary)' }}>{truncateText(c.message, 50)}</td>
                                        <td style={{ color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{formatDate(c.created_at)}</td>
                                        <td><Badge status={c.read ? 'read' : 'unread'} /></td>
                                        <td>
                                            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                                <button onClick={() => navigate(`/dashboard/contacts/${c.id}`)}
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}
                                                    title="View"><Eye size={16} /></button>
                                                <button onClick={() => setDeleteId(c.id)}
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}
                                                    title="Delete"><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 20 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                        Showing {(filters.page - 1) * 20 + 1}–{Math.min(filters.page * 20, total)} of {total} results
                    </span>
                    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                        <button onClick={() => setFilters((f) => ({ ...f, page: Math.max(1, f.page - 1) }))}
                            disabled={filters.page <= 1}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: 6, opacity: filters.page <= 1 ? 0.3 : 1, display: 'flex' }}>
                            <ChevronLeft size={16} />
                        </button>
                        {pages.map((p) => (
                            <button
                                key={p}
                                onClick={() => setFilters((f) => ({ ...f, page: p }))}
                                style={{
                                    width: 32, height: 32, borderRadius: '50%', border: 'none', fontSize: 12, fontWeight: 500,
                                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    background: filters.page === p ? 'linear-gradient(135deg, #3B1FD4, #E03FD8)' : 'transparent',
                                    color: filters.page === p ? '#F2F2ED' : 'var(--text-secondary)',
                                }}
                            >
                                {p}
                            </button>
                        ))}
                        {totalPages > 5 && pages[pages.length - 1] < totalPages && (
                            <><span style={{ color: 'var(--text-muted)' }}>…</span>
                                <button
                                    onClick={() => setFilters((f) => ({ ...f, page: totalPages }))}
                                    style={{ width: 32, height: 32, borderRadius: '50%', border: 'none', fontSize: 12, cursor: 'pointer', background: 'transparent', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                >{totalPages}</button></>
                        )}
                        <button onClick={() => setFilters((f) => ({ ...f, page: Math.min(totalPages, f.page + 1) }))}
                            disabled={filters.page >= totalPages}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: 6, opacity: filters.page >= totalPages ? 0.3 : 1, display: 'flex' }}>
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Contact">
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 20 }}>
                    Are you sure you want to delete this contact? This action cannot be undone.
                </p>
                <div style={{ display: 'flex', gap: 12 }}>
                    <Button variant="secondary" onClick={() => setDeleteId(null)} style={{ flex: 1 }}>Cancel</Button>
                    <Button variant="danger" onClick={handleDelete} style={{ flex: 1 }}>Delete</Button>
                </div>
            </Modal>
        </div>
    );
}
