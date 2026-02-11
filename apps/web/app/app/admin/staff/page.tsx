
'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '../../../../services/apiClient';
import { LoadingState } from '../../../../components/LoadingState';
import { Shield, UserPlus, Search, Mail, Phone, Briefcase, ChevronRight, MoreVertical, Filter } from 'lucide-react';
import Link from 'next/link';

export default function StaffMasterPage() {
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState<any[]>([]);
    const [meta, setMeta] = useState<any>(null);
    const [search, setSearch] = useState('');

    const fetchStaff = async (page = 1) => {
        setLoading(true);
        try {
            const res = await apiClient(`/admin/users?user_type=STAFF&page=${page}`);
            if (!res.ok) throw new Error('Failed to fetch users');
            const data = await res.json();
            setUsers(Array.isArray(data.data) ? data.data : []);
            setMeta(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStaff();
    }, []);

    const stats = [
        { label: 'Total Staff', value: users.length || 0, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { label: 'Teachers', value: users.filter(u => u.roles.some((r: any) => r.name === 'Teacher')).length, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Admins', value: users.filter(u => u.roles.some((r: any) => ['Principal', 'OfficeAdmin'].includes(r.name))).length, color: 'text-amber-600', bg: 'bg-amber-50' },
    ];

    if (loading && users.length === 0) return <LoadingState />;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                        <div className="p-2 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-200">
                            <Shield className="w-8 h-8 text-white" />
                        </div>
                        Staff Directory
                    </h1>
                    <p className="text-slate-500 mt-2 ml-1">Manage teachers, administrators, and support staff.</p>
                </div>
                <Link
                    href="/app/admin/staff/new"
                    className="px-6 py-2 bg-slate-900 text-white rounded-xl font-bold shadow-lg shadow-slate-200 hover:bg-slate-800 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2"
                >
                    <UserPlus className="w-4 h-4" />
                    Register Staff
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-shadow">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                        <div className="flex items-baseline gap-2 mt-2">
                            <h3 className={`text-4xl font-bold ${stat.color}`}>{stat.value}</h3>
                        </div>
                        <div className={`absolute top-0 right-0 p-4 opacity-50`}>
                            <div className={`w-12 h-12 rounded-full ${stat.bg} opacity-50 blur-xl`}></div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Search Bar */}
            <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-2 sticky top-24 z-10 backdrop-blur-xl bg-white/80">
                <div className="flex-1 relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-indigo-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search staff by name, email or ID..."
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl text-slate-900 placeholder:text-slate-400 font-medium focus:ring-2 focus:ring-indigo-100 focus:bg-white transition-all outline-none"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <button
                    onClick={() => fetchStaff(1)}
                    className="px-6 py-2 bg-indigo-50 text-indigo-700 font-bold rounded-lg hover:bg-indigo-100 transition-colors"
                >
                    Search
                </button>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {users.map((user) => (
                    <div key={user.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:border-indigo-200 hover:shadow-md transition-all group relative">
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                            <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg">
                                <MoreVertical className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="flex items-start gap-5">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-2xl shadow-lg ring-4 ring-indigo-50 group-hover:scale-105 transition-transform duration-300">
                                {(user.full_name || '').charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-lg font-bold text-slate-900 truncate">{user.full_name || 'Unknown Staff'}</h3>
                                <p className="text-sm font-medium text-indigo-600 truncate mb-1">
                                    {user.staff_profile?.job_title || 'Staff Member'}
                                </p>
                                {user.staff_profile?.employee_code && (
                                    <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded border border-slate-200">
                                        {user.staff_profile.employee_code}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="mt-6 space-y-3">
                            <div className="flex items-center text-sm text-slate-500 group/item hover:text-slate-800 transition-colors">
                                <div className="p-1.5 bg-slate-50 rounded-md mr-3 group-hover/item:bg-indigo-50 group-hover/item:text-indigo-600 transition-colors">
                                    <Mail className="w-3.5 h-3.5" />
                                </div>
                                <span className="truncate">{user.email || 'No email'}</span>
                            </div>
                            <div className="flex items-center text-sm text-slate-500 group/item hover:text-slate-800 transition-colors">
                                <div className="p-1.5 bg-slate-50 rounded-md mr-3 group-hover/item:bg-indigo-50 group-hover/item:text-indigo-600 transition-colors">
                                    <Phone className="w-3.5 h-3.5" />
                                </div>
                                <span className="truncate">{user.phone || 'No phone'}</span>
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-50 flex flex-wrap gap-2">
                            {user.roles.map((role: any) => (
                                <span key={role.id} className="text-[10px] font-bold px-2 py-1 bg-indigo-50/50 text-indigo-700 rounded-md border border-indigo-100 uppercase tracking-wide">
                                    {role.name}
                                </span>
                            ))}
                        </div>

                        <Link href={`/app/admin/staff/${user.id}`} className="mt-4 block w-full py-2 text-center text-sm font-bold text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-all border border-transparent hover:border-slate-100">
                            View Profile
                        </Link>
                    </div>
                ))}
            </div>

            {users.length === 0 && !loading && (
                <div className="bg-white p-20 rounded-2xl border border-dashed border-slate-200 text-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                        <Shield className="w-10 h-10" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-1">No Staff Found</h3>
                    <p className="text-slate-500">We couldn't find any staff members matching your criteria.</p>
                </div>
            )}
        </div>
    );
}
