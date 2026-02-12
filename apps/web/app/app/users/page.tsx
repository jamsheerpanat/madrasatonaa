'use client';

import { Users, GraduationCap, Shield, UserCheck, UserPlus, Search, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function UsersDirectoryPage() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                        <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-200">
                            <Users className="w-8 h-8 text-white" />
                        </div>
                        User Directory
                    </h1>
                    <p className="text-slate-500 mt-2 ml-1">Manage all system users, roles, and permissions from one central hub.</p>
                </div>
            </div>

            {/* Directory Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Students */}
                <Link href="/app/admin/students" className="group relative bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all duration-300">
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                        <GraduationCap className="w-32 h-32 text-indigo-600 -rotate-12 transform translate-x-8 -translate-y-8" />
                    </div>
                    <div className="relative z-10">
                        <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-6 group-hover:scale-110 transition-transform">
                            <GraduationCap className="w-8 h-8" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">Students</h3>
                        <p className="text-slate-500 font-medium mb-6">Manage student profiles, enrollments, and academic records.</p>
                        <span className="inline-flex items-center text-sm font-bold text-indigo-600 group-hover:translate-x-2 transition-transform">
                            View Directory <ArrowRight className="w-4 h-4 ml-2" />
                        </span>
                    </div>
                </Link>

                {/* Staff */}
                <Link href="/app/admin/staff" className="group relative bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all duration-300">
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Shield className="w-32 h-32 text-emerald-600 -rotate-12 transform translate-x-8 -translate-y-8" />
                    </div>
                    <div className="relative z-10">
                        <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-6 group-hover:scale-110 transition-transform">
                            <Shield className="w-8 h-8" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors">Staff & Teachers</h3>
                        <p className="text-slate-500 font-medium mb-6">Manage employee profiles, roles, and system access.</p>
                        <span className="inline-flex items-center text-sm font-bold text-emerald-600 group-hover:translate-x-2 transition-transform">
                            View Directory <ArrowRight className="w-4 h-4 ml-2" />
                        </span>
                    </div>
                </Link>

                {/* Parents (Coming Soon / Placeholder) */}
                <div className="group relative bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-xl hover:border-orange-200 transition-all duration-300 opacity-75 grayscale hover:grayscale-0">
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                        <UserCheck className="w-32 h-32 text-orange-600 -rotate-12 transform translate-x-8 -translate-y-8" />
                    </div>
                    <div className="relative z-10">
                        <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 mb-6 group-hover:scale-110 transition-transform">
                            <UserCheck className="w-8 h-8" />
                        </div>
                        <div className="flex justify-between items-start">
                            <h3 className="text-2xl font-bold text-slate-900 mb-2 group-hover:text-orange-600 transition-colors">Parents</h3>
                            <span className="px-2 py-1 bg-slate-100 text-slate-500 text-[10px] uppercase font-bold rounded-md tracking-wider">Coming Soon</span>
                        </div>
                        <p className="text-slate-500 font-medium mb-6">Manage guardian accounts and family relationships.</p>
                        <span className="inline-flex items-center text-sm font-bold text-slate-400 group-hover:text-orange-600 group-hover:translate-x-2 transition-all">
                            View Directory <ArrowRight className="w-4 h-4 ml-2" />
                        </span>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200">
                <h2 className="text-xl font-bold text-slate-900 mb-6">Administrative Actions</h2>
                <div className="flex flex-wrap gap-4">
                    <Link href="/app/admin/students/new" className="px-6 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl shadow-sm hover:shadow-md hover:border-indigo-300 hover:text-indigo-600 transition-all flex items-center gap-2">
                        <UserPlus className="w-4 h-4" /> Enroll Student
                    </Link>
                    <Link href="/app/admin/staff/new" className="px-6 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl shadow-sm hover:shadow-md hover:border-emerald-300 hover:text-emerald-600 transition-all flex items-center gap-2">
                        <Shield className="w-4 h-4" /> Add Staff Member
                    </Link>
                    <button className="px-6 py-3 bg-white border border-slate-200 text-slate-400 font-bold rounded-xl cursor-not-allowed flex items-center gap-2">
                        <Mail className="w-4 h-4" /> Send Bulk Invite (Soon)
                    </button>
                </div>
            </div>
        </div>
    );
}

function Mail({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <rect width="20" height="16" x="2" y="4" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        </svg>
    )
}
