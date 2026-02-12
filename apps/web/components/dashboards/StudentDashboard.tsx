'use client';

import { useMe } from '../../lib/useMe';
import {
    Calendar, Trophy, BookOpen, Clock,
    CheckCircle, BarChart2, Star, Target, Loader2
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { apiClient } from '../../services/apiClient';

export function StudentDashboard() {
    const { me } = useMe();
    const user = me?.user;
    const student = me?.student;
    const enrollment = student?.enrollments?.[0];
    const section = enrollment?.section;
    const grade = section?.grade;

    const [greeting, setGreeting] = useState('');
    const [loading, setLoading] = useState(true);
    const [timetable, setTimetable] = useState<any[]>([]);
    const [assignments, setAssignments] = useState<any[]>([]);
    const [attendance, setAttendance] = useState<any[]>([]);
    const [exams, setExams] = useState<any[]>([]);

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Good Morning');
        else if (hour < 18) setGreeting('Good Afternoon');
        else setGreeting('Good Evening');

        if (section?.id) {
            fetchDashboardData();
        } else {
            setLoading(false);
        }
    }, [section?.id]);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const [ttRes, asgnRes, attRes, examRes] = await Promise.all([
                apiClient(`/timetable/section/${section.id}`),
                apiClient(`/assignments/section/${section.id}`),
                apiClient(`/attendance/child/${student.id}/month`),
                apiClient(`/exams/section/${section.id}`)
            ]);

            if (ttRes.ok) setTimetable(await ttRes.json());
            if (asgnRes.ok) setAssignments(await asgnRes.json());
            if (attRes.ok) setAttendance(await attRes.json());
            if (examRes.ok) setExams(await examRes.json());
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    const today = new Date().toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
    const todaysClasses = timetable.filter(t => t.day_of_week === today)
        .sort((a, b) => a.period_no - b.period_no);

    const pendingAssignments = assignments.filter(a => {
        const due = new Date(a.due_at);
        return due > new Date();
    }).slice(0, 3);

    const attendanceRate = attendance.length > 0
        ? Math.round((attendance.filter(r => r.status === 'PRESENT').length / attendance.length) * 100)
        : 100;

    const nextExam = exams
        .filter((e: any) => new Date(e.exam_date) >= new Date())
        .sort((a: any, b: any) => new Date(a.exam_date).getTime() - new Date(b.exam_date).getTime())[0];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Student Hero */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl shadow-indigo-200">
                <div className="absolute top-0 right-0 p-8 opacity-20">
                    <Trophy className="w-64 h-64 -rotate-12 transform translate-x-12 -translate-y-12" />
                </div>
                <div className="relative z-10">
                    <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-bold uppercase tracking-wider border border-white/10 mb-4 inline-block">
                        Student Portal
                    </span>
                    <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
                        {greeting}, <br />{user.full_name?.split(' ')?.[0]}!
                    </h1>
                    <div className="flex flex-wrap gap-6 mb-8 text-indigo-100 font-medium">
                        <span className="flex items-center gap-2 bg-indigo-900/30 px-3 py-2 rounded-xl border border-indigo-400/30 backdrop-blur-sm">
                            <Target className="w-4 h-4 text-indigo-300" />
                            {grade?.name ? `${grade.name} - ${section?.name}` : 'Not Enrolled'}
                        </span>
                        <span className="flex items-center gap-2 bg-indigo-900/30 px-3 py-2 rounded-xl border border-indigo-400/30 backdrop-blur-sm">
                            <Star className="w-4 h-4 text-yellow-300" /> GPA: 3.8
                        </span>
                    </div>

                    <div className="flex flex-wrap gap-4">
                        <Link href="/app/assignments" className="px-6 py-3 bg-white text-indigo-700 font-bold rounded-xl shadow-lg hover:bg-indigo-50 hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                            View Assignments
                        </Link>
                        <Link href="/app/timetable" className="px-6 py-3 bg-indigo-500/30 text-white font-bold rounded-xl backdrop-blur-md border border-white/10 hover:bg-indigo-500/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                            My Timetable
                        </Link>
                    </div>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Attendance', value: `${attendanceRate}%`, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
                    { label: 'Assignments', value: `${assignments.length} Total`, icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Avg Grade', value: 'A-', icon: BarChart2, color: 'text-purple-600', bg: 'bg-purple-50' },
                    { label: 'Next Exam', value: nextExam ? new Date(nextExam.exam_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '--', icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
                ].map((stat) => (
                    <div key={stat.label} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center hover:border-indigo-100 hover:shadow-md transition-all">
                        <div className={`w-12 h-12 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center mb-3 shadow-inner`}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                        <span className="text-2xl font-bold text-slate-900">{loading ? '...' : stat.value}</span>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wide mt-1">{stat.label}</span>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Upcoming Classes */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                    <div className="flex justify-between items-center mb-6 border-b border-slate-50 pb-4">
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            <Clock className="w-6 h-6 text-indigo-500" /> Today's Schedule
                        </h2>
                        <span className="text-sm font-bold text-slate-400 px-3 py-1 bg-slate-50 rounded-full">{today}</span>
                    </div>

                    <div className="space-y-4">
                        {loading ? (
                            <div className="flex justify-center py-12">
                                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                            </div>
                        ) : todaysClasses.length > 0 ? (
                            todaysClasses.map((item, idx) => (
                                <div key={idx} className={`flex flex-col sm:flex-row gap-4 p-5 rounded-2xl border-l-4 transition-all hover:translate-x-1 ${idx === 0 ? 'bg-indigo-50/50 border-indigo-500' : 'bg-white border-slate-200 hover:border-indigo-300'}`}>
                                    <div className="min-w-[5rem] text-center sm:text-left border-r border-slate-100 sm:pr-4">
                                        <span className={`block text-2xl font-bold leading-none ${idx === 0 ? 'text-indigo-600' : 'text-slate-400'}`}>P{item.period_no}</span>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Period</span>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-slate-900">{item.subject?.name_en}</h3>
                                        <p className="text-slate-500 font-medium">
                                            {item.teacher?.full_name} {item.room_name && `• Room ${item.room_name}`}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                <p className="text-slate-500 font-medium italic">No classes scheduled for today</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Due Soon */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                    <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <BookOpen className="w-6 h-6 text-orange-500" /> Due Soon
                    </h2>
                    <ul className="space-y-4">
                        {loading ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
                            </div>
                        ) : pendingAssignments.length > 0 ? (
                            pendingAssignments.map((a, idx) => (
                                <Link key={a.id} href={`/app/assignments/${a.id}`} className="block group">
                                    <li className={`p-4 rounded-2xl border transition-all group-hover:shadow-md ${idx === 0 ? 'bg-orange-50 border-orange-100' : 'bg-slate-50 border-slate-100'}`}>
                                        <div className="flex justify-between items-start mb-2 text-[10px] font-bold uppercase tracking-tight">
                                            <span className={`px-2 py-0.5 rounded ${idx === 0 ? 'bg-orange-200 text-orange-800' : 'bg-blue-200 text-blue-800'}`}>
                                                {a.assignment_type}
                                            </span>
                                            <span className={idx === 0 ? 'text-orange-600' : 'text-slate-500'}>
                                                {new Date(a.due_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{a.title_en}</p>
                                        <p className="text-xs text-slate-500 mt-1 truncate">{a.instructions_en}</p>
                                    </li>
                                </Link>
                            ))
                        ) : (
                            <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                <p className="text-slate-500 text-sm italic">All caught up!</p>
                            </div>
                        )}
                    </ul>
                    <Link href="/app/assignments" className="mt-6 block text-center py-2 text-sm font-bold text-indigo-600 hover:text-indigo-700 hover:underline">
                        View All Assignments
                    </Link>
                </div>
            </div>
        </div>
    );
}

