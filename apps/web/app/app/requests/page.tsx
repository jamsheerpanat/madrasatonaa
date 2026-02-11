
'use client';

import { useState, useEffect } from 'react';
import { useMe } from '../../../lib/useMe';
import { apiClient } from '../../../services/apiClient';
import { LoadingState } from '../../../components/LoadingState';
import { useRouter } from 'next/navigation';
import { EmptyState } from '../../../components/EmptyState';
import {
    Plus, MessageSquare, AlertCircle, CheckCircle,
    Clock, User, ChevronRight, Inbox
} from 'lucide-react';

export default function RequestsPage() {
    const { me, loading } = useMe();
    const router = useRouter();
    const [tickets, setTickets] = useState<any[]>([]);
    const [filterStatus, setFilterStatus] = useState<string>('ALL'); // ALL, OPEN, RESOLVED
    const [loadingList, setLoadingList] = useState(true);

    useEffect(() => {
        if (!me) return;

        const load = async () => {
            setLoadingList(true);
            try {
                // If filter is ALL, maybe fetch all status? Or just let user switch.
                // The API /tickets?status=... likely defaults to something.
                // If I want ALL, I might need to make multiple calls or update API to support multiple or empty.
                // Assuming empty status returns all or I default to OPEN mostly.
                // Let's iterate: if filter is ALL, fetch 'OPEN,IN_PROGRESS'.

                let query = '';
                if (filterStatus === 'ALL') query = 'status=OPEN,IN_PROGRESS,RESOLVED,CLOSED'; // Ideally backend supports comma or 'all'
                else query = `status=${filterStatus}`;

                // Fallback if backend strictly needs one:
                if (filterStatus === 'ALL') query = ''; // Try empty

                const res = await apiClient(`/tickets?${query}`);
                const data = await res.json();
                setTickets(data.data || []); // Laravel pagination standard wrapping
            } catch (e) { console.error(e); }
            finally { setLoadingList(false); }
        };
        load();
    }, [me, filterStatus]);

    const canCreate = Array.isArray(me?.permissions) && me.permissions.includes('tickets.create');

    // Filter logic if client side needed (assuming API handles it though)
    const filteredTickets = tickets.filter(t => {
        if (filterStatus === 'ALL') return true;
        if (filterStatus === 'OPEN') return ['OPEN', 'IN_PROGRESS'].includes(t.status);
        if (filterStatus === 'RESOLVED') return ['RESOLVED', 'CLOSED'].includes(t.status);
        return t.status === filterStatus;
    });

    if (loading) return <LoadingState />;

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Support Requests</h1>
                    <p className="text-slate-500 mt-1">Track and manage your inquiries</p>
                </div>
                {canCreate && (
                    <button
                        onClick={() => router.push('/app/requests/new')}
                        className="inline-flex items-center px-5 py-2.5 bg-blue-600 text-white font-medium rounded-xl shadow-sm hover:bg-blue-700 hover:shadow-md transition-all active:scale-95"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        New Request
                    </button>
                )}
            </div>

            {/* Stats / Quick Filters */}
            <div className="flex p-1 bg-slate-100 rounded-xl overflow-hidden w-fit">
                {[
                    { id: 'ALL', label: 'All Tickets' },
                    { id: 'OPEN', label: 'Open' },
                    { id: 'RESOLVED', label: 'Resolved' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setFilterStatus(tab.id)}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${filterStatus === tab.id
                            ? 'bg-white text-slate-900 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* List */}
            {loadingList ? (
                <LoadingState />
            ) : filteredTickets.length === 0 ? (
                <EmptyState
                    title="No requests found"
                    description={filterStatus === 'ALL' ? "You haven't submitted any requests yet." : "No requests match this filter."}
                    action={canCreate && filterStatus === 'ALL' ? (
                        <button onClick={() => router.push('/app/requests/new')} className="text-blue-600 font-bold mt-2">Create one now</button>
                    ) : undefined}
                />
            ) : (
                <div className="space-y-4">
                    {filteredTickets.map((t: any) => {
                        const isHigh = t.priority === 'HIGH';
                        const isResolved = ['RESOLVED', 'CLOSED'].includes(t.status);

                        return (
                            <div
                                key={t.id}
                                onClick={() => router.push(`/app/requests/${t.id}`)}
                                className="group bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer flex flex-col sm:flex-row gap-4 items-start sm:items-center"
                            >
                                {/* Icon/Priority */}
                                <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${isResolved ? 'bg-green-100 text-green-600' :
                                    isHigh ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                                    }`}>
                                    {isResolved ? <CheckCircle className="w-6 h-6" /> :
                                        isHigh ? <AlertCircle className="w-6 h-6" /> :
                                            <Inbox className="w-6 h-6" />}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="text-lg font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                                            {t.subject}
                                        </h3>
                                        {isHigh && (
                                            <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide">High Priority</span>
                                        )}
                                        <span className="text-xs text-slate-400 font-mono">#{t.ticket_code}</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-slate-500">
                                        <span className="flex items-center gap-1">
                                            <MessageSquare className="w-3.5 h-3.5" />
                                            {t.category?.name_en || 'Support'}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <User className="w-3.5 h-3.5" />
                                            {t.creator?.first_name || 'Me'}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3.5 h-3.5" />
                                            {new Date(t.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>

                                {/* Status Badge */}
                                <div className="flex items-center gap-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${isResolved ? 'bg-slate-100 text-slate-600' :
                                        t.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-700' :
                                            'bg-green-50 text-green-700'
                                        }`}>
                                        {t.status.replace('_', ' ')}
                                    </span>
                                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition-colors hidden sm:block" />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
