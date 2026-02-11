'use client';

import { useMe } from '../../lib/useMe';
import {
    Users, TrendingUp, DollarSign, Calendar,
    CheckCircle, AlertTriangle, FileText, Bell
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export function PrincipalDashboard() {
    const { me } = useMe();
    const user = me?.user;

    if (!user) return null;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Principal Hero */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-8 text-white relative overflow-hidden shadow-2xl shadow-slate-400">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <TrendingUp className="w-64 h-64 -rotate-12 transform translate-x-12 -translate-y-12" />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-6">
                    <div>
                        <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-xs font-bold uppercase tracking-wider border border-white/10 mb-2 inline-block text-slate-300">
                            Executive Admin
                        </span>
                        <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">
                            Good Morning, Principal {user.last_name || user.full_name?.split(' ')?.[0]}
                        </h1>
                        <p className="text-slate-400 max-w-lg text-lg">
                            Here is the daily overview for Madrasatonaa.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Link href="/app/announcements/new" className="px-5 py-2.5 bg-blue-600 text-white font-bold rounded-lg shadow hover:bg-blue-700 transition-colors flex items-center gap-2">
                            <Bell className="w-4 h-4" /> New Announcement
                        </Link>
                        <Link href="/app/reports" className="px-5 py-2.5 bg-white/10 text-white font-bold rounded-lg backdrop-blur-md border border-white/10 hover:bg-white/20 transition-colors flex items-center gap-2">
                            <FileText className="w-4 h-4" /> Reports
                        </Link>
                    </div>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Students', value: '1,240', sub: '+12 this month', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Attendance', value: '94.2%', sub: 'Vs 92% Avg', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
                    { label: 'Staff Present', value: '86/90', sub: '4 on leave', icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                    { label: 'Fees Today', value: '$8,450', sub: 'Pending $12k', icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                ].map((stat) => (
                    <div key={stat.label} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:border-slate-300 transition-all flex flex-col justify-between h-32">
                        <div className="flex justify-between items-start">
                            <div className={`w-10 h-10 rounded-lg ${stat.bg} ${stat.color} flex items-center justify-center`}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${stat.sub.includes('+') || stat.sub.includes('Vs') ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                {stat.sub}
                            </span>
                        </div>
                        <div>
                            <span className="text-2xl font-bold text-slate-900 block">{stat.value}</span>
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">{stat.label}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Staff Requests */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-orange-500" /> Pending Requests
                        </h2>
                        <Link href="/app/requests" className="text-sm font-bold text-blue-600 hover:text-blue-700">View All</Link>
                    </div>

                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs">
                            <tr>
                                <th className="px-4 py-3 rounded-l-lg">Staff</th>
                                <th className="px-4 py-3">Type</th>
                                <th className="px-4 py-3">Date</th>
                                <th className="px-4 py-3 rounded-r-lg">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {[
                                { name: 'Sarah Connor', type: 'Sick Leave', date: 'Today', avatar: 'SC' },
                                { name: 'John Smith', type: 'Purchase Req', date: 'Yesterday', avatar: 'JS' },
                                { name: 'Emily Blunt', type: 'Personal Leave', date: 'Oct 24', avatar: 'EB' },
                            ].map((req, i) => (
                                <tr key={i} className="group hover:bg-slate-50 transition-colors">
                                    <td className="px-4 py-3 font-medium text-slate-900 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                                            {req.avatar}
                                        </div>
                                        {req.name}
                                    </td>
                                    <td className="px-4 py-3 text-slate-600">{req.type}</td>
                                    <td className="px-4 py-3 text-slate-500">{req.date}</td>
                                    <td className="px-4 py-3">
                                        <button className="text-green-600 font-bold hover:underline mr-4">Approve</button>
                                        <button className="text-red-500 font-bold hover:underline">Deny</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Quick Calendar / Events */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h2 className="text-lg font-bold text-slate-900 mb-4">Upcoming Events</h2>
                    <div className="space-y-4">
                        <div className="p-4 bg-purple-50 border-l-4 border-purple-500 rounded-r-xl">
                            <h4 className="font-bold text-purple-900">Parent Teacher Meeting</h4>
                            <p className="text-xs text-purple-700 mt-1">Tomorrow, 10:00 AM • Main Hall</p>
                        </div>
                        <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-xl">
                            <h4 className="font-bold text-blue-900">Science Fair</h4>
                            <p className="text-xs text-blue-700 mt-1">Friday, 09:00 AM • Campus Ground</p>
                        </div>
                        <div className="p-4 bg-slate-50 border-l-4 border-slate-400 rounded-r-xl opacity-75">
                            <h4 className="font-bold text-slate-700">Staff Meeting</h4>
                            <p className="text-xs text-slate-500 mt-1">Next Monday • Conference Room</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
