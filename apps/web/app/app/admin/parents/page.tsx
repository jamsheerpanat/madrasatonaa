'use client';

import { UserCheck } from 'lucide-react';

export default function ParentsPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 animate-in fade-in duration-500">
            <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center text-orange-600 mb-4 shadow-sm">
                <UserCheck className="w-12 h-12" />
            </div>
            <div className="max-w-md space-y-2">
                <h1 className="text-3xl font-bold text-slate-900">Parents & Guardians</h1>
                <div className="inline-block px-3 py-1 bg-orange-100 text-orange-700 text-xs font-bold uppercase tracking-widest rounded-full">
                    Coming Soon
                </div>
                <p className="text-slate-500 text-lg">
                    Manage guardian accounts and family relationships.
                </p>
            </div>
        </div>
    );
}
