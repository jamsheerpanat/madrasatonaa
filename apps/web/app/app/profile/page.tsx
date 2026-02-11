
'use client';

import { useState } from 'react';
import { useMe } from '../../../lib/useMe';
import { RoleBadge } from '../../../components/RoleBadge';
import { LoadingState } from '../../../components/LoadingState';
import {
    User, Mail, Phone, Shield, Key, Clock,
    MapPin, Briefcase, GraduationCap, Calendar,
    CheckCircle, Settings
} from 'lucide-react';

export default function ProfilePage() {
    const { me, loading } = useMe();
    const [activeTab, setActiveTab] = useState('OVERVIEW');

    if (loading) return <LoadingState />;
    if (!me) return null;


    const user = me.user;
    const initials = user.full_name?.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();

    // Determine specific profile data
    const specificData = me.staff || me.student || me.guardian;
    // Fix: Access user_type from user object if not on root, and safe guard
    const roleType = me.user_type || user.user_type || 'USER';

    return (
        <div className="max-w-5xl mx-auto pb-10 space-y-8">
            {/* Header Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600 relative">
                    <div className="absolute inset-0 opacity-20 pattern-grid-lg text-white" />
                </div>
                <div className="px-8 pb-8">
                    <div className="relative flex justify-between items-end -mt-12 mb-6">
                        <div className="flex items-end gap-6">
                            <div className="w-24 h-24 rounded-2xl bg-white p-1 shadow-lg">
                                <div className="w-full h-full bg-slate-100 rounded-xl flex items-center justify-center text-2xl font-bold text-slate-500">
                                    {initials}
                                </div>
                            </div>
                            <div className="mb-1">
                                <h1 className="text-2xl font-bold text-slate-900">{user.full_name}</h1>
                                <div className="flex items-center gap-2 text-slate-500 text-sm mt-1">
                                    <span className="capitalize font-medium text-slate-700">{(roleType || '').toLowerCase()}</span>
                                    <span>•</span>
                                    <span>{user.email}</span>
                                </div>
                            </div>
                        </div>
                        <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-xl shadow-sm hover:bg-slate-50 transition-colors flex items-center gap-2">
                            <Settings className="w-4 h-4" />
                            Edit Profile
                        </button>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex gap-8 border-b border-slate-200">
                        {['OVERVIEW', 'SECURITY & ACCESS'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`pb-4 text-sm font-bold tracking-wide transition-all border-b-2 ${activeTab === tab
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    {activeTab === 'OVERVIEW' && (
                        <>
                            {/* Personal Info */}
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                                    <User className="w-5 h-5 text-slate-400" />
                                    Personal Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                                    <InfoItem icon={Mail} label="Email Address" value={user.email} />
                                    <InfoItem icon={Phone} label="Phone Number" value={user.phone} />
                                    <InfoItem icon={Calendar} label="Date of Birth" value={user.dob ? new Date(user.dob).toLocaleDateString() : null} />
                                    <InfoItem icon={MapPin} label="Address" value={user.address} />

                                    {/* Role Specifics */}
                                    {roleType === 'STAFF' && me.staff && (
                                        <>
                                            <div className="col-span-2 border-t border-slate-100 my-2" />
                                            <InfoItem icon={Briefcase} label="Department" value={me.staff.department?.name_en} />
                                            <InfoItem icon={Clock} label="Member Since" value={new Date(me.staff.joining_date).toLocaleDateString()} />
                                        </>
                                    )}
                                    {roleType === 'STUDENT' && me.student && (
                                        <>
                                            <div className="col-span-2 border-t border-slate-100 my-2" />
                                            <InfoItem icon={GraduationCap} label="Admission Number" value={me.student.admission_number} />
                                            <InfoItem icon={Calendar} label="Admission Date" value={new Date(me.student.admission_date).toLocaleDateString()} />
                                        </>
                                    )}
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'SECURITY & ACCESS' && (
                        <div className="space-y-6">
                            {/* Access Control */}
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                                    <Shield className="w-5 h-5 text-slate-400" />
                                    Roles & Permissions
                                </h3>

                                <div className="mb-6">
                                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Assigned Roles</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {me.roles.map((role: any, idx: number) => (
                                            <div key={idx} className="flex items-center bg-slate-50 border border-slate-200 rounded-lg pr-3 pl-2 py-1 gap-2">
                                                <div className="w-2 h-2 rounded-full bg-indigo-500" />
                                                <span className="text-sm font-medium text-slate-700">{role.name}</span>
                                                {role.branch_id && (
                                                    <span className="text-xs text-slate-400 border-l border-slate-200 pl-2">Branch {role.branch_id}</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Capabilities</h4>
                                    <div className="bg-slate-50 rounded-xl p-4 grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                                        {me.permissions.map((perm: string) => (
                                            <div key={perm} className="flex items-center gap-2 text-sm text-slate-600">
                                                <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                                                <span className="font-mono text-xs">{perm}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Security (Placeholder) */}
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 opacity-75">
                                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                    <Key className="w-5 h-5 text-slate-400" />
                                    Security Settings
                                </h3>
                                <p className="text-slate-500 text-sm mb-4">Manage your password and security questions.</p>
                                <button disabled className="text-blue-600 font-bold text-sm">Change Password (Coming Soon)</button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar Stats */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                        <h4 className="text-sm font-bold text-slate-900 mb-4">Quick Stats</h4>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500">Status</span>
                                <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded font-bold text-xs">ACTIVE</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500">Last Login</span>
                                <span className="text-slate-900 font-medium">Today</span>
                            </div>
                            {/* Example placeholder stats */}
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500">Branch</span>
                                <span className="text-slate-900 font-medium">Main Campus</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function InfoItem({ icon: Icon, label, value }: any) {
    return (
        <div>
            <dt className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Icon className="w-3 h-3" /> {label}
            </dt>
            <dd className="text-base font-medium text-slate-900 truncate">
                {value || <span className="text-slate-300 italic">Not set</span>}
            </dd>
        </div>
    );
}
