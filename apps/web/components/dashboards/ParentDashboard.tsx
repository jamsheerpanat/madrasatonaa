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
    const [assignments, setAssignments] = useState<any[]>([]);
    const [tickets, setTickets] = useState<any[]>([]);

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
        async function fetchData() {
            if (!activeChild) return;

            setLoading(true);
            try {
                // 1. Attendance
                apiClient(`/attendance/child/${activeChild.id}/month`)
                    .then(r => r.json())
                    .then(data => {
                        if (Array.isArray(data)) setAttendance(data);
                    })
                    .catch(console.error);

                // 2. Assignments
                const enrollment = activeChild.enrollments?.find((e: any) => e.status === 'ACTIVE');
                if (enrollment) {
                    const res = await apiClient(`/assignments/section/${enrollment.section_id}?child_student_id=${activeChild.id}`);
                    if (res.ok) {
                        const data = await res.json();
                        setAssignments(data.slice(0, 5)); // Top 5
                    }
                } else {
                    setAssignments([]);
                }

                // 3. Tickets (Messages)
                const ticketRes = await apiClient('/tickets');
                if (ticketRes.ok) {
                    const data = await ticketRes.json();
                    setTickets(data.data || data); // Handle pagination or array
                }

            } catch (error) {
                console.error("Dashboard data fetch error:", error);
            } finally {
                setLoading(false);
            }
        }

        if (activeChild) fetchData();
    }, [activeChild]);

    if (meLoading) return <div className="p-8 text-center text-slate-500 font-medium">Loading Portal...</div>;

    const user = me?.user || me;
    if (!user) return null;

    const todayAttendance = attendance.find(r => r.date === new Date().toISOString().split('T')[0])?.status || 'No record';
    const presentCount = attendance.filter(r => r.status === 'PRESENT').length;

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
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
                            <Users className="w-6 h-6 text-teal-500" /> Recent Assignments
                        </h2>
                        <Link href="/app/assignments" className="text-sm font-bold text-teal-600 bg-teal-50 px-3 py-1 rounded-lg hover:bg-teal-100">View All</Link>
                    </div>

                    <div className="space-y-6 relative pl-4 border-l-2 border-slate-100 ml-2">
                        {assignments.length > 0 ? assignments.map((assignment: any) => (
                            <div key={assignment.id} className="relative pl-6">
                                <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-4 border-white shadow-sm ${new Date(assignment.due_at) < new Date() ? 'bg-red-500' : 'bg-blue-500'
                                    }`} />
                                <p className="text-sm text-slate-500 mb-1 font-mono text-xs">Due {new Date(assignment.due_at).toLocaleDateString()}</p>
                                <h4 className="font-bold text-slate-900 text-lg hover:text-blue-600 cursor-pointer">
                                    <Link href={`/app/assignments/${assignment.id}`}>{assignment.title_en}</Link>
                                </h4>
                                <p className="text-slate-600 mt-1 bg-slate-50 p-3 rounded-lg border border-slate-100 text-sm line-clamp-2">
                                    {assignment.description_en || 'No description provided.'}
                                </p>
                            </div>
                        )) : (
                            <div className="text-center py-8">
                                <p className="text-slate-400 italic">No recent assignments found.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Messages / Tickets */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                    <h2 className="text-xl font-bold text-slate-900 mb-6 icon-text flex items-center gap-2">
                        <MessageCircle className="w-5 h-5 text-indigo-500" /> Recent Tickets
                    </h2>

                    <div className="space-y-4">
                        {tickets.length > 0 ? tickets.slice(0, 3).map((ticket: any) => (
                            <div key={ticket.id} className="flex gap-4 p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-indigo-200 transition-colors">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${ticket.status === 'OPEN' ? 'bg-green-100 text-green-600' :
                                    ticket.status === 'CLOSED' ? 'bg-slate-200 text-slate-500' : 'bg-amber-100 text-amber-600'
                                    }`}>
                                    {ticket.status === 'IN_PROGRESS' ? 'WIP' : ticket.status}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-slate-900 text-sm truncate">{ticket.subject}</h4>
                                    <p className="text-xs text-slate-500 font-medium">#{ticket.ticket_code}</p>
                                    <p className="text-xs text-slate-700 mt-1 line-clamp-1">{ticket.message}</p>
                                </div>
                            </div>
                        )) : (
                            <p className="text-slate-400 text-center italic py-4">No support tickets found.</p>
                        )}

                        <Link href="/app/tickets/new" className="w-full py-3 mt-4 text-teal-600 font-bold bg-teal-50 rounded-xl hover:bg-teal-100 transition-colors flex items-center justify-center gap-2">
                            <MessageCircle className="w-4 h-4" /> Open New Ticket
                        </Link>
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
