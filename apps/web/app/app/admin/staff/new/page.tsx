
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '../../../../../services/apiClient';
import { ArrowLeft, Save, User, Briefcase, Lock, Shield, Mail, Phone, MapPin, BadgeCheck } from 'lucide-react';

export default function NewStaffPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        full_name: '',
        email: '',
        phone: '',
        password: '',
        user_type: 'STAFF',
        roles: [] as string[],
        employee_code: '',
        job_title: '',
        national_id: '',
    });

    const availableRoles = ['Teacher', 'Principal', 'HOD', 'OfficeAdmin', 'Reception', 'Accountant'];

    const toggleRole = (role: string) => {
        setForm(f => ({
            ...f,
            roles: f.roles.includes(role)
                ? f.roles.filter(r => r !== role)
                : [...f.roles, role]
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await apiClient('/admin/users', {
                method: 'POST',
                body: JSON.stringify(form)
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || 'Failed to create staff member');
            }

            alert('Staff member created successfully!');
            router.push('/app/admin/staff');
        } catch (e: any) {
            alert(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <button onClick={() => router.back()} className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 mb-4 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Back to Staff Directory
                </button>
                <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                    <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-200">
                        <Briefcase className="w-8 h-8 text-white" />
                    </div>
                    Onboard New Staff
                </h1>
                <p className="text-slate-500 mt-2 ml-14">Create a new user account and assign administrative or teaching roles.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 pb-20">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Personal Details */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden col-span-2 md:col-span-1">
                        <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex items-center">
                            <User className="w-5 h-5 text-indigo-600 mr-2" />
                            <h3 className="font-bold text-slate-800">Personal Information</h3>
                        </div>
                        <div className="p-6 space-y-5">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
                                    value={form.full_name}
                                    onChange={e => setForm({ ...form, full_name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">National ID / Passport</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
                                    value={form.national_id}
                                    onChange={e => setForm({ ...form, national_id: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            required
                                            type="email"
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
                                            value={form.email}
                                            onChange={e => setForm({ ...form, email: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phone</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="tel"
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
                                            value={form.phone}
                                            onChange={e => setForm({ ...form, phone: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Employment Details */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden col-span-2 md:col-span-1">
                        <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex items-center">
                            <BadgeCheck className="w-5 h-5 text-emerald-600 mr-2" />
                            <h3 className="font-bold text-slate-800">Employment Details</h3>
                        </div>
                        <div className="p-6 space-y-5">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Job Title</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Senior Mathematics Teacher"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all"
                                    value={form.job_title}
                                    onChange={e => setForm({ ...form, job_title: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Employee Code</label>
                                <input
                                    type="text"
                                    placeholder="e.g. EMP-001"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all uppercase"
                                    value={form.employee_code}
                                    onChange={e => setForm({ ...form, employee_code: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Role & Security */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex items-center">
                        <Shield className="w-5 h-5 text-amber-600 mr-2" />
                        <h3 className="font-bold text-slate-800">Role & Security</h3>
                    </div>
                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Access Roles</label>
                            <div className="grid grid-cols-2 gap-3">
                                {availableRoles.map(role => (
                                    <label key={role} className={`flex items-center p-3 rounded-xl border cursor-pointer transition-all ${form.roles.includes(role)
                                            ? 'bg-amber-50 border-amber-500 text-amber-900 font-bold shadow-sm'
                                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                        }`}>
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 mr-2 accent-amber-600 rounded"
                                            checked={form.roles.includes(role)}
                                            onChange={() => toggleRole(role)}
                                        />
                                        {role}
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Initial Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        required
                                        type="password"
                                        placeholder="Min. 6 characters"
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:ring-2 focus:ring-amber-500 focus:bg-white outline-none transition-all"
                                        value={form.password}
                                        onChange={e => setForm({ ...form, password: e.target.value })}
                                    />
                                </div>
                                <p className="text-xs text-slate-400">User will be prompted to change this upon first login.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-8 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Processing...' : <>
                            <Save className="w-5 h-5" />
                            Complete Onboarding
                        </>}
                    </button>
                </div>
            </form>
        </div>
    );
}
