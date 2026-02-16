'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ParentLogin() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const login = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';
            const res = await fetch(`${baseUrl}/auth/parent/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username,
                    password,
                    device_id: 'web-dev-1',
                    device_name: 'Web Browser',
                    platform: 'WEB'
                })
            });
            const data = await res.json();

            if (!res.ok) {
                const errorMsg = data.error?.message || data.message || 'Login failed';
                throw new Error(errorMsg);
            }

            localStorage.setItem('access_token', data.access_token);
            if (data.refresh_token) localStorage.setItem('refresh_token', data.refresh_token);
            localStorage.setItem('last_login_type', 'parent');

            // Force reload to update auth state context if needed, or just push
            router.push('/app');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl border border-slate-100 flex flex-col items-center">

                {/* Placeholder Logo */}
                <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-green-200">
                    <span className="text-2xl font-bold text-white">M</span>
                </div>

                <h1 className="text-2xl font-bold mb-2 text-center text-slate-900 tracking-tight">Parent Portal</h1>
                <p className="text-slate-500 mb-6 text-sm">Please sign in to continue</p>

                {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm w-full text-center">{error}</div>}

                <form onSubmit={login} className="space-y-4 w-full">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Username, Email, or Phone</label>
                        <input className="w-full border border-slate-300 p-2.5 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all" type="text" required placeholder="Username, email, or phone"
                            value={username} onChange={e => setUsername(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Password</label>
                        <input className="w-full border border-slate-300 p-2.5 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all" type="password" required placeholder="******"
                            value={password} onChange={e => setPassword(e.target.value)}
                        />
                    </div>
                    <button disabled={loading} className="w-full py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 disabled:opacity-50 shadow-lg shadow-green-200 transition-all active:scale-95">
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <div className="mt-6 text-center w-full pt-6 border-t border-slate-100">
                    <a href="/" className="text-sm font-medium text-slate-500 hover:text-green-600 transition-colors">Back to Home</a>
                </div>
            </div>
        </div>
    );
}
