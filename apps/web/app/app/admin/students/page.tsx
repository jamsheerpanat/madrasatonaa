
'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '../../../../services/apiClient';
import { LoadingState } from '../../../../components/LoadingState';
import Link from 'next/link';
import {
    UserPlus, Search, Filter, ChevronRight, GraduationCap,
    MoreHorizontal, Download, Upload, SlidersHorizontal, ArrowUpRight
} from 'lucide-react';

export default function StudentMasterPage() {
    const [loading, setLoading] = useState(true);
    const [students, setStudents] = useState<any[]>([]);
    const [meta, setMeta] = useState<any>(null);
    const [search, setSearch] = useState('');
    const [sections, setSections] = useState<any[]>([]);
    const [selectedSection, setSelectedSection] = useState('');

    const fetchStudents = async (page = 1) => {
        setLoading(true);
        try {
            let url = `/admin/students?page=${page}`;
            if (search) url += `&search=${encodeURIComponent(search)}`;
            if (selectedSection) url += `&section_id=${selectedSection}`;

            const res = await apiClient(url);
            if (!res.ok) throw new Error('Failed to fetch students');
            const data = await res.json();
            setStudents(Array.isArray(data.data) ? data.data : []);
            setMeta(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchSections = async () => {
            try {
                const res = await apiClient('/sections');
                if (res.ok) {
                    const data = await res.json();
                    setSections(data);
                }
            } catch (e) {
                console.error(e);
            }
        };
        fetchSections();
        fetchStudents();
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchStudents(1);
    };

    const stats = [
        { label: 'Total Students', value: meta?.total || 0, trend: '+12%', color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { label: 'Active', value: meta?.total || 0, trend: '+5%', color: 'text-emerald-600', bg: 'bg-emerald-50' }, // Mock active count
        { label: 'New This Month', value: 24, trend: '+8%', color: 'text-blue-600', bg: 'bg-blue-50' },
    ];

    if (loading && students.length === 0) return <LoadingState />;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                        <div className="p-2 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-200">
                            <GraduationCap className="w-8 h-8 text-white" />
                        </div>
                        Student Directory
                    </h1>
                    <p className="text-slate-500 mt-2 ml-1">Manage enrollments, academic records, and profiles.</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl font-medium shadow-sm hover:bg-slate-50 hover:text-slate-900 transition-all flex items-center gap-2">
                        <Upload className="w-4 h-4" />
                        Import
                    </button>
                    <button className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl font-medium shadow-sm hover:bg-slate-50 hover:text-slate-900 transition-all flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                    <Link
                        href="/app/admin/students/new"
                        className="px-6 py-2 bg-slate-900 text-white rounded-xl font-bold shadow-lg shadow-slate-200 hover:bg-slate-800 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2"
                    >
                        <UserPlus className="w-4 h-4" />
                        New Student
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-shadow">
                        <div className={`absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity`}>
                            <ArrowUpRight className={`w-6 h-6 ${stat.color}`} />
                        </div>
                        <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{stat.label}</p>
                        <div className="flex items-baseline gap-2 mt-2">
                            <h3 className="text-3xl font-bold text-slate-900">{stat.value}</h3>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${stat.bg} ${stat.color}`}>
                                {stat.trend}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-2 sticky top-24 z-10 backdrop-blur-xl bg-white/80">
                <form onSubmit={handleSearch} className="flex-1 relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-indigo-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search students..."
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl text-slate-900 placeholder:text-slate-400 font-medium focus:ring-2 focus:ring-indigo-100 focus:bg-white transition-all outline-none"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </form>
                <div className="bg-slate-50/50 p-1.5 rounded-xl flex gap-2 border border-slate-100">
                    <div className="relative">
                        <select
                            className="appearance-none pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none cursor-pointer hover:border-indigo-300 transition-colors"
                            value={selectedSection}
                            onChange={(e) => setSelectedSection(e.target.value)}
                        >
                            <option value="">All Sections</option>
                            {sections.map(s => (
                                <option key={s.id} value={s.id}>{s.grade.name} - {s.name}</option>
                            ))}
                        </select>
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                    <button
                        onClick={() => fetchStudents(1)}
                        className="px-4 py-2 bg-indigo-50 text-indigo-700 font-bold rounded-lg hover:bg-indigo-100 transition-colors flex items-center gap-2"
                    >
                        <SlidersHorizontal className="w-4 h-4" />
                        Apply
                    </button>
                </div>
            </div>

            {/* Data Grid */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="min-w-full divide-y divide-slate-100">
                    <thead className="bg-slate-50/50">
                        <tr>
                            <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">Student Profile</th>
                            <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">ID Code</th>
                            <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">Class / Section</th>
                            <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                            <th className="px-6 py-4 text-right text-[10px] font-bold text-slate-500 uppercase tracking-widest">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 bg-white">
                        {students.map((student) => {
                            const activeEnrollment = student.enrollments?.find((e: any) => e.status === 'ACTIVE');
                            return (
                                <tr key={student.id} className="group hover:bg-indigo-50/30 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-indigo-100 ring-2 ring-white">
                                                {(student.full_name || '').charAt(0)}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">{student.full_name || 'Unknown Student'}</div>
                                                <div className="text-xs text-slate-500 flex items-center gap-1">
                                                    <span className={`w-1.5 h-1.5 rounded-full ${student.gender === 'MALE' ? 'bg-blue-400' : 'bg-pink-400'}`}></span>
                                                    {student.gender ? (student.gender === 'MALE' ? 'Male' : 'Female') : 'N/A'}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-mono font-bold rounded-md border border-slate-200 tracking-tight group-hover:border-indigo-200 group-hover:bg-indigo-50 group-hover:text-indigo-700 transition-all">
                                            {student.student_code}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                                            <div className="text-sm font-medium text-slate-700">
                                                {activeEnrollment ? `${activeEnrollment.section.grade.name} - ${activeEnrollment.section.name}` : 'Not Enrolled'}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${activeEnrollment
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                            : 'bg-amber-50 text-amber-700 border-amber-100'
                                            }`}>
                                            {activeEnrollment ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <Link
                                            href={`/app/admin/students/${student.id}`}
                                            className="inline-flex items-center justify-center p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                        >
                                            <ChevronRight className="w-5 h-5" />
                                        </Link>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {/* Empty State */}
                {students.length === 0 && !loading && (
                    <div className="p-20 text-center flex flex-col items-center justify-center">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 shadow-sm border border-slate-100">
                            <Search className="w-8 h-8 text-slate-300" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">No students found</h3>
                        <p className="text-slate-500 max-w-sm mx-auto">
                            We couldn't find any student records matching your criteria. Try adjusting your filters or add a new student.
                        </p>
                        <button
                            onClick={() => { setSearch(''); setSelectedSection(''); fetchStudents(1); }}
                            className="mt-6 text-indigo-600 font-bold hover:underline"
                        >
                            Clear Filters
                        </button>
                    </div>
                )}

                {/* Pagination */}
                {meta && meta.last_page > 1 && (
                    <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Page {meta.current_page} of {meta.last_page}
                        </div>
                        <div className="flex gap-2">
                            <button
                                disabled={meta.current_page === 1}
                                onClick={() => fetchStudents(meta.current_page - 1)}
                                className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                            >
                                Previous
                            </button>
                            <button
                                disabled={meta.current_page === meta.last_page}
                                onClick={() => fetchStudents(meta.current_page + 1)}
                                className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
