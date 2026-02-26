import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, CalendarDays, Mail, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { contactsApi } from '@/api/contacts';
import { Badge } from '@/components/ui/Badge';
import { formatDate, truncateText } from '@/utils/formatters';
import type { ContactStats, Contact } from '@/types';

const statConfig = [
    { key: 'total', label: 'TOTAL CONTACTS', icon: Users, format: (v: number) => v.toString() },
    { key: 'thisMonth', label: 'THIS MONTH', icon: CalendarDays, format: (v: number) => v.toString() },
    { key: 'unread', label: 'UNREAD', icon: Mail, format: (v: number) => v.toString() },
    { key: 'avgPerDay', label: 'AVG. PER DAY', icon: TrendingUp, format: (v: number) => v.toFixed(1) },
];


export default function Dashboard() {
    const [stats, setStats] = useState<ContactStats | null>(null);
    const [recent, setRecent] = useState<Contact[]>([]);
    const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
    const [refreshing, setRefreshing] = useState(false);

    const loadData = async () => {
        try {
            setRefreshing(true);
            const [statsRes, listRes] = await Promise.all([
                contactsApi.stats(),
                contactsApi.list({ page: 1 })
            ]);
            setStats(statsRes.data);
            setRecent(listRes.data.contacts.slice(0, 5));
            setLastRefresh(new Date());
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        } finally {
            setRefreshing(false);
        }
    };

    // Initial load and auto-refresh every 30 seconds
    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                        <h2 style={{ fontFamily: 'Poppins, sans-serif', fontSize: 32, fontWeight: 700, color: 'var(--text-primary)' }}>Overview</h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: 'var(--bg-elevated)', borderRadius: 20, border: '1px solid var(--border-subtle)', opacity: refreshing ? 0.7 : 1, transition: 'opacity 0.2s' }}>
                            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)', boxShadow: '0 0 8px var(--success)', animation: 'pulse 2s infinite' }} />
                            <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-secondary)' }}>
                                Live • Updated {lastRefresh.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </span>
                        </div>
                    </div>
                    <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Your portfolio at a glance</p>
                </div>
            </div>

            {/* Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 32 }}>
                {statConfig.map(({ key, label, icon: Icon, format }, i) => (
                    <motion.div
                        key={key}
                        className="card"
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                            <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</span>
                            <Icon size={18} style={{ color: 'var(--text-muted)' }} />
                        </div>
                        <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: 32, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
                            {stats ? format((stats as unknown as Record<string, number>)[key]) : '—'}
                        </p>
                        <span style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 4, color: stats?.trends[key as keyof ContactStats['trends']]?.positive ? 'var(--success)' : 'var(--danger)' }}>
                            {stats?.trends[key as keyof ContactStats['trends']]?.positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                            {stats?.trends[key as keyof ContactStats['trends']]?.text || '...'}
                        </span>
                    </motion.div>
                ))}
            </div>

            {/* Recent Contacts */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-primary)' }}>Recent Submissions</h3>
                <Link to="/dashboard/contacts" className="gradient-text" style={{ fontSize: 14, textDecoration: 'none', fontWeight: 500 }}>View All →</Link>
            </div>
            <div style={{ borderRadius: 8, border: '1px solid var(--border-subtle)', overflow: 'hidden', marginBottom: 32 }}>
                <table className="data-table">
                    <thead><tr>
                        <th>Name</th><th>Email</th><th>Message</th><th>Date</th><th>Status</th>
                    </tr></thead>
                    <tbody>
                        {recent.length === 0 ? (
                            <tr><td colSpan={5} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>No contacts yet</td></tr>
                        ) : recent.map((c) => (
                            <tr key={c.id} style={{ background: 'var(--bg-surface)' }}>
                                <td style={{ fontWeight: 500 }}>{c.name}</td>
                                <td style={{ color: 'var(--text-secondary)' }}>{c.email}</td>
                                <td style={{ color: 'var(--text-secondary)' }}>{truncateText(c.message, 40)}</td>
                                <td style={{ color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{formatDate(c.created_at)}</td>
                                <td><Badge status={c.read ? 'read' : 'unread'} /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Activity Chart */}
            <h3 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>Monthly Activity</h3>
            <div className="card" style={{ padding: 24, height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats?.monthlyChart || []}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--text-muted)" opacity={0.2} />
                        <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <Tooltip
                            contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 13 }}
                            cursor={{ fill: 'rgba(139,63,232,0.08)' }}
                        />
                        <defs>
                            <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#E03FD8" />
                                <stop offset="100%" stopColor="#3B1FD4" />
                            </linearGradient>
                        </defs>
                        <Bar dataKey="count" fill="url(#barGrad)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
