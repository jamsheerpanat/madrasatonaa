'use client';

import { useMe } from '../../lib/useMe';
import {
    Calendar, Users, FileText, CheckSquare,
    BookOpen, Layers, Clock, ArrowRight, Loader2
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { apiClient } from '../../services/apiClient';

export function TeacherDashboard() {
    const { me } = useMe();
    const user = me?.user;

    const [loading, setLoading] = useState(true);
    const [timetable, setTimetable] = useState<any[]>([]);
    const [assignments, setAssignments] = useState<any[]>([]);

    useEffect(() => {
        if (user?.id) {
            fetchTeacherData();
        }
    }, [user?.id]);

    const fetchTeacherData = async () => {
        setLoading(true);
        try {
            const [ttRes, asgnRes] = await Promise.all([
                apiClient('/timetable/teacher/me'),
                apiClient('/assignments/mine')
            ]);

            if (ttRes.ok) setTimetable(await ttRes.json());
            if (asgnRes.ok) setAssignments(await asgnRes.json());
        } catch (err) {
            console.error('Error fetching teacher data:', err);
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    const today = new Date().toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
    const todaysClasses = timetable.filter(t => t.day_of_week === today)
        .sort((a, b) => a.period_no - b.period_no);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Teacher Hero */}
            <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl shadow-blue-200">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <BookOpen className="w-64 h-64 -rotate-12 transform translate-x-12 -translate-y-12" />
                </div>
                <div className="relative z-10 max-w-2xl">
                    <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-bold uppercase tracking-wider border border-white/10 mb-6 inline-block">
                        Teacher Dashboard
                    </span>
                    <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
                        Welcome back, <br />{user.full_name?.split(' ')?.[0]}!
                    </h1>
                    <p className="text-blue-100 text-lg mb-8 leading-relaxed font-medium">
                        {loading ? 'Fetching your schedule...' : (
                            todaysClasses.length > 0
                                ? `You have ${todaysClasses.length} classes scheduled for today. First class starts at Period ${todaysClasses[0].period_no}.`
                                : "You have no classes scheduled for today. Enjoy your day!"
                        )}
                    </p>

                    <div className="flex flex-wrap gap-4">
                        <Link href="/app/timetable" className="px-6 py-3 bg-white text-blue-700 font-bold rounded-xl shadow-lg hover:bg-blue-50 hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                            <Calendar className="w-5 h-5" /> View Schedule
                        </Link>
                        <Link href="/app/attendance" className="px-6 py-3 bg-blue-500/30 text-white font-bold rounded-xl backdrop-blur-md border border-white/10 hover:bg-blue-500/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                            <CheckSquare className="w-5 h-5" /> Take Attendance
                        </Link>
                    </div>
                </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { name: 'Assignments', href: '/app/assignments', icon: FileText, color: 'text-orange-600', bg: 'bg-orange-50', count: assignments.length },
                    { name: 'Exams & Grades', href: '/app/exams', icon: Layers, color: 'text-purple-600', bg: 'bg-purple-50' },
                    { name: 'Memos', href: '/app/memos', icon: BookOpen, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { name: 'Profile', href: '/app/profile', icon: Users, color: 'text-pink-600', bg: 'bg-pink-50' },
                ].map((action) => (
                    <Link
                        key={action.name}
                        href={action.href}
                        className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:border-indigo-200 hover:-translate-y-1 transition-all flex flex-col items-center text-center group relative overflow-hidden"
                    >
                        <div className={`w-12 h-12 rounded-xl ${action.bg} ${action.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                            <action.icon className="w-6 h-6" />
                        </div>
                        <span className="font-bold text-slate-800">{action.name}</span>
                        {action.count !== undefined && (
                            <span className="mt-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{action.count} Items</span>
                        )}
                    </Link>
                ))}
            </div>

            {/* Today's Schedule & Recent Updates */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Schedule */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                    <div className="flex justify-between items-center mb-6 border-b border-slate-50 pb-4">
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            <Clock className="w-6 h-6 text-blue-500" /> Today's Schedule
                        </h2>
                        <Link href="/app/timetable" className="text-sm font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1 rounded-lg">View Full</Link>
                    </div>

                    <div className="space-y-4">
                        {loading ? (
                            <div className="flex justify-center py-12">
                                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                            </div>
                        ) : todaysClasses.length > 0 ? (
                            todaysClasses.map((item, idx) => (
                                <div key={idx} className={`flex flex-col sm:flex-row gap-4 p-5 rounded-2xl border-l-4 transition-all hover:translate-x-1 ${idx === 0 ? 'bg-blue-50/50 border-blue-500' : 'bg-white border-slate-200 hover:border-blue-300'}`}>
                                    <div className="min-w-[5rem] text-center sm:text-left border-r border-slate-100 sm:pr-4">
                                        <span className={`block text-2xl font-bold leading-none ${idx === 0 ? 'text-blue-600' : 'text-slate-400'}`}>P{item.period_no}</span>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Period</span>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-slate-900">{item.subject?.name_en}</h3>
                                        <p className="text-slate-500 font-medium">
                                            {item.section?.grade?.name} - {item.section?.name} {item.room_name && `• Room ${item.room_name}`}
                                        </p>
                                    </div>
                                    {idx === 0 && (
                                        <div className="flex items-center">
                                            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold uppercase tracking-wide rounded-full flex items-center gap-1">
                                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> Active Class
                                            </span>
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                <p className="text-slate-500 font-medium italic">No classes scheduled for today</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Task List */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col h-full">
                    <h2 className="text-xl font-bold text-slate-900 mb-6">Pending Tasks</h2>
                    <ul className="space-y-4 flex-1">
                        <li className="flex gap-4 p-4 hover:bg-slate-50 rounded-2xl border border-transparent hover:border-slate-100 transition-all cursor-pointer group">
                            <div className="mt-1">
                                <div className="w-5 h-5 rounded-full border-2 border-slate-300 group-hover:border-blue-500 group-hover:bg-blue-50 transition-all" />
                            </div>
                            <div>
                                <p className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">Review Submissions</p>
                                <p className="text-xs text-slate-500 font-medium mt-1">Check recent student uploads</p>
                            </div>
                        </li>
                    </ul>
                    <button className="w-full py-4 mt-6 text-blue-600 font-bold bg-blue-50 rounded-2xl hover:bg-blue-100 transition-colors border border-blue-100/50">
                        Customize Tasks
                    </button>
                </div>
            </div>
        </div>
    );
}

