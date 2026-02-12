'use client';

import { useMe } from '../../lib/useMe';
import {
    Users, TrendingUp, DollarSign, Calendar,
    CheckCircle, AlertTriangle, FileText, Bell
} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { apiClient } from '../../services/apiClient';

export function PrincipalDashboard() {
    const { me } = useMe();
    const user = me?.user;
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await apiClient('/principal/rhythm');
                if (res.ok) {
                    const json = await res.json();
                    setData(json);
                }
            } catch (error) {
                console.error('Failed to fetch rhythm data', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (!user) return null;

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            {/* Principal Hero */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl shadow-slate-400">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <TrendingUp className="w-64 h-64 -rotate-12 transform translate-x-12 -translate-y-12" />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-6">
                    <div>
                        <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-xs font-bold uppercase tracking-wider border border-white/10 mb-2 inline-block text-slate-300">
                            Executive Admin
                        </span>
                        <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">
                            Good Morning, {user.full_name?.split(' ')?.[0]}
                        </h1>
                        <p className="text-slate-400 max-w-lg text-lg">
                            Here is the daily overview for Madrasatonaa.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Link href="/app/broadcasts/new" className="px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                            <Bell className="w-4 h-4" /> New Announcement
                        </Link>
                        <Link href="/app/reports" className="px-5 py-2.5 bg-white/10 text-white font-bold rounded-xl backdrop-blur-md border border-white/10 hover:bg-white/20 transition-colors flex items-center gap-2">
                            <FileText className="w-4 h-4" /> Reports
                        </Link>
                    </div>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    {
                        label: 'Attendance',
                        value: loading ? '...' : `${data?.attendance_summary?.percent || 0}%`,
                        sub: loading ? 'Loading...' : `${data?.attendance_summary?.submitted}/${data?.attendance_summary?.total} Sections`,
                        icon: CheckCircle,
                        color: 'text-green-600',
                        bg: 'bg-green-50'
                    },
                    {
                        label: 'Memos Today',
                        value: loading ? '...' : (data?.memos_published_today || 0).toString(),
                        sub: 'Published',
                        icon: Bell,
                        color: 'text-orange-600',
                        bg: 'bg-orange-50'
                    },
                    {
                        label: 'Open Tickets',
                        value: loading ? '...' : (data?.tickets_open || 0).toString(),
                        sub: `${data?.tickets_high_priority_open || 0} High Priority`,
                        icon: AlertTriangle,
                        color: 'text-red-600',
                        bg: 'bg-red-50'
                    },
                    {
                        label: 'Upcoming Exams',
                        value: loading ? '...' : (data?.upcoming_exams_next_14_days || 0).toString(),
                        sub: 'Next 14 Days',
                        icon: Calendar,
                        color: 'text-indigo-600',
                        bg: 'bg-indigo-50'
                    },
                ].map((stat) => (
                    <div key={stat.label} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-slate-300 transition-all flex flex-col justify-center gap-3">
                        <div className="flex justify-between items-start">
                            <div className={`w-12 h-12 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-1 rounded-full bg-slate-100 text-slate-500 uppercase tracking-wide`}>
                                {stat.sub}
                            </span>
                        </div>
                        <div>
                            <span className="text-3xl font-bold text-slate-900 block">{stat.value}</span>
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">{stat.label}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Attendance Breakdown */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            <CheckCircle className="w-6 h-6 text-green-500" /> Attendance Submission
                        </h2>
                        <Link href="/app/attendance/overview" className="text-sm font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1 rounded-lg">View Details</Link>
                    </div>

                    {loading ? (
                        <div className="p-8 text-center text-slate-400">Loading data...</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs">
                                    <tr>
                                        <th className="px-4 py-3 rounded-l-lg">Section</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3 rounded-r-lg">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {data?.attendance_completion && data.attendance_completion.length > 0 ? (
                                        data.attendance_completion.slice(0, 5).map((item: any, i: number) => (
                                            <tr key={i} className="group hover:bg-slate-50 transition-colors">
                                                <td className="px-4 py-3 font-bold text-slate-900">
                                                    {item.section_name}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-1 rounded-lg text-xs font-bold ${item.status === 'SUBMITTED'
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-red-100 text-red-700'
                                                        }`}>
                                                        {item.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Link href={`/app/attendance/section/${item.section_id}`} className="text-slate-400 hover:text-blue-600 font-medium">
                                                        View
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={3} className="px-4 py-4 text-center text-slate-400 italic">No sections found</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                            {data?.attendance_completion?.length > 5 && (
                                <div className="mt-4 text-center">
                                    <span className="text-xs text-slate-400 font-medium">Showing top 5 of {data.attendance_completion.length} sections</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Quick Actions / System Status */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col h-full">
                    <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-indigo-500" /> System Pulse
                    </h2>

                    <div className="space-y-4 flex-1">
                        <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                            <h4 className="font-bold text-indigo-900 text-sm">Timetable Configuration</h4>
                            <div className="mt-2 w-full bg-indigo-200 rounded-full h-2">
                                <div
                                    className="bg-indigo-600 h-2 rounded-full transition-all duration-1000"
                                    style={{ width: `${data ? calcTimetablePercent(data.timetable_coverage) : 0}%` }}
                                ></div>
                            </div>
                            <p className="text-xs text-indigo-600 mt-2 font-medium text-right">
                                {data ? calcTimetablePercent(data.timetable_coverage) : 0}% Configured
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                                <span className="block text-2xl font-bold text-slate-800">
                                    {loading ? '-' : data?.assignments_published_today || 0}
                                </span>
                                <span className="text-[10px] uppercase font-bold text-slate-400">Assignments Today</span>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                                <span className="block text-2xl font-bold text-slate-800">
                                    {loading ? '-' : data?.assignments_due_next_7_days || 0}
                                </span>
                                <span className="text-[10px] uppercase font-bold text-slate-400">Due Next 7 Days</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-slate-100">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Quick Links</h3>
                        <div className="space-y-2">
                            <Link href="/app/users" className="block w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 text-sm font-medium text-slate-700 transition-colors">
                                Manage Users
                            </Link>
                            <Link href="/app/timetable" className="block w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 text-sm font-medium text-slate-700 transition-colors">
                                Master Timetable
                            </Link>
                            <Link href="/app/settings" className="block w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 text-sm font-medium text-slate-700 transition-colors">
                                School Settings
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function calcTimetablePercent(coverage: any[]): number {
    if (!coverage || coverage.length === 0) return 0;
    const configured = coverage.filter(c => c.status === 'CONFIGURED').length;
    return Math.round((configured / coverage.length) * 100);
}
