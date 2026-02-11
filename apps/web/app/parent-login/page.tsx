'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ParentLogin() {
    const router = useRouter();
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const requestOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await fetch('http://localhost:8000/api/v1/auth/parent/request-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone })
            });
            const data = await res.json();
            if (!res.ok) {
                const errorMsg = data.error?.message || data.message || 'Failed to send OTP';
                throw new Error(errorMsg);
            }

            // For MVP development, if OTP is returned in response (debug), show it
            const devOtp = data.otp_dev_code || data.debug_otp;
            if (devOtp) alert(`Debug OTP: ${devOtp}`);

            setStep(2);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const verifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await fetch('http://localhost:8000/api/v1/auth/parent/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phone,
                    otp,
                    device_id: 'web-dev-1',
                    device_name: 'Web Browser',
                    platform: 'WEB'
                })
            });
            const data = await res.json();
            if (!res.ok) {
                const errorMsg = data.error?.message || data.message || 'Verification failed';
                throw new Error(errorMsg);
            }

            localStorage.setItem('access_token', data.access_token);
            if (data.refresh_token) localStorage.setItem('refresh_token', data.refresh_token);
            localStorage.setItem('last_login_type', 'parent');

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
                <img src="/logo.png" alt="Madrasatonaa" className="h-10 w-auto mb-6" />
                <h1 className="text-2xl font-bold mb-6 text-center text-slate-900 tracking-tight">Parent Portal</h1>

                {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">{error}</div>}

                {step === 1 ? (
                    <form onSubmit={requestOtp} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Phone Number</label>
                            <input className="w-full border p-2 rounded" type="tel" required placeholder="e.g. 12345678"
                                value={phone} onChange={e => setPhone(e.target.value)}
                            />
                        </div>
                        <button disabled={loading} className="w-full py-2 bg-green-600 text-white rounded font-bold hover:bg-green-700 disabled:opacity-50">
                            {loading ? 'Sending OTP...' : 'Request OTP'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={verifyOtp} className="space-y-4">
                        <div className="text-sm text-gray-500 mb-2">OTP sent to {phone}</div>
                        <div>
                            <label className="block text-sm font-medium mb-1">OTP Code</label>
                            <input className="w-full border p-2 rounded tracking-widest text-center text-xl" type="text" required
                                value={otp} onChange={e => setOtp(e.target.value)}
                            />
                        </div>
                        <button disabled={loading} className="w-full py-2 bg-green-600 text-white rounded font-bold hover:bg-green-700 disabled:opacity-50">
                            {loading ? 'Verifying...' : 'Verify & Login'}
                        </button>
                        <button type="button" onClick={() => setStep(1)} className="w-full py-2 text-sm text-gray-500 hover:text-gray-700">
                            Change Phone Number
                        </button>
                    </form>
                )}

                <div className="mt-4 text-center">
                    <a href="/" className="text-sm text-green-600 hover:underline">Back to Home</a>
                </div>
            </div>
        </div>
    );
}
