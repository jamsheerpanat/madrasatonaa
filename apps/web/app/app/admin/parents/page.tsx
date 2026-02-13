'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '../../../../services/apiClient';
import { LoadingState } from '../../../../components/LoadingState';
import { UserCheck, UserPlus, Search, Mail, Phone, MoreVertical, Child, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function ParentsPage() {
    const [loading, setLoading] = useState(true);
    const [guardians, setGuardians] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState<any>(null);

    const fetchGuardians = async (p = 1) => {
        setLoading(true);
        try {
            const res = await apiClient(`/admin/guardians?page=${p}&search=${search}`);
            if (res.ok) {
                const data = await res.json();
                setGuardians(data.data || []);
                setMeta(data);
                setPage(p);
            }
        } catch (error) {
            console.error('Failed to fetch parents', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => fetchGuardians(1), 500);
        return () => clearTimeout(timer);
    }, [search]);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                        <div className="p-2 bg-orange-600 rounded-lg shadow-lg shadow-orange-200">
                            <UserCheck className="w-8 h-8 text-white" />
                        </div>
                        Parents & Guardians
                    </h1>
                    <p className="text-slate-500 mt-2 ml-1">Manage guardian accounts and family relationships.</p>
                </div>
                <Link
                    href="/app/admin/parents/new"
                    className="px-6 py-2 bg-slate-900 text-white rounded-xl font-bold shadow-lg shadow-slate-200 hover:bg-slate-800 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2"
                >
                    <UserPlus className="w-4 h-4" />
                    Register Parent
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Guardians</p>
                    <h3 className="text-4xl font-bold text-orange-600 mt-2">{meta?.total || 0}</h3>
                </div>
            </div>

            {/* Search */}
            <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200 relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-orange-500 transition-colors" />
                <input
                    type="text"
                    placeholder="Search by name, email, phone or national ID..."
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl text-slate-900 placeholder:text-slate-400 font-medium focus:ring-2 focus:ring-orange-100 focus:bg-white transition-all outline-none"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* List */}
            {loading && guardians.length === 0 ? (
                <LoadingState />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {guardians.map((guardian) => (
                        <div key={guardian.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:border-orange-200 hover:shadow-md transition-all group relative">
                            <Link href={`/app/admin/parents/${guardian.id}`} className="absolute inset-0 z-10" />

                            <div className="flex items-start gap-5">
                                <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold text-xl">
                                    {guardian.user?.full_name?.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-bold text-slate-900 truncate group-hover:text-orange-600 transition-colors">
                                        {guardian.user?.full_name}
                                    </h3>
                                    <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mt-1">
                                        <span className="bg-slate-100 px-2 py-0.5 rounded">ID: {guardian.national_id || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 space-y-3">
                                <div className="flex items-center text-sm text-slate-500">
                                    <Mail className="w-4 h-4 mr-3 text-slate-300" />
                                    <span className="truncate">{guardian.user?.email || 'No Email'}</span>
                                </div>
                                <div className="flex items-center text-sm text-slate-500">
                                    <Phone className="w-4 h-4 mr-3 text-slate-300" />
                                    <span className="truncate">{guardian.user?.phone || 'No Phone'}</span>
                                </div>
                            </div>

                            <div className="mt-6 pt-4 border-t border-slate-50 flex justify-between items-center">
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg">
                                    <ChildIcon className="w-4 h-4 text-slate-400" />
                                    {guardian.students?.length || 0} Children Linked
                                </div>
                                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-orange-500 transition-colors" />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {guardians.length === 0 && !loading && (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                        <UserCheck className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">No Guardians Found</h3>
                    <p className="text-slate-500">Try adjusting your search filters.</p>
                </div>
            )}
        </div>
    );
}

function ChildIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M16 10a4 4 0 0 1-8 0" />
            <circle cx="12" cy="10" r="4" />
            <path d="M12 14v10" />
            <path d="M16 22H8" />
            <path d="M9 16.5l-3 4" />
            <path d="M15 16.5l3 4" />
        </svg>
    );
}
