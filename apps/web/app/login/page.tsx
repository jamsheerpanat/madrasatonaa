
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Lock, Mail, Loader2, School } from 'lucide-react';

import { apiClient } from '../../services/apiClient';

export default function StaffLogin() {
    const router = useRouter();
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await apiClient('/auth/staff/login', {
                method: 'POST',
                body: JSON.stringify({
                    email: credentials.email,
                    password: credentials.password,
                    device_id: 'web-browser-' + new Date().getTime(),
                    device_name: navigator.userAgent,
                    platform: 'WEB'
                }),
                skipAuth: true
            });

            if (!res.ok) {
                let errorMsg = 'Login failed';
                try {
                    const data = await res.json();

                    // Handle API's custom error wrapper { error: { message, details } }
                    if (data.error) {
                        errorMsg = data.error.message || errorMsg;
                        if (data.error.details) {
                            // If details are validation errors, pick the first one or stringify
                            const details = data.error.details;
                            const firstError = Object.values(details)[0];
                            if (Array.isArray(firstError)) {
                                errorMsg = firstError[0];
                            } else {
                                errorMsg = JSON.stringify(details);
                            }
                        }
                    } else {
                        // Fallback for standard Laravel errors
                        if (data.message) errorMsg = data.message;
                        if (data.errors) {
                            const firstError = Object.values(data.errors)[0];
                            if (Array.isArray(firstError)) errorMsg = firstError[0];
                            else errorMsg = JSON.stringify(data.errors);
                        }
                    }
                } catch (jsonErr) {
                    const text = await res.text().catch(() => '');
                    console.error("Non-JSON error response:", res.status, text.slice(0, 500));
                    errorMsg = `Server Error (${res.status})`;
                }
                throw new Error(errorMsg);
            }

            const data = await res.json();

            localStorage.setItem('access_token', data.access_token);
            if (data.refresh_token) localStorage.setItem('refresh_token', data.refresh_token);
            localStorage.setItem('last_login_type', 'staff');

            router.push('/app');
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Network error. Check backend.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
            {/* Left: Brand / Aesthetic */}
            <div className="hidden lg:flex flex-col justify-between bg-[#0f172a] p-12 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 z-0"></div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

                <div className="relative z-10">
                    <div className="flex items-center gap-4">
                        <img
                            src="/logo.png"
                            alt="Madrasatonaa"
                            className="h-12 w-auto object-contain brightness-0 invert"
                        />
                    </div>
                </div>

                <div className="relative z-10 max-w-lg">
                    <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
                        Orchestrate your school's rhythm.
                    </h1>
                    <p className="text-slate-400 text-lg leading-relaxed">
                        A next-generation operating system for modern educational institutions. Manage students, staff, and operations seamlessly.
                    </p>
                </div>

                <div className="relative z-10 text-slate-500 text-sm font-medium">
                    © 2025 Madrasatonaa Inc. All rights reserved.
                </div>
            </div>

            {/* Right: Login Form */}
            <div className="flex items-center justify-center p-8 bg-white lg:bg-slate-50">
                <div className="w-full max-w-sm space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome back</h2>
                        <p className="text-slate-500 mt-2">Sign in to your account to continue</p>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-50 text-red-600 text-sm font-medium rounded-xl border border-red-100 flex items-center gap-2 animate-in fade-in zoom-in-95 duration-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-slate-700 ml-1">Email or Student ID</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                                <input
                                    className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-900 placeholder:text-slate-400"
                                    type="text"
                                    placeholder="Enter email or student code"
                                    required
                                    value={credentials.email}
                                    onChange={e => setCredentials({ ...credentials, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <div className="flex justify-between ml-1">
                                <label className="text-sm font-semibold text-slate-700">Password</label>
                                <a href="#" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">Forgot password?</a>
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                                <input
                                    className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-900 placeholder:text-slate-400"
                                    type="password"
                                    placeholder="Enter your password"
                                    required
                                    value={credentials.password}
                                    onChange={e => setCredentials({ ...credentials, password: e.target.value })}
                                />
                            </div>
                        </div>

                        <button
                            disabled={loading}
                            className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold shadow-lg shadow-slate-200 hover:bg-slate-800 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-lg transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Sign In <ArrowRight className="w-4 h-4" /></>}
                        </button>
                    </form>

                    <p className="text-center text-sm text-slate-500">
                        Not a staff member? <a href="/" className="font-bold text-slate-900 hover:underline">Go to Home</a>
                    </p>
                </div>
            </div>
        </div>
    );
}
