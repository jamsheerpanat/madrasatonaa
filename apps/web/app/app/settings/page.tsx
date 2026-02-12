'use client';

import { Settings, Shield, Bell, Lock, Palette } from 'lucide-react';

export default function SettingsPage() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                    <div className="p-2 bg-slate-800 rounded-lg shadow-lg shadow-slate-300">
                        <Settings className="w-8 h-8 text-white" />
                    </div>
                    School Settings
                </h1>
                <p className="text-slate-500 mt-2 ml-1">Configure system preferences, branding, and global policies.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm opacity-50">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                            <Palette className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900">Branding & Themes</h3>
                            <p className="text-xs text-slate-500">Coming Soon</p>
                        </div>
                    </div>
                    <p className="text-sm text-slate-500">Customize school logo, colors, and dashboard appearance.</p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm opacity-50">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
                            <Shield className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900">Roles & Permissions</h3>
                            <p className="text-xs text-slate-500">Managed via Codebase Currently</p>
                        </div>
                    </div>
                    <p className="text-sm text-slate-500">Define access levels for staff, students, and parents.</p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm opacity-50">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-orange-50 rounded-xl text-orange-600">
                            <Bell className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900">Notifications</h3>
                            <p className="text-xs text-slate-500">Coming Soon</p>
                        </div>
                    </div>
                    <p className="text-sm text-slate-500">Manage email and push notification templates.</p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm opacity-50">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-red-50 rounded-xl text-red-600">
                            <Lock className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900">Security & Sessions</h3>
                            <p className="text-xs text-slate-500">Coming Soon</p>
                        </div>
                    </div>
                    <p className="text-sm text-slate-500">Configure session timeouts, password policies, and 2FA.</p>
                </div>
            </div>
        </div>
    );
}
