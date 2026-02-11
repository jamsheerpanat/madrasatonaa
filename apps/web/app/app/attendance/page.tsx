
'use client';

import { useState, useEffect } from 'react';
import { useMe } from '../../../lib/useMe';
import { apiClient } from '../../../services/apiClient';
import { LoadingState } from '../../../components/LoadingState';
import { ErrorState } from '../../../components/ErrorState';
import { useRouter } from 'next/navigation';
import {
    Calendar, Users, CheckCircle, XCircle, Clock,
    ChevronRight, BarChart3, ShieldCheck
} from 'lucide-react';
import Link from 'next/link';

export default function AttendanceHub() {
    const { me, loading: meLoading } = useMe();
    const router = useRouter();

    // Teacher State
    const [sections, setSections] = useState<any[]>([]);
    const [todayStats, setTodayStats] = useState({ present: 0, absent: 0, late: 0, total: 0 });

    // Parent State
    const [children, setChildren] = useState<any[]>([]);
    const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
    const [monthRecords, setMonthRecords] = useState<any[]>([]);

    const [loadingConfig, setLoadingConfig] = useState(false);

    useEffect(() => {
        if (meLoading || !me) return;

        async function load() {
            setLoadingConfig(true);
            try {
                if (me?.user_type === 'STAFF') {
                    // 1. Fetch Today's Overall Stats
                    const statsRes = await apiClient('/attendance/stats');
                    if (statsRes.ok) {
                        const sData = await statsRes.json();
                        setTodayStats(sData);
                    }

                    // 2. Fetch sections available to teacher
                    const res = await apiClient('/structure');
                    const data = await res.json();

                    const flat: any[] = [];
                    data.branches?.forEach((b: any) =>
                        b.grades?.forEach((g: any) =>
                            g.sections?.forEach((s: any) =>
                                flat.push({
                                    ...s,
                                    gradeName: g.name,
                                    branchId: b.id,
                                    studentCount: s.enrollments_count || 0
                                })
                            )
                        )
                    );

                    // One teacher = One class logic
                    const isPrincipal = me.permissions?.includes('principal.dashboard.view');
                    const filtered = isPrincipal ? flat : flat.filter(s => s.class_teacher_id === me.id);
                    setSections(filtered);
                }

                if (me?.user_type === 'PARENT') {
                    const res = await apiClient('/parent/children');
                    const data = await res.json();
                    setChildren(data);
                    if (data.length > 0) setSelectedChildId(data[0].id);
                }

                if (me?.user_type === 'STUDENT') {
                    const res = await apiClient('/attendance/child/month');
                    if (res.ok) {
                        const data = await res.json();
                        setMonthRecords(data);
                    }
                }
            } catch (e) { console.error(e); }
            finally { setLoadingConfig(false); }
        }
        load();
    }, [me, meLoading]);

    // Parent Load Month
    useEffect(() => {
        if (!selectedChildId) return;
        async function loadMonth() {
            try {
                const res = await apiClient(`/attendance/child/${selectedChildId}/month`);
                if (res.ok) setMonthRecords(await res.json());
            } catch (e) { }
        }
        loadMonth();
    }, [selectedChildId]);

    if (meLoading || loadingConfig) return <LoadingState />;

    // --- TEACHER / ADMIN VIEW ---
    if (me?.user_type === 'STAFF') {
        return (
            <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">

                {/* Modern Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-8">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-100">
                                <Users className="w-6 h-6 text-white" />
                            </div>
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Attendance Center</h1>
                        </div>
                        <p className="text-slate-500 font-medium text-lg ml-1">Track classroom presence and student punctuality with ease.</p>
                    </div>
                    <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border border-slate-100 shadow-xl shadow-slate-100/50">
                        <Calendar className="w-5 h-5 text-indigo-500" />
                        <span className="font-bold text-slate-800 tracking-tight">
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                    </div>
                </div>

                {/* Enhanced Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="group bg-gradient-to-br from-emerald-500 to-teal-600 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-emerald-200/50 relative overflow-hidden transition-all hover:scale-[1.02]">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-white/20 transition-all" />
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-8">
                                <p className="text-emerald-100 font-black uppercase tracking-widest text-xs">Total Present</p>
                                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                                    <CheckCircle className="w-6 h-6 text-white" />
                                </div>
                            </div>
                            <div className="flex items-end gap-2">
                                <h3 className="text-6xl font-black tracking-tighter">{todayStats.present}</h3>
                                <span className="text-emerald-100 font-bold mb-2 pb-1">Students</span>
                            </div>
                            <div className="mt-6 flex items-center gap-2 text-sm font-bold text-emerald-100/80">
                                <div className="w-2 h-2 rounded-full bg-emerald-200 animate-pulse" />
                                <span>Real-time presence tracking active</span>
                            </div>
                        </div>
                    </div>

                    <div className="group bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-xl shadow-slate-100 hover:shadow-2xl transition-all relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110" />
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-8">
                                <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Total Absences</p>
                                <div className="p-3 bg-rose-50 rounded-2xl group-hover:bg-rose-100 transition-colors">
                                    <XCircle className="w-6 h-6 text-rose-500" />
                                </div>
                            </div>
                            <div className="flex items-end gap-2">
                                <h3 className="text-6xl font-black text-slate-900 tracking-tighter">{todayStats.absent}</h3>
                                <span className="text-slate-400 font-bold mb-2 pb-1">Excuses Pending</span>
                            </div>
                            <div className="mt-6">
                                <div className="w-full h-1.5 bg-slate-50 rounded-full overflow-hidden">
                                    <div className="bg-rose-500 h-full w-1/3 rounded-full" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="group bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-xl shadow-slate-100 hover:shadow-2xl transition-all relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110" />
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-8">
                                <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Late Arrivals</p>
                                <div className="p-3 bg-amber-50 rounded-2xl group-hover:bg-amber-100 transition-colors">
                                    <Clock className="w-6 h-6 text-amber-500" />
                                </div>
                            </div>
                            <div className="flex items-end gap-2">
                                <h3 className="text-6xl font-black text-slate-900 tracking-tighter">{todayStats.late}</h3>
                                <span className="text-slate-400 font-bold mb-2 pb-1">Delayed Today</span>
                            </div>
                            <div className="mt-6 flex items-center gap-1.5 text-xs font-bold text-amber-600">
                                <BarChart3 className="w-3.5 h-3.5" />
                                <span>12% higher than yesterday</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Classrooms Grid Section */}
                <div className="pt-4">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                            <span className="w-2 h-8 bg-indigo-600 rounded-full" />
                            {sections.length === 1 ? 'My Managed Classroom' : 'My Active Classrooms'}
                        </h2>
                        {me?.permissions?.includes('principal.dashboard.view') && (
                            <button className="text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors px-4 py-2 hover:bg-indigo-50 rounded-xl">
                                View All Sections
                            </button>
                        )}
                    </div>

                    {sections.length === 0 ? (
                        <div className="text-center py-32 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                                <Users className="w-10 h-10 text-slate-300" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-800 mb-2">Assign Classrooms</h3>
                            <p className="text-slate-500 max-w-sm mx-auto font-medium">Please contact the school administrator to assign sections and grades to your teacher profile.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {sections.map(section => (
                                <Link
                                    key={section.id}
                                    href={`/app/attendance/mark?sectionId=${section.id}&date=${new Date().toISOString().split('T')[0]}`}
                                    className="group bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-lg shadow-slate-100/50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-bl-[4rem] transition-all group-hover:bg-indigo-600 group-hover:rounded-bl-none duration-500 opacity-30 group-hover:opacity-10" />

                                    <div className="relative">
                                        <div className="flex items-center justify-between mb-8">
                                            <span className="px-4 py-1.5 bg-indigo-50 text-indigo-700 text-[10px] font-black rounded-full uppercase tracking-[0.2em] border border-indigo-100 group-hover:bg-white group-hover:border-white transition-all">
                                                {section.gradeName}
                                            </span>
                                            <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all transform group-hover:rotate-12">
                                                <ChevronRight className="w-6 h-6" />
                                            </div>
                                        </div>

                                        <h3 className="text-3xl font-black text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors tracking-tight">{section.name}</h3>
                                        <div className="text-slate-500 font-bold text-sm mb-10 flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-200" />
                                            {me.full_name}
                                            <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-md text-slate-400 font-black uppercase tracking-tighter">Class Teacher</span>
                                        </div>

                                        <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-xs font-black text-indigo-600 shadow-inner group-hover:bg-indigo-100 transition-colors">
                                                    {section.studentCount}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Enrollment</span>
                                                    <span className="text-xs font-bold text-slate-600 mt-1">Confirmed Students</span>
                                                </div>
                                            </div>

                                            <div className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all shadow-lg shadow-slate-200">
                                                Open Dashboard
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // --- PARENT VIEW ---
    if (me?.user_type === 'PARENT') {
        return (
            <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">

                {/* Parent Hub Header */}
                <div className="flex items-center gap-6 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-100/50">
                    <div className="p-4 bg-emerald-500 rounded-3xl shadow-lg shadow-emerald-100">
                        <ShieldCheck className="w-10 h-10 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Attendance Monitor</h1>
                        <p className="text-slate-500 font-bold text-lg">Keep track of your child's presence and academic rhythm.</p>
                    </div>
                </div>

                {children.length === 0 ? (
                    <div className="py-32 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
                        <Users className="w-16 h-16 text-slate-200 mx-auto mb-6" />
                        <h3 className="text-xl font-bold text-slate-800">No students linked to your profile</h3>
                        <p className="text-slate-500">Please reach out to the school office to verify enrollment.</p>
                    </div>
                ) : (
                    <>
                        {/* Improved Child Selector */}
                        <div className="flex flex-wrap gap-2 bg-slate-100/50 p-2 rounded-2xl w-fit">
                            {children.map(child => (
                                <button
                                    key={child.id}
                                    onClick={() => setSelectedChildId(child.id)}
                                    className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${selectedChildId === child.id
                                        ? 'bg-white text-indigo-600 shadow-md transform scale-105'
                                        : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
                                        }`}
                                >
                                    {child.full_name}
                                </button>
                            ))}
                        </div>

                        {/* Layout: Stats & History */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                            {/* Left: Enhanced Monthly Overview */}
                            <div className="lg:col-span-4 space-y-8">
                                <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-100">
                                    <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-3">
                                        <div className="w-1.5 h-6 bg-indigo-600 rounded-full" />
                                        Monthly Pulse
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="group flex justify-between items-center bg-emerald-50/50 p-6 rounded-[2rem] border border-emerald-100 transition-all hover:bg-emerald-50">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-emerald-700/60 uppercase tracking-widest">Present</span>
                                                <span className="text-sm font-black text-emerald-800">Days Unmissed</span>
                                            </div>
                                            <span className="text-4xl font-black text-emerald-600 group-hover:scale-110 transition-transform">
                                                {monthRecords.filter(r => r.status === 'PRESENT').length}
                                            </span>
                                        </div>
                                        <div className="group flex justify-between items-center bg-rose-50/50 p-6 rounded-[2rem] border border-rose-100 transition-all hover:bg-rose-50">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-rose-700/60 uppercase tracking-widest">Absent</span>
                                                <span className="text-sm font-black text-rose-800">Days Missed</span>
                                            </div>
                                            <span className="text-4xl font-black text-rose-600 group-hover:scale-110 transition-transform">
                                                {monthRecords.filter(r => r.status === 'ABSENT').length}
                                            </span>
                                        </div>
                                        <div className="group flex justify-between items-center bg-amber-50/50 p-6 rounded-[2rem] border border-amber-100 transition-all hover:bg-amber-50">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-amber-700/60 uppercase tracking-widest">Late</span>
                                                <span className="text-sm font-black text-amber-800">Punctuality Gap</span>
                                            </div>
                                            <span className="text-4xl font-black text-amber-600 group-hover:scale-110 transition-transform">
                                                {monthRecords.filter(r => r.status === 'LATE').length}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-indigo-200 overflow-hidden relative group">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-125 transition-transform" />
                                    <h4 className="text-lg font-black tracking-tight mb-2 relative z-10">Attendance Policy</h4>
                                    <p className="text-indigo-100 text-sm font-medium leading-relaxed relative z-10">Consistency is key to academic success. Ensure your child maintains 95%+ attendance for optimal performance.</p>
                                </div>
                            </div>

                            {/* Right: Premium Activity Feed */}
                            <div className="lg:col-span-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-100 overflow-hidden">
                                <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
                                    <h3 className="text-xl font-black text-slate-800">Presence Timeline</h3>
                                    <div className="flex items-center gap-2 text-slate-400">
                                        <Clock className="w-4 h-4" />
                                        <span className="text-xs font-bold uppercase tracking-widest">Current Month</span>
                                    </div>
                                </div>
                                <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
                                    {monthRecords.length === 0 ? (
                                        <div className="p-20 text-center">
                                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                                <Calendar className="w-10 h-10 text-slate-200" />
                                            </div>
                                            <p className="text-slate-400 font-bold">No records found for the current month.</p>
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-slate-50/50">
                                            {monthRecords.map((record) => (
                                                <div key={record.record_id} className="p-6 hover:bg-slate-50/80 transition-all flex items-center justify-between group">
                                                    <div className="flex items-center gap-6">
                                                        <div className={`w-16 h-16 rounded-3xl flex flex-col items-center justify-center shadow-sm border transition-all group-hover:rotate-3 ${record.status === 'PRESENT' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                            record.status === 'ABSENT' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                                                'bg-amber-50 text-amber-600 border-amber-100'
                                                            }`}>
                                                            <span className="text-[10px] font-black uppercase tracking-tighter opacity-60">
                                                                {new Date(record.date).toLocaleDateString('en-US', { month: 'short' })}
                                                            </span>
                                                            <span className="text-2xl font-black leading-none">
                                                                {new Date(record.date).getDate()}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <div className="font-extrabold text-slate-900 text-lg tracking-tight">
                                                                {new Date(record.date).toLocaleDateString('en-US', { weekday: 'long' })}
                                                            </div>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Official School Day</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-col items-end gap-3">
                                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${record.status === 'PRESENT' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                            record.status === 'ABSENT' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                                                                'bg-amber-50 text-amber-700 border-amber-100'
                                                            }`}>
                                                            {record.status}
                                                        </span>

                                                        {record.status === 'ABSENT' && !record.justification_status && (
                                                            <button
                                                                onClick={() => {
                                                                    const reason = prompt("Please provide a reason for absence:");
                                                                    if (reason) {
                                                                        apiClient('/attendance/parent/justify', {
                                                                            method: 'POST',
                                                                            body: JSON.stringify({ attendance_record_id: record.record_id, justification_text: reason })
                                                                        }).then(() => {
                                                                            alert("Justification submitted for review.");
                                                                            window.location.reload();
                                                                        });
                                                                    }
                                                                }}
                                                                className="px-3 py-1 bg-white border border-indigo-100 rounded-lg text-[9px] font-black text-indigo-600 uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                                                            >
                                                                Submit Excuse
                                                            </button>
                                                        )}
                                                        {record.justification_status && (
                                                            <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-lg">
                                                                <div className={`w-1.5 h-1.5 rounded-full ${record.justification_status === 'APPROVED' ? 'bg-emerald-500' :
                                                                    record.justification_status === 'REJECTED' ? 'bg-rose-500' : 'bg-amber-500'
                                                                    }`} />
                                                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">
                                                                    Excuse: {record.justification_status}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        );
    }

    // --- STUDENT VIEW ---
    if (me?.user_type === 'STUDENT') {
        const presentCount = monthRecords.filter(r => r.status === 'PRESENT').length;
        const absentCount = monthRecords.filter(r => r.status === 'ABSENT').length;
        const lateCount = monthRecords.filter(r => r.status === 'LATE').length;
        const excusedCount = monthRecords.filter(r => r.status === 'EXCUSED').length;

        return (
            <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
                <div className="flex items-center gap-6 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-100/50">
                    <div className="p-4 bg-indigo-600 rounded-3xl shadow-lg shadow-indigo-100">
                        <Users className="w-10 h-10 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">My Attendance</h1>
                        <p className="text-slate-500 font-bold text-lg">Track your academic presence and keep up the rhythm.</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-[2.5rem] flex flex-col items-center">
                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2 text-center">Days Present</span>
                        <h2 className="text-5xl font-black text-emerald-700">{presentCount}</h2>
                    </div>
                    <div className="bg-rose-50 border border-rose-100 p-8 rounded-[2.5rem] flex flex-col items-center">
                        <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-2 text-center">Days Absent</span>
                        <h2 className="text-5xl font-black text-rose-700">{absentCount}</h2>
                    </div>
                    <div className="bg-amber-50 border border-amber-100 p-8 rounded-[2.5rem] flex flex-col items-center">
                        <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-2 text-center">Late Entries</span>
                        <h2 className="text-5xl font-black text-amber-700">{lateCount}</h2>
                    </div>
                    <div className="bg-blue-50 border border-blue-100 p-8 rounded-[2.5rem] flex flex-col items-center">
                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2 text-center">Excused Days</span>
                        <h2 className="text-5xl font-black text-blue-700">{excusedCount}</h2>
                    </div>
                </div>

                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-100 overflow-hidden">
                    <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                        <h3 className="text-xl font-black text-slate-800 tracking-tight">Timeline</h3>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Selected Period</span>
                    </div>

                    <div className="divide-y divide-slate-50">
                        {monthRecords.map((record) => {
                            const dateObj = new Date(record.date + 'T00:00:00');
                            return (
                                <div key={record.record_id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center gap-6">
                                        <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-black ${record.status === 'PRESENT' ? 'bg-emerald-100 text-emerald-700' :
                                                record.status === 'ABSENT' ? 'bg-rose-100 text-rose-700' :
                                                    record.status === 'EXCUSED' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-amber-100 text-amber-700'
                                            }`}>
                                            <span className="text-[9px] uppercase tracking-tighter opacity-70">
                                                {dateObj.toLocaleDateString('en-US', { month: 'short' })}
                                            </span>
                                            <span className="text-xl leading-none">
                                                {dateObj.getDate()}
                                            </span>
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-900">{dateObj.toLocaleDateString('en-US', { weekday: 'long' })}</div>
                                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">School Day</div>
                                        </div>
                                    </div>
                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${record.status === 'PRESENT' ? 'bg-emerald-50 text-emerald-600' :
                                            record.status === 'ABSENT' ? 'bg-rose-50 text-rose-600' :
                                                record.status === 'EXCUSED' ? 'bg-blue-50 text-blue-600' :
                                                    'bg-amber-50 text-amber-600'
                                        }`}>
                                        {record.status}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    }

    return <ErrorState message="Access Denied" />;
}
