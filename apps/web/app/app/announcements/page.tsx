
'use client';

import { useState, useEffect } from 'react';
import { useMe } from '../../../lib/useMe';
import { apiClient } from '../../../services/apiClient';
import { LoadingState } from '../../../components/LoadingState';
import { useRouter } from 'next/navigation';
import { TimelineCard } from '../../../components/timeline/TimelineCard';
import { EmptyState } from '../../../components/EmptyState';
import { Search, Plus } from 'lucide-react';

export default function AnnouncementsPage() {
    const { me, loading } = useMe();
    const router = useRouter();
    const [list, setList] = useState<any[]>([]);
    const [filteredList, setFilteredList] = useState<any[]>([]);
    const [loadingList, setLoadingList] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        if (!me) return;
        setLoadingList(true);
        apiClient('/broadcasts/announcements')
            .then(async (res) => {
                const data = await res.json();
                if (Array.isArray(data)) {
                    // Map to Timeline format
                    const mapped = data.map((item: any) => ({
                        id: item.id,
                        title_en: item.title_en,
                        body_en: item.body_en,
                        event_type: 'AnnouncementPublished',
                        created_at: item.published_at || item.created_at,
                        visibility_scope: 'branch', // Default assumption
                        actor: item.creator ? { full_name: item.creator.full_name } : undefined,
                        // Add specific payload if needed
                        payload_json: {
                            id: item.id
                        }
                    }));
                    setList(mapped);
                    setFilteredList(mapped);
                } else {
                    setList([]);
                }
            })
            .catch(err => {
                console.error('Failed to fetch announcements:', err);
            })
            .finally(() => setLoadingList(false));
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

    const canCreate = Array.isArray(me?.permissions) && me.permissions.includes('announcements.publish');

    if (loading) return <LoadingState />;

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Announcements</h1>
                    <p className="text-slate-500 mt-1">Official updates and news</p>
                </div>
                {canCreate && (
                    <button
                        onClick={() => router.push('/app/announcements/new')}
                        className="inline-flex items-center px-5 py-2.5 bg-indigo-600 text-white font-medium rounded-xl shadow-sm hover:bg-indigo-700 hover:shadow-md transition-all active:scale-95"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        New Announcement
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
                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm shadow-sm transition-shadow"
                    placeholder="Search announcements..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {loadingList ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-white rounded-xl h-40 animate-pulse border border-gray-100" />
                    ))}
                </div>
            ) : filteredList.length === 0 ? (
                <EmptyState
                    title={search ? "No results found" : "No announcements yet"}
                    description={search ? "Try adjusting your search terms." : "Check back later for updates."}
                />
            ) : (
                <div className="space-y-6">
                    {filteredList.map((item) => (
                        <TimelineCard key={item.id} event={item} />
                    ))}
                </div>
            )}
        </div>
    );
}
