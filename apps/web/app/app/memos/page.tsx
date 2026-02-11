
'use client';

import { useState, useEffect } from 'react';
import { useMe } from '../../../lib/useMe';
import { apiClient } from '../../../services/apiClient';
import { LoadingState } from '../../../components/LoadingState';
import { useRouter } from 'next/navigation';
import { TimelineCard } from '../../../components/timeline/TimelineCard';
import { EmptyState } from '../../../components/EmptyState';
import { Search, Plus, CheckCircle, AlertOctagon } from 'lucide-react';

export default function MemosPage() {
    const { me, loading } = useMe();
    const router = useRouter();
    const [list, setList] = useState<any[]>([]);
    const [filteredList, setFilteredList] = useState<any[]>([]);
    const [loadingList, setLoadingList] = useState(true);
    const [search, setSearch] = useState('');

    const loadMemos = async () => {
        setLoadingList(true);
        try {
            const res = await apiClient('/broadcasts/memos');
            const data = await res.json();
            if (Array.isArray(data)) {
                // Map to Timeline format
                const mapped = data.map((item: any) => ({
                    id: item.id,
                    title_en: item.title_en,
                    body_en: item.body_en,
                    event_type: 'MemoPublished',
                    created_at: item.published_at || item.created_at,
                    visibility_scope: 'branch', // Default
                    actor: item.creator ? { full_name: item.creator.full_name } : undefined,
                    payload_json: {
                        id: item.id,
                        is_acknowledged: item.is_acknowledged,
                        ack_required: item.ack_required
                    },
                    // We modify body to exclude original because TimelineCard shows it. 
                    // But we need original fields for ack logic.
                    // The mapped object is what drives TimelineCard props.
                    // We can attach extra props if needed, but TimelineCard only takes 'event'.
                    // So payload_json is the place for metadata.
                }));
                setList(mapped);
                setFilteredList(mapped);
            } else {
                setList([]);
            }
        } catch (e) {
            console.error('Failed to load memos:', e);
            setList([]);
        } finally { setLoadingList(false); }
    };

    useEffect(() => {
        if (!me) return;
        loadMemos();
    }, [me]);

    useEffect(() => {
        if (!search.trim()) {
            setFilteredList(list);
            return;
        }
        const lower = search.toLowerCase();
        setFilteredList(list.filter(item =>
            item.title_en.toLowerCase().includes(lower) ||
            item.body_en?.toLowerCase().includes(lower)
        ));
    }, [search, list]);

    const handleAck = async (id: number) => {
        if (!confirm("Acknowledge receipt of this memo?")) return;
        try {
            await apiClient(`/broadcasts/memos/${id}/ack`, { method: 'POST' });
            // Optimistic update
            const updateList = (prev: any[]) => prev.map(m => {
                if (m.payload_json.id === id) {
                    return { ...m, payload_json: { ...m.payload_json, is_acknowledged: true } };
                }
                return m;
            });
            setList(updateList);
            // Updating filtered list will happen automatically if distinct objects, but here filteredList depends on list?
            // No, filteredList is separate state. Need to update both or recalculate.
            // Simplified: Update list, effect triggers.
            // But effect depends on list changes.
            // Wait, setting list state triggers re-render. Effect [search, list] runs?
            // Yes.
        } catch (e) { alert("Error acknowledging memo."); }
    };

    const canCreate = Array.isArray(me?.permissions) && me.permissions.includes('memos.publish');

    if (loading) return <LoadingState />;

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Memos & Circulars</h1>
                    <p className="text-slate-500 mt-1">Important documents requiring your attention</p>
                </div>
                {canCreate && (
                    <button
                        onClick={() => router.push('/app/memos/new')}
                        className="inline-flex items-center px-5 py-2.5 bg-orange-600 text-white font-medium rounded-xl shadow-sm hover:bg-orange-700 hover:shadow-md transition-all active:scale-95"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Create Memo
                    </button>
                )}
            </div>

            {/* Search */}
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 sm:text-sm shadow-sm transition-shadow"
                    placeholder="Search memos..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* Content */}
            {loadingList ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-white rounded-xl h-40 animate-pulse border border-gray-100" />
                    ))}
                </div>
            ) : filteredList.length === 0 ? (
                <EmptyState
                    title={search ? "No memos found" : "All caught up!"}
                    description={search ? "Try different keywords." : "No pending memos."}
                />
            ) : (
                <div className="space-y-6">
                    {filteredList.map((item) => {
                        const isAck = item.payload_json?.is_acknowledged;
                        const reqAck = item.payload_json?.ack_required;

                        // Custom Actions
                        const actions = (
                            <>
                                {isAck ? (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200">
                                        <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                                        Acknowledged
                                    </span>
                                ) : reqAck ? (
                                    <button
                                        onClick={() => handleAck(item.payload_json.id)}
                                        className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm hover:shadow transition-all transform active:scale-95"
                                    >
                                        <AlertOctagon className="w-4 h-4 mr-2" />
                                        Acknowledge Receipt
                                    </button>
                                ) : null}
                            </>
                        );

                        return (
                            <TimelineCard
                                key={item.id}
                                event={item}
                                actions={actions}
                            />
                        );
                    })}
                </div>
            )}
        </div>
    );
}
