'use client';

import { useMe } from '../../lib/useMe';
import {
    Users, Heart, DollarSign, MessageCircle,
    Calendar, AlertCircle, CheckCircle, ChevronDown
} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { apiClient } from '../../services/apiClient';

export function ParentDashboard() {
    const { me, loading: meLoading } = useMe();
    const [children, setChildren] = useState<any[]>([]);
    const [selectedChild, setSelectedChild] = useState(0);
    const [loading, setLoading] = useState(true);
    const [attendance, setAttendance] = useState<any[]>([]);

    useEffect(() => {
        async function fetchChildren() {
            try {
                const res = await apiClient('/parent/children');
                if (res.ok) {
                    const data = await res.json();
                    setChildren(data);
                }
            } catch (err) {
                console.error("Failed to fetch children:", err);
            } finally {
                setLoading(false);
            }
        }
        if (me) fetchChildren();
    }, [me]);

    const activeChild = children[selectedChild];

    useEffect(() => {
        if (activeChild) {
            apiClient(`/attendance/child/${activeChild.id}/month`)
                .then(r => r.json())
                .then(data => {
                    if (Array.isArray(data)) setAttendance(data);
                })
                .catch(console.error);
        }
    }, [activeChild]);

    if (meLoading || loading) return <div className="p-8 text-center text-slate-500 font-medium">Loading Portal...</div>;

    const user = me?.user || me;
    if (!user) return null;

    const todayAttendance = attendance.find(r => r.date === new Date().toISOString().split('T')[0])?.status || 'No record';
    const presentCount = attendance.filter(r => r.status === 'PRESENT').length;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Parent Hero */}
            <div className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl shadow-teal-200">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Heart className="w-64 h-64 -rotate-12 transform translate-x-12 -translate-y-12" />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div>
                        <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-bold uppercase tracking-wider border border-white/10 mb-4 inline-block">
                            Parent Portal
                        </span>
                        <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">
                            Hello, {user.full_name?.split(' ')?.[0]}
                        </h1>
                        <p className="text-teal-100 max-w-lg mb-4 text-lg">
                            Keep track of your children's progress and school updates.
                        </p>
                    </div>

                    {/* Child Switcher */}
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 p-1.5 rounded-xl flex gap-1 overflow-x-auto max-w-full">
                        {children.length > 0 ? children.map((child, idx) => (
                            <button
                                key={child.id}
                                onClick={() => setSelectedChild(idx)}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${selectedChild === idx
                                    ? 'bg-white text-teal-700 shadow-sm'
                                    : 'text-white/80 hover:bg-white/10'
                                    }`}
                            >
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs bg-white/20`}>
                                    {child.first_name_en?.[0] || 'S'}
                                </div>
                                {child.first_name_en}
                            </button>
                        )) : (
                            <span className="px-4 py-2 text-white/50 text-sm italic">No children linked</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Child Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Attendance', value: todayAttendance === 'PRESENT' ? 'Present' : todayAttendance === 'No record' ? 'Not Marked' : todayAttendance.toLowerCase(), sub: 'Today', icon: CheckCircle, color: todayAttendance === 'PRESENT' ? 'text-green-600' : 'text-slate-400', bg: todayAttendance === 'PRESENT' ? 'bg-green-50' : 'bg-slate-50' },
                    { label: 'Grade/Section', value: activeChild?.enrollments?.[0]?.section?.name || '-', sub: activeChild?.enrollments?.[0]?.section?.grade?.name || 'Loading...', icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Total Present', value: presentCount.toString(), sub: 'This Month', icon: Heart, color: 'text-pink-600', bg: 'bg-pink-50' },
                    { label: 'Admission #', value: activeChild?.admission_number || '-', sub: 'Student Code', icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                ].map((stat) => (
                    <div key={stat.label} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-slate-200 transition-all flex flex-col items-center text-center cursor-default">
                        <div className={`w-12 h-12 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center mb-3`}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                        <span className="text-xl font-bold text-slate-900 truncate w-full">{stat.value}</span>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wide mt-1">{stat.label}</span>
                        <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full mt-2 font-medium">{stat.sub}</span>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activity / Timeline */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            <Users className="w-6 h-6 text-teal-500" /> Activity Feed {activeChild && `for ${activeChild.first_name_en}`}
                        </h2>
                        <Link href="/app/timeline" className="text-sm font-bold text-teal-600 bg-teal-50 px-3 py-1 rounded-lg hover:bg-teal-100">View Full Timeline</Link>
                    </div>

                    <div className="space-y-6 relative pl-4 border-l-2 border-slate-100 ml-2">
                        {activeChild ? (
                            <div className="relative pl-6">
                                <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-blue-500 border-4 border-white shadow-sm" />
                                <p className="text-sm text-slate-500 mb-1 font-mono text-xs">Today</p>
                                <h4 className="font-bold text-slate-900 text-lg">Academic Update</h4>
                                <p className="text-slate-600 mt-1 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                    {activeChild.first_name_en} is currently enrolled in {activeChild.enrollments?.[0]?.section?.grade?.name || 'their assigned grade'}.
                                </p>
                            </div>
                        ) : (
                            <p className="text-slate-400 italic">No activity to show</p>
                        )}

                        <div className="relative pl-6 opacity-75">
                            <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-green-500 border-4 border-white shadow-sm" />
                            <p className="text-sm text-slate-500 mb-1 font-mono text-xs">Yesterday, 02:30 PM</p>
                            <h4 className="font-bold text-slate-900 text-lg">Bus Arrived Home</h4>
                            <p className="text-slate-600 mt-1">
                                Transport notification: Drop-off confirmed at home location.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Messages / Quick Contacts */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                    <h2 className="text-xl font-bold text-slate-900 mb-6 icon-text"><MessageCircle className="w-5 h-5" /> Recent Messages</h2>
                    <div className="space-y-4">
                        <div className="flex gap-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">MR</div>
                            <div>
                                <h4 className="font-bold text-slate-900 text-sm">Mr. Roberts</h4>
                                <p className="text-xs text-slate-500 font-medium">Math Teacher</p>
                                <p className="text-xs text-slate-700 mt-1 line-clamp-1"> regarding the upcoming exam schedule...</p>
                            </div>
                        </div>
                        <button className="w-full py-3 mt-4 text-teal-600 font-bold bg-teal-50 rounded-xl hover:bg-teal-100 transition-colors flex items-center justify-center gap-2">
                            <MessageCircle className="w-4 h-4" /> Message Teachers
                        </button>
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-100">
                        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Quick Links</h2>
                        <ul className="space-y-2">
                            <li><Link href="/app/requests/new" className="block p-2 hover:bg-slate-50 rounded text-slate-700 font-medium">Report Absence</Link></li>
                            <li><Link href="/app/fees" className="block p-2 hover:bg-slate-50 rounded text-slate-700 font-medium">Pay School Fees</Link></li>
                            <li><Link href="/app/calendar" className="block p-2 hover:bg-slate-50 rounded text-slate-700 font-medium">School Calendar</Link></li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
