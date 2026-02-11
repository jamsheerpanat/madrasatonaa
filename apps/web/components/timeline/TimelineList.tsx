
import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../../services/apiClient';
import { TimelineCard } from './TimelineCard';
import { TimelineFilters } from './TimelineFilters';
import { LoadingState } from '../LoadingState';
import { EmptyState } from '../EmptyState';
import { ErrorState } from '../ErrorState';
import { format, parseISO, isToday, isYesterday } from 'date-fns';

export function TimelineList() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [filters, setFilters] = useState<any>({});
    const [cursor, setCursor] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchEvents = useCallback(async (isLoadMore = false, resetCursor = false) => {
        try {
            if (isLoadMore) {
                setLoadingMore(true);
            } else {
                setLoading(true);
            }
            setError(null);

            const params = new URLSearchParams({
                limit: '20',
                ...filters
            });

            if (isLoadMore && cursor && !resetCursor) {
                params.append('cursor', cursor);
            }

            const res = await apiClient(`/timeline?${params.toString()}`);
            if (!res.ok) throw new Error('Failed to fetch timeline');

            const json = await res.json();

            if (isLoadMore) {
                setData(prev => [...prev, ...json.data]);
            } else {
                setData(json.data);
            }

            setCursor(json.next_cursor);
            setHasMore(!!json.next_cursor);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [filters, cursor]);

    // Initial fetch and filter change
    useEffect(() => {
        setCursor(null);
        fetchEvents(false, true);
    }, [filters]);

    const handleLoadMore = () => {
        fetchEvents(true, false);
    };

    // Helper to group events by date
    const groupedEvents = data.reduce((acc: any, event: any) => {
        const date = parseISO(event.created_at);
        let key = format(date, 'yyyy-MM-dd');

        if (isToday(date)) key = 'Today';
        else if (isYesterday(date)) key = 'Yesterday';
        else key = format(date, 'MMM d, yyyy');

        if (!acc[key]) acc[key] = [];
        acc[key].push(event);
        return acc;
    }, {});

    return (
        <div className="max-w-3xl mx-auto pb-20">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Activity Feed</h2>
                    <p className="text-slate-500 mt-1">Updates from across your school network</p>
                </div>
            </div>

            <div className="mb-8">
                <TimelineFilters filters={filters} onChange={setFilters} />
            </div>

            {loading && !loadingMore ? (
                <div className="py-12"><LoadingState /></div>
            ) : error ? (
                <ErrorState message={error} retry={() => fetchEvents(false, true)} />
            ) : data.length === 0 ? (
                <EmptyState title="No recent activity" description="When events happen, they'll appear here." />
            ) : (
                <div className="space-y-8 animate-in fade-in duration-500">
                    {Object.entries(groupedEvents).map(([dateLabel, events]: [string, any]) => (
                        <div key={dateLabel}>
                            <div className="sticky top-20 z-10 py-2 bg-slate-50/95 backdrop-blur mb-4 border-b border-slate-200">
                                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">{dateLabel}</h3>
                            </div>
                            <div className="space-y-4">
                                {events.map((event: any) => (
                                    <TimelineCard key={event.id} event={event} />
                                ))}
                            </div>
                        </div>
                    ))}

                    {hasMore && (
                        <div className="pt-8 text-center">
                            <button
                                onClick={handleLoadMore}
                                disabled={loadingMore}
                                className="px-8 py-3 bg-white border border-slate-200 shadow-sm text-sm font-semibold rounded-xl text-slate-700 hover:bg-slate-50 hover:shadow-md transition-all disabled:opacity-50 flex items-center gap-2 mx-auto"
                            >
                                {loadingMore ? 'Loading...' : 'Show Older Activity'}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
