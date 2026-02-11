
'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '../../../../services/apiClient';
import { useMe } from '../../../../lib/useMe';
import { LoadingState } from '../../../../components/LoadingState';
import { ErrorState } from '../../../../components/ErrorState';
import {
    Users, FileText, ClipboardList, Calendar, HelpCircle,
    ArrowUpRight, Clock, MapPin, CheckCircle, AlertCircle
} from 'lucide-react';
import Link from 'next/link';

export default function PrincipalDashboard() {
    const { me, loading: meLoading } = useMe();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!meLoading && me) {
            if (!me.permissions.includes('principal.dashboard.view')) {
                setError('You do not have permission to view this dashboard.');
                setLoading(false);
                return;
            }

            apiClient('/principal/rhythm')
                .then(async (res) => {
                    if (!res.ok) throw new Error('Failed to load dashboard');
                    return res.json();
                })
                .then(setData)
                .catch(err => setError(err.message))
                .finally(() => setLoading(false));
        }
    }, [me, meLoading]);

    if (meLoading || loading || !data) return <LoadingState />;

    if (error) return <ErrorState message={error} title="Access Denied" />;

    const stats = [
        { label: 'Assignments Due (7d)', value: data.assignments_due_next_7_days, icon: ClipboardList, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Upcoming Exams', value: data.upcoming_exams_next_14_days, icon: Calendar, color: 'text-purple-600', bg: 'bg-purple-50' },
        { label: 'Pending Memos', value: data.memos_pending_ack_count, icon: FileText, color: 'text-orange-600', bg: 'bg-orange-50' },
        { label: 'Staff Present', value: '42/45', icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' }, // Mock
    ];

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-50">
                    <div className="w-64 h-64 bg-indigo-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                </div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                    <div>
                        <div className="flex items-center gap-2 text-sm font-bold text-indigo-600 mb-2">
                            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
                            Principal's Rhythm
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900">Dashboard Overview</h1>
                        <p className="text-slate-500 mt-1 flex items-center gap-2">
                            <Clock className="w-4 h-4" /> {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            <span className="text-slate-300">•</span>
                            <MapPin className="w-4 h-4" /> Main Campus
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Link href="/app/admin/staff" className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-all shadow-sm">
                            Manage Staff
                        </Link>
                        <Link href="/app/admin/students" className="px-5 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2">
                            Student Directory <ArrowUpRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            {/* <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">+12%</span> */}
                        </div>
                        <h3 className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</h3>
                        <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Attendance Monitor */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            Attendance Completion
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full">Today</span>
                        </h3>
                        {/* <button className="text-indigo-600 text-sm font-bold hover:underline">View Report</button> */}
                    </div>

                    <div className="flex-1 overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-100">
                            <thead className="bg-slate-50/50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Class / Section</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Submission Time</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-50">
                                {data.attendance_completion && data.attendance_completion.length > 0 ? (
                                    data.attendance_completion.map((item: any) => (
                                        <tr key={item.section_id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                                                    {item.section_name.charAt(0)}
                                                </div>
                                                <span className="font-bold text-slate-700">{item.section_name}</span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-500">
                                                {item.marked_at ? new Date(item.marked_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${item.status === 'SUBMITTED'
                                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                                        : 'bg-amber-50 text-amber-700 border border-amber-100'
                                                    }`}>
                                                    {item.status === 'SUBMITTED' ? <CheckCircle className="w-3 h-3 mr-1" /> : <AlertCircle className="w-3 h-3 mr-1" />}
                                                    {item.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))) : (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-12 text-center text-slate-400">
                                            No attendance records found for today.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Updates / Notes */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">System Updates</h3>
                    <div className="space-y-4">
                        {data.notes.map((note: string, i: number) => (
                            <div key={i} className="flex gap-3">
                                <div className="mt-1 w-2 h-2 rounded-full bg-indigo-500 shrink-0"></div>
                                <p className="text-sm text-slate-600 leading-relaxed">{note}</p>
                            </div>
                        ))}
                        {data.notes.length === 0 && <p className="text-slate-400 italic">No system updates.</p>}
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-100">
                        <h4 className="font-bold text-slate-800 mb-3">Quick Actions</h4>
                        <div className="grid grid-cols-2 gap-3">
                            <Link href="/app/announcements/new" className="p-3 bg-slate-50 rounded-xl text-center text-xs font-bold text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors border border-slate-100">
                                Post Announcement
                            </Link>
                            <Link href="/app/timetable" className="p-3 bg-slate-50 rounded-xl text-center text-xs font-bold text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors border border-slate-100">
                                View Timetable
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
