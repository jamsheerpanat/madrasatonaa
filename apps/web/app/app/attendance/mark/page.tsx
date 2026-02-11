
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { apiClient } from '../../../../services/apiClient';
import { LoadingState } from '../../../../components/LoadingState';
import { ErrorState } from '../../../../components/ErrorState';
import {
    ArrowLeft, Save, Send, CheckCircle, XCircle, Search,
    MoreHorizontal, Filter, AlertTriangle, Clock, Calendar
} from 'lucide-react';
import { useMe } from '../../../../lib/useMe';

function AttendanceMarker() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const sectionId = searchParams.get('sectionId');
    const date = searchParams.get('date');
    const { me } = useMe();

    const [loading, setLoading] = useState(true);
    const [day, setDay] = useState<any>(null);
    const [records, setRecords] = useState<any[]>([]);
    const [filter, setFilter] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    useEffect(() => {
        if (!sectionId || !date) return;

        async function init() {
            try {
                // First try to fetch existing
                const res = await apiClient(`/attendance/section/${sectionId}/day?date=${date}`);

                if (res.ok) {
                    const data = await res.json();
                    // If data exists, use it
                    if (data && (data.id || data.data?.id)) {
                        const payload = data.data || data;
                        setDay(payload);
                        setRecords(payload.records || []);
                        return;
                    }
                }

                // If we are here, it means either 404 or empty data. Creating new...
                const createRes = await apiClient(`/attendance/section/${sectionId}/day`, {
                    method: 'POST',
                    body: JSON.stringify({ date })
                });

                if (createRes.ok) {
                    const data = await createRes.json();
                    const payload = data.data || data;
                    setDay(payload);
                    setRecords(payload.records || []);
                } else {
                    const err = await createRes.json().catch(() => ({}));
                    console.error("Create failed", err);
                    throw new Error("Could not create session");
                }

            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        init();
    }, [sectionId, date]);

    const stats = {
        present: (records || []).filter(r => r.status === 'PRESENT').length,
        absent: (records || []).filter(r => r.status === 'ABSENT').length,
        late: (records || []).filter(r => r.status === 'LATE').length,
        excused: (records || []).filter(r => r.status === 'EXCUSED').length,
    };

    const toggleStatus = (studentId: number) => {
        // Allowing marking even if submitted for flexibility

        setRecords(prev => (prev || []).map(r => {
            if (r.student_id === studentId) {
                // Cycle: PRESENT -> ABSENT -> LATE -> EXCUSED -> PRESENT
                const next =
                    r.status === 'PRESENT' ? 'ABSENT' :
                        r.status === 'ABSENT' ? 'LATE' :
                            r.status === 'LATE' ? 'EXCUSED' : 'PRESENT';
                return { ...r, status: next };
            }
            return r;
        }));
        setHasUnsavedChanges(true);
    };

    const setAllStatus = (status: string) => {
        if (!confirm(`Mark visible students as ${status}?`)) return;

        setRecords(prev => (prev || []).map(r => ({ ...r, status })));
        setHasUnsavedChanges(true);
    };

    const saveDraft = async () => {
        if (!day) return;
        setLoading(true);
        try {
            const marks = records.map(r => ({
                student_id: r.student_id,
                status: r.status,
                note: r.note
            }));

            const res = await apiClient(`/attendance/day/${day.id}/mark`, {
                method: 'PUT',
                body: JSON.stringify({ marks })
            });

            if (!res.ok) throw new Error("Failed to save");
            setHasUnsavedChanges(false);
            // alert("Draft Saved");
        } catch (e) {
            alert("Error saving draft");
        } finally {
            setLoading(false);
        }
    };

    const submitAttendance = async () => {
        if (!confirm("Submit attendance? Parents will be notified of absences instantly.")) return;

        // Auto-save first
        if (hasUnsavedChanges) await saveDraft();

        setLoading(true);
        try {
            const res = await apiClient(`/attendance/day/${day.id}/submit`, { method: 'POST' });
            if (!res.ok) throw new Error('Failed to submit');

            const updated = (await res.json()).data;
            setDay(updated);
            alert("Attendance Submitted & Parents Notified!");
            router.push('/app/attendance');
        } catch (e) {
            alert("Error submitting");
            setLoading(false);
        }
    };

    const filteredRecords = (records || []).filter(r => {
        const matchesFilter = filter === 'ALL' || r.status === filter;
        const matchesSearch = (r.student_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (r.student_code || '').toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    if (loading) return <LoadingState />;
    if (!day) return <ErrorState message="Could not load session" />;

    return (
        <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">

            {/* Unified Sticky Header Section */}
            <div className="sticky top-0 z-30 pt-4 pb-6 bg-slate-50/80 backdrop-blur-xl -mx-4 px-4 px-8 border-b border-slate-200/60 shadow-sm mb-8">
                <div className="max-w-7xl mx-auto">
                    {/* Top Row: Meta & Actions */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <button onClick={() => router.back()} className="p-2.5 hover:bg-white rounded-xl shadow-sm border border-slate-200 transition-all active:scale-95 group">
                                <ArrowLeft className="w-5 h-5 text-slate-500 group-hover:text-indigo-600" />
                            </button>
                            <div>
                                <div className="flex items-center gap-3">
                                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                                        Mark Attendance
                                    </h1>
                                    {day.status === 'SUBMITTED' ? (
                                        <span className="bg-emerald-50 text-emerald-700 text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-widest border border-emerald-100 flex items-center gap-1.5">
                                            <CheckCircle className="w-3 h-3" /> Submitted
                                        </span>
                                    ) : (
                                        <span className="bg-amber-50 text-amber-700 text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-widest border border-amber-100 flex items-center gap-1.5">
                                            <Clock className="w-3 h-3" /> Draft Mode
                                        </span>
                                    )}
                                </div>
                                <p className="text-slate-500 text-sm font-medium flex items-center gap-2 mt-0.5">
                                    <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                                    {new Date(date || '').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                            <button
                                onClick={saveDraft}
                                disabled={!hasUnsavedChanges}
                                className={`px-5 py-2.5 rounded-2xl text-sm font-bold transition-all flex items-center gap-2 border ${hasUnsavedChanges
                                    ? 'bg-white text-indigo-700 border-indigo-100 shadow-sm hover:border-indigo-200'
                                    : 'text-slate-300 border-slate-100 cursor-not-allowed opacity-50'
                                    }`}
                            >
                                <Save className="w-4 h-4" />
                                {day.status === 'SUBMITTED' ? 'Update Draft' : 'Save Draft'}
                            </button>
                            <button
                                onClick={submitAttendance}
                                className="px-6 py-2.5 bg-indigo-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2"
                            >
                                <Send className="w-4 h-4" />
                                {day.status === 'SUBMITTED' ? 'Update & Notify' : 'Submit'}
                            </button>
                        </div>
                    </div>

                    {/* Bottom Row: Stats & Controls Inline */}
                    <div className="flex flex-wrap items-center gap-4">
                        {/* Compact Stats */}
                        <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            {[
                                { label: 'Present', val: stats.present, color: 'emerald' },
                                { label: 'Absent', val: stats.absent, color: 'rose' },
                                { label: 'Late', val: stats.late, color: 'amber' },
                                { label: 'Excused', val: stats.excused, color: 'blue' },
                            ].map(s => (
                                <div key={s.label} className={`px-4 py-2 flex items-center gap-2 border-r last:border-0 border-slate-100`}>
                                    <span className={`w-2 h-2 rounded-full bg-${s.color}-500 animate-pulse`} />
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">{s.label}</span>
                                    <span className={`text-lg font-black text-${s.color}-600`}>{s.val}</span>
                                </div>
                            ))}
                        </div>

                        {/* Search & Filter */}
                        <div className="flex-1 flex flex-col md:flex-row gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search by name or ID..."
                                    className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl font-semibold text-slate-900 placeholder:text-slate-400 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all shadow-sm"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-1 bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
                                {['ALL', 'PRESENT', 'ABSENT', 'LATE', 'EXCUSED'].map(s => (
                                    <button
                                        key={s}
                                        onClick={() => setFilter(s)}
                                        className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === s
                                            ? 'bg-slate-900 text-white shadow-md'
                                            : 'text-slate-500 hover:bg-slate-50'
                                            }`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {day.status !== 'SUBMITTED' && (
                            <button
                                onClick={() => setAllStatus('PRESENT')}
                                className="px-4 py-2.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-emerald-100 transition-all flex items-center gap-2"
                            >
                                <CheckCircle className="w-3.5 h-3.5" />
                                Mark All Present
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Students Grid */}
            <div className="px-1">
                {filteredRecords.length === 0 ? (
                    <div className="text-center py-32 bg-white rounded-3xl border-2 border-dashed border-slate-100">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="w-8 h-8 text-slate-300" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">No matches found</h3>
                        <p className="text-slate-500">Try adjusting your filters or search query.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredRecords.map(record => (
                            <div
                                key={record.id}
                                onClick={() => toggleStatus(record.student_id)}
                                className={`group relative bg-white rounded-3xl border-2 p-1.5 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-100 hover:-translate-y-1.5 cursor-pointer ${record.status === 'PRESENT' ? 'border-transparent shadow-sm' :
                                    record.status === 'ABSENT' ? 'border-rose-500 shadow-rose-100' :
                                        record.status === 'LATE' ? 'border-amber-500 shadow-amber-100' :
                                            'border-blue-400 shadow-blue-100'
                                    }`}
                            >
                                <div className="p-4">
                                    {/* Status Indicator Bar */}
                                    <div className={`absolute top-0 left-12 right-12 h-1.5 rounded-b-full transition-all duration-300 ${record.status === 'PRESENT' ? 'bg-transparent' :
                                        record.status === 'ABSENT' ? 'bg-rose-500' :
                                            record.status === 'LATE' ? 'bg-amber-500' :
                                                'bg-blue-400'
                                        }`} />

                                    {/* Status Badge */}
                                    <div className="absolute top-4 right-4">
                                        <div className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm transition-colors ${record.status === 'PRESENT' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                            record.status === 'ABSENT' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                                                record.status === 'LATE' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                                    'bg-blue-50 text-blue-700 border-blue-100'
                                            }`}>
                                            {record.status}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 mb-6">
                                        <div className={`w-16 h-16 rounded-[2rem] flex items-center justify-center font-bold text-2xl transition-all duration-500 shadow-inner group-hover:rounded-2xl ${record.status === 'PRESENT' ? 'bg-slate-50 text-slate-400' :
                                            record.status === 'ABSENT' ? 'bg-rose-100 text-rose-600' :
                                                record.status === 'LATE' ? 'bg-amber-100 text-amber-600' :
                                                    'bg-blue-100 text-blue-600'
                                            }`}>
                                            {record.student_image ? (
                                                <img src={record.student_image} className="w-full h-full object-cover rounded-[2rem] group-hover:rounded-2xl transition-all" />
                                            ) : (
                                                (record.student_name || '?').charAt(0)
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-extrabold text-slate-900 truncate pr-8 leading-tight">{record.student_name}</h3>
                                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">ID: {record.student_code || record.student_id}</p>
                                        </div>
                                    </div>

                                    {/* Note Section */}
                                    <div className="relative group/note" onClick={e => e.stopPropagation()}>
                                        <input
                                            type="text"
                                            placeholder="Add private note..."
                                            className="w-full px-4 py-3 bg-slate-50/50 rounded-2xl text-xs font-medium text-slate-600 border border-slate-100/50 focus:bg-white focus:border-indigo-200 outline-none transition-all placeholder:text-slate-300 pr-10"
                                            value={record.note || ''}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setRecords(prev => prev.map(rec => rec.id === record.id ? { ...rec, note: val } : rec));
                                                setHasUnsavedChanges(true);
                                            }}
                                        />
                                        <MoreHorizontal className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-hover/note:text-indigo-400 transition-colors" />
                                    </div>
                                </div>

                                {/* Bottom Action (Hover only) */}
                                {true && (
                                    <div className="px-4 pb-2 text-center opacity-0 group-hover:opacity-100 transition-all">
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{day.status === 'SUBMITTED' ? 'Click to correct status' : 'Click to toggle status'}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function Page() {
    return (
        <Suspense fallback={<LoadingState />}>
            <AttendanceMarker />
        </Suspense>
    );
}
