'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '../../../../../services/apiClient';
import { LoadingState } from '../../../../../components/LoadingState';
import { ErrorState } from '../../../../../components/ErrorState';
import {
    ArrowLeft, User, Phone, Mail, Calendar, MapPin,
    Briefcase, Shield, Activity, Clock
} from 'lucide-react';

export default function StaffProfilePage() {
    const { id } = useParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [staff, setStaff] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        if (!id) return;

        const fetchStaff = async () => {
            try {
                // Using the newly added backend route for filtering by user ID
                const res = await apiClient(`/admin/users/${id}`);
                if (!res.ok) throw new Error('Failed to load staff profile');
                const data = await res.json();
                setStaff(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchStaff();
    }, [id]);

    if (loading) return <LoadingState />;
    if (error) return <ErrorState message={error} title="Staff Not Found" />;
    if (!staff) return <ErrorState message="Staff data is unavailable" title="No Data" />;

    const tabs = [
        { id: 'overview', label: 'Overview', icon: User },
        { id: 'schedule', label: 'Schedule', icon: Clock },
        { id: 'activity', label: 'Activity', icon: Activity },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
            {/* Header */}
            <div>
                <button onClick={() => router.back()} className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 mb-4 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Back to Directory
                </button>

                <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50"></div>

                    <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
                        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-4xl shadow-lg ring-4 ring-white">
                            {(staff.full_name || 'U').charAt(0)}
                        </div>
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{staff.full_name}</h1>
                            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm font-medium text-slate-500">
                                {staff.staff_profile?.employee_code && (
                                    <span className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-lg text-slate-600 border border-slate-200">
                                        <span className="font-mono font-bold tracking-tight">{staff.staff_profile.employee_code}</span>
                                    </span>
                                )}
                                <span className="flex items-center gap-1.5">
                                    <Briefcase className="w-4 h-4 text-slate-400" />
                                    {staff.staff_profile?.job_title || 'Staff Member'}
                                </span>
                                {staff.staff_profile?.joining_date && (
                                    <span className="flex items-center gap-1.5">
                                        <Calendar className="w-4 h-4 text-slate-400" />
                                        Joined {new Date(staff.staff_profile.joining_date).toLocaleDateString()}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <div className="flex flex-wrap gap-1 justify-end max-w-xs">
                                {staff.roles?.map((role: any) => (
                                    <span key={role.id} className="text-xs font-bold px-2 py-1 bg-indigo-50 text-indigo-700 rounded-md border border-indigo-100 uppercase tracking-wide">
                                        {role.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats / Tabs Interface */}
                    <div className="mt-8 flex flex-col sm:flex-row items-center border-t border-slate-100 pt-6 gap-6">
                        <div className="flex flex-1 w-full gap-8 overflow-x-auto pb-2 sm:pb-0">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 pb-2 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${activeTab === tab.id
                                        ? 'text-indigo-600 border-indigo-600'
                                        : 'text-slate-500 border-transparent hover:text-slate-800'
                                        }`}
                                >
                                    <tab.icon className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column (Main Info) */}
                <div className="lg:col-span-2 space-y-6">
                    {activeTab === 'overview' && (
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-50 pb-4">Personal Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Full Name</p>
                                    <p className="font-medium text-slate-900">{staff.full_name}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Role</p>
                                    <p className="font-medium text-slate-900 capitalize">{staff.user_type}</p>
                                </div>
                                <div className="md:col-span-2">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Branch</p>
                                    <p className="font-medium text-slate-900">Main Campus</p>
                                </div>
                            </div>

                            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-50 pb-4 pt-4">Account Status</h3>
                            <div className="flex items-center gap-2">
                                <span className={`w-3 h-3 rounded-full ${staff.is_active ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                                <span className="font-medium text-slate-700">{staff.is_active ? 'Active Account' : 'Inactive Account'}</span>
                            </div>
                        </div>
                    )}

                    {(activeTab === 'schedule' || activeTab === 'activity') && (
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                                {activeTab === 'schedule' ? <Clock className="w-8 h-8" /> : <Activity className="w-8 h-8" />}
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">Coming Soon</h3>
                            <p className="text-slate-500 max-w-sm mx-auto">
                                This module is currently under development. Check back later for updates.
                            </p>
                        </div>
                    )}
                </div>

                {/* Right Column (Sidebar) */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                        <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">Contact Info</h3>
                        <ul className="space-y-4">
                            <li className="flex items-center text-sm text-slate-600">
                                <div className="p-2 bg-slate-50 rounded-lg mr-3 text-slate-400">
                                    <Mail className="w-4 h-4" />
                                </div>
                                <span className="truncate">{staff.email || 'No email provided'}</span>
                            </li>
                            <li className="flex items-center text-sm text-slate-600">
                                <div className="p-2 bg-slate-50 rounded-lg mr-3 text-slate-400">
                                    <Phone className="w-4 h-4" />
                                </div>
                                <span className="truncate">{staff.phone || 'No phone provided'}</span>
                            </li>
                        </ul>
                    </div>

                    <div className="bg-gradient-to-br from-slate-900 to-indigo-900 rounded-2xl shadow-lg p-6 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                        <h3 className="text-lg font-bold mb-2 relative z-10">Administrative Actions</h3>
                        <div className="space-y-2 relative z-10">
                            <button
                                onClick={() => router.push(`/app/admin/staff/${id}/edit`)}
                                className="w-full text-left px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                            >
                                <Briefcase className="w-4 h-4" /> Edit Profile Details
                            </button>
                            <button
                                onClick={async () => {
                                    const newPass = prompt('Enter new password (min 6 chars):');
                                    if (!newPass || newPass.length < 6) {
                                        if (newPass) alert('Password must be at least 6 characters.');
                                        return;
                                    }
                                    try {
                                        const res = await apiClient(`/admin/users/${id}/reset-password`, {
                                            method: 'POST',
                                            body: JSON.stringify({ password: newPass })
                                        });
                                        if (res.ok) alert('Password reset successfully!');
                                        else throw new Error('Failed to reset password');
                                    } catch (err: any) {
                                        alert(err.message);
                                    }
                                }}
                                className="w-full text-left px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                            >
                                <Shield className="w-4 h-4" /> Reset Password
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
