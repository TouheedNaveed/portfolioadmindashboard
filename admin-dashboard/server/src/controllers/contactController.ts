import { Response } from 'express';
import { supabase } from '../lib/supabase';
import { AuthRequest } from '../middleware/authMiddleware';

// GET /api/contacts
export async function listContacts(req: AuthRequest, res: Response): Promise<void> {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const search = (req.query.search as string) || '';
    const from = req.query.from as string;
    const to = req.query.to as string;
    const readFilter = req.query.read as string;

    const offset = (page - 1) * limit;

    let query = supabase
        .from('contact_messages')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

    if (search) {
        query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
    }
    if (from) {
        query = query.gte('created_at', new Date(from).toISOString());
    }
    if (to) {
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
        query = query.lte('created_at', toDate.toISOString());
    }
    if (readFilter === 'true') {
        query = query.eq('read', true);
    } else if (readFilter === 'false') {
        query = query.eq('read', false);
    }

    const { data: contacts, count, error } = await query;

    if (error) {
        res.status(500).json({ error: 'Failed to fetch contacts' });
        return;
    }

    res.json({
        contacts: contacts || [],
        total: count || 0,
        page,
        totalPages: Math.ceil((count || 0) / limit),
    });
}

// GET /api/contacts/stats
export async function getStats(req: AuthRequest, res: Response): Promise<void> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999).toISOString();

    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - 7);
    const startOfWeekIso = startOfWeek.toISOString();

    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
    twelveMonthsAgo.setDate(1);
    twelveMonthsAgo.setHours(0, 0, 0, 0);

    const [
        totalRes,
        thisMonthRes,
        lastMonthRes,
        thisWeekRes,
        unreadRes,
        unreadTodayRes,
        firstRes,
        chartRes
    ] = await Promise.all([
        supabase.from('contact_messages').select('*', { count: 'exact', head: true }),
        supabase.from('contact_messages').select('*', { count: 'exact', head: true }).gte('created_at', startOfMonth),
        supabase.from('contact_messages').select('*', { count: 'exact', head: true }).gte('created_at', startOfLastMonth).lte('created_at', endOfLastMonth),
        supabase.from('contact_messages').select('*', { count: 'exact', head: true }).gte('created_at', startOfWeekIso),
        supabase.from('contact_messages').select('*', { count: 'exact', head: true }).eq('read', false),
        supabase.from('contact_messages').select('*', { count: 'exact', head: true }).eq('read', false).gte('created_at', startOfToday),
        supabase.from('contact_messages').select('created_at').order('created_at', { ascending: true }).limit(1).single(),
        supabase.from('contact_messages').select('created_at').gte('created_at', twelveMonthsAgo.toISOString()),
    ]);

    const total = totalRes.count || 0;
    const thisMonth = thisMonthRes.count || 0;
    const lastMonth = lastMonthRes.count || 0;
    const thisWeek = thisWeekRes.count || 0;
    const unread = unreadRes.count || 0;
    const unreadToday = unreadTodayRes.count || 0;

    let avgPerDay = 0;
    if (firstRes.data && total > 0) {
        const firstDate = new Date(firstRes.data.created_at);
        const daysDiff = Math.max(1, Math.ceil((now.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)));
        avgPerDay = parseFloat((total / daysDiff).toFixed(1));
    }

    const thisMonthDays = now.getDate();
    const thisMonthAvg = parseFloat((thisMonth / thisMonthDays).toFixed(1));
    const lastMonthDays = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
    const lastMonthAvg = lastMonth > 0 ? parseFloat((lastMonth / lastMonthDays).toFixed(1)) : 0;

    let thisMonthTrendValue = 0;
    if (lastMonth === 0) {
        thisMonthTrendValue = thisMonth > 0 ? 100 : 0;
    } else {
        thisMonthTrendValue = Math.round(((thisMonth - lastMonth) / lastMonth) * 100);
    }

    let avgTrendValue = 0;
    if (lastMonthAvg === 0) {
        avgTrendValue = thisMonthAvg > 0 ? 100 : 0;
    } else {
        avgTrendValue = Math.round(((thisMonthAvg - lastMonthAvg) / lastMonthAvg) * 100);
    }

    const trends = {
        total: {
            text: `+${thisWeek} this week`,
            positive: true
        },
        thisMonth: {
            text: `${thisMonthTrendValue >= 0 ? '+' : ''}${thisMonthTrendValue}% from last month`,
            positive: thisMonthTrendValue >= 0
        },
        unread: {
            text: `${unreadToday} new today`,
            positive: unreadToday === 0
        },
        avgPerDay: {
            text: `${avgTrendValue >= 0 ? '+' : ''}${avgTrendValue}% from last month`,
            positive: avgTrendValue >= 0
        }
    };

    // Generate last 12 months array
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyDataMap = new Map<string, number>();

    for (let i = 11; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        monthlyDataMap.set(`${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(2)}`, 0);
    }

    // Populate counts
    if (chartRes.data) {
        chartRes.data.forEach((row: any) => {
            const date = new Date(row.created_at);
            const key = `${monthNames[date.getMonth()]} ${date.getFullYear().toString().slice(2)}`;
            if (monthlyDataMap.has(key)) {
                monthlyDataMap.set(key, monthlyDataMap.get(key)! + 1);
            }
        });
    }

    const monthlyChart = Array.from(monthlyDataMap.entries()).map(([month, count]) => ({ month, count }));

    res.json({ total, thisMonth, unread, avgPerDay, monthlyChart, trends });
}

// GET /api/contacts/:id
export async function getContact(req: AuthRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !data) {
        res.status(404).json({ error: 'Contact not found' });
        return;
    }

    res.json({ contact: data });
}

// PATCH /api/contacts/:id/read
export async function updateReadStatus(req: AuthRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const { read } = req.body;

    if (typeof read !== 'boolean') {
        res.status(400).json({ error: 'read must be a boolean' });
        return;
    }

    const { data, error } = await supabase
        .from('contact_messages')
        .update({ read })
        .eq('id', id)
        .select('*')
        .single();

    if (error || !data) {
        res.status(404).json({ error: 'Contact not found' });
        return;
    }

    res.json({ contact: data });
}

// DELETE /api/contacts/:id
export async function deleteContact(req: AuthRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const { error } = await supabase
        .from('contact_messages')
        .delete()
        .eq('id', id);

    if (error) {
        res.status(404).json({ error: 'Contact not found or already deleted' });
        return;
    }

    res.json({ message: 'Contact deleted successfully' });
}

// PATCH /api/contacts/bulk-read
export async function bulkUpdateRead(req: AuthRequest, res: Response): Promise<void> {
    const { ids, read } = req.body;

    if (!Array.isArray(ids) || typeof read !== 'boolean') {
        res.status(400).json({ error: 'ids (array) and read (boolean) are required' });
        return;
    }

    const { count, error } = await supabase
        .from('contact_messages')
        .update({ read })
        .in('id', ids);

    if (error) {
        res.status(500).json({ error: 'Failed to update contacts' });
        return;
    }

    res.json({ count });
}
