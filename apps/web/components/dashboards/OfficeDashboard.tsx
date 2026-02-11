'use client';

import { useMe } from '../../lib/useMe';
import {
    Users, DollarSign, ClipboardList, Package,
    ArrowUpRight, AlertCircle, Phone, Search
} from 'lucide-react';
import Link from 'next/link';

export function OfficeDashboard() {
    const { me } = useMe();
    const user = me?.user;

    if (!user) return null;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Office Hero */}
            <div className="bg-gradient-to-r from-slate-700 to-slate-800 rounded-2xl p-8 text-white relative overflow-hidden shadow-xl shadow-slate-300">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <ClipboardList className="w-64 h-64 -rotate-12 transform translate-x-12 -translate-y-12" />
                </div>
                <div className="relative z-10 flex flex-col justify-between h-full">
                    <div>
                        <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-xs font-bold uppercase tracking-wider border border-white/10 mb-4 inline-block text-slate-300">
                            Administrative Console
                        </span>
                        <h1 className="text-3xl font-bold mb-2">
                            Welcome, {user.full_name?.split(' ')?.[0]}
                        </h1>
                        <p className="text-slate-400 max-w-lg">
                            Manage admissions, fees, and daily operations.
                        </p>
                    </div>
                </div>
            </div>

            {/* Operational Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'New Admissions', value: '12', sub: 'Today', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Fees Collected', value: '$2,450', sub: 'Today', icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50' },
                    { label: 'Staff Present', value: '45/50', sub: '90%', icon: ClipboardList, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                    { label: 'Low Stock', value: '3 Items', sub: 'Action Req', icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
                ].map((stat) => (
                    <div key={stat.label} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center text-center hover:border-slate-300 transition-colors h-32 justify-center">
                        <div className={`w-10 h-10 rounded-lg ${stat.bg} ${stat.color} flex items-center justify-center mb-2`}>
                            <stat.icon className="w-5 h-5" />
                        </div>
                        <span className="text-2xl font-bold text-slate-900">{stat.value}</span>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wide mt-1">{stat.label}</span>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Pending Admissions */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <Users className="w-5 h-5 text-indigo-500" /> Pending Admissions
                        </h2>
                        <button className="text-indigo-600 font-bold hover:underline text-sm">View All</button>
                    </div>

                    <div className="space-y-4">
                        {[
                            { name: 'Adam Jensen', grade: 'Grade 1', parent: 'Frank Jensen', status: 'Pending Docs' },
                            { name: 'Lara Croft', grade: 'Grade 5', parent: 'Richard Croft', status: 'Fee Payment' },
                            { name: 'Nathan Drake', grade: 'Grade 3', parent: 'Elena Fisher', status: 'Interview' },
                        ].map((student, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100 hover:bg-white hover:shadow-sm transition-all group">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                                        {student.name[0]}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900">{student.name}</h4>
                                        <p className="text-xs text-slate-500">{student.grade} • Parent: {student.parent}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-[10px] font-bold uppercase rounded">
                                        {student.status}
                                    </span>
                                    <button className="p-2 text-slate-400 hover:text-indigo-600">
                                        <ArrowUpRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 h-fit">
                    <h2 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-2 gap-3">
                        <Link href="/app/students/new" className="flex flex-col items-center justify-center p-4 bg-slate-50 border border-slate-100 rounded-xl hover:bg-indigo-50 hover:border-indigo-100 hover:text-indigo-700 transition-all text-slate-600 font-bold text-xs gap-2">
                            <Users className="w-5 h-5" /> Register Student
                        </Link>
                        <Link href="/app/fees/collect" className="flex flex-col items-center justify-center p-4 bg-slate-50 border border-slate-100 rounded-xl hover:bg-green-50 hover:border-green-100 hover:text-green-700 transition-all text-slate-600 font-bold text-xs gap-2">
                            <DollarSign className="w-5 h-5" /> Collect Fees
                        </Link>
                        <Link href="/app/store/inventory" className="flex flex-col items-center justify-center p-4 bg-slate-50 border border-slate-100 rounded-xl hover:bg-orange-50 hover:border-orange-100 hover:text-orange-700 transition-all text-slate-600 font-bold text-xs gap-2">
                            <Package className="w-5 h-5" /> Update Stock
                        </Link>
                        <Link href="/app/announcements" className="flex flex-col items-center justify-center p-4 bg-slate-50 border border-slate-100 rounded-xl hover:bg-purple-50 hover:border-purple-100 hover:text-purple-700 transition-all text-slate-600 font-bold text-xs gap-2">
                            <AlertCircle className="w-5 h-5" /> Notices
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
