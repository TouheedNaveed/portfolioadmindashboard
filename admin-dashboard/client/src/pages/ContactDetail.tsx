import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { contactsApi } from '@/api/contacts';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { formatDateTime } from '@/utils/formatters';
import type { Contact } from '@/types';

export default function ContactDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [contact, setContact] = useState<Contact | null>(null);
    const [loading, setLoading] = useState(true);
    const [showDelete, setShowDelete] = useState(false);

    useEffect(() => {
        if (!id) return;
        contactsApi.get(id).then(({ data }) => { setContact(data.contact); setLoading(false); }).catch(() => setLoading(false));
    }, [id]);

    const toggleRead = async () => {
        if (!contact) return;
        const { data } = await contactsApi.updateRead(contact.id, !contact.read);
        setContact(data.contact);
    };

    const handleDelete = async () => {
        if (!contact) return;
        await contactsApi.delete(contact.id);
        navigate('/dashboard/contacts');
    };

    if (loading) return <div style={{ padding: 32, color: 'var(--text-muted)' }}>Loading…</div>;
    if (!contact) return <div style={{ padding: 32, color: 'var(--text-muted)' }}>Contact not found</div>;

    return (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <Link to="/dashboard/contacts" className="gradient-text" style={{ fontSize: 14, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 24 }}>
                <ArrowLeft size={14} /> Back to Contacts
            </Link>

            <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
                {/* Left: Message */}
                <div style={{ flex: '1 1 58%', minWidth: 300 }}>
                    <h2 style={{ fontFamily: 'Poppins, sans-serif', fontSize: 32, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                        {contact.name}
                    </h2>
                    <a href={`mailto:${contact.email}`} className="gradient-text" style={{ fontSize: 14, textDecoration: 'none' }}>
                        {contact.email}
                    </a>

                    <hr style={{ border: 'none', borderTop: '1px solid var(--border-subtle)', margin: '24px 0' }} />

                    {contact.subject && (
                        <>
                            <p style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Subject</p>
                            <p style={{ fontSize: 14, color: 'var(--text-primary)', marginBottom: 20 }}>{contact.subject}</p>
                        </>
                    )}

                    <p style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Message</p>
                    <div style={{
                        background: 'var(--bg-elevated)', borderRadius: 8, padding: 20,
                        fontSize: 14, lineHeight: 1.75, color: 'var(--text-primary)', whiteSpace: 'pre-wrap',
                    }}>
                        {contact.message}
                    </div>
                </div>

                {/* Right: Metadata */}
                <div style={{ flex: '1 1 35%', minWidth: 260 }}>
                    <div className="card">
                        <h3 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 20 }}>Contact Details</h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                            {[
                                { label: 'Received', value: formatDateTime(contact.created_at) },
                                { label: 'Status', value: <Badge status={contact.read ? 'read' : 'unread'} /> },
                                ...(contact.ip_address ? [{ label: 'IP Address', value: <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{contact.ip_address}</span> }] : []),
                                { label: 'ID', value: <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace' }}>{contact.id.slice(0, 16)}…</span> },
                            ].map(({ label, value }) => (
                                <div key={label} style={{ padding: '12px 0', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{label}</span>
                                    <span style={{ fontSize: 14 }}>{value}</span>
                                </div>
                            ))}
                        </div>

                        <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <Button variant="secondary" onClick={toggleRead} style={{ width: '100%' }}>
                                <Check size={14} /> {contact.read ? 'Mark as Unread' : 'Mark as Read'}
                            </Button>
                            <Button variant="danger" onClick={() => setShowDelete(true)} style={{ width: '100%' }}>
                                <Trash2 size={14} /> Delete Contact
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <Modal open={showDelete} onClose={() => setShowDelete(false)} title="Delete Contact">
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 20 }}>
                    Are you sure? This will permanently delete this contact submission.
                </p>
                <div style={{ display: 'flex', gap: 12 }}>
                    <Button variant="secondary" onClick={() => setShowDelete(false)} style={{ flex: 1 }}>Cancel</Button>
                    <Button variant="danger" onClick={handleDelete} style={{ flex: 1 }}>Delete</Button>
                </div>
            </Modal>
        </motion.div>
    );
}
