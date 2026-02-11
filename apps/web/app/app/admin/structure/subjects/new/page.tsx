
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '../../../../../../services/apiClient';
import { ArrowLeft, Save, BookOpen, Layers, Type, Hash, AlignLeft } from 'lucide-react';

export default function NewSubjectPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [branches, setBranches] = useState<any[]>([]);
    const [form, setForm] = useState({
        name_en: '',
        name_ar: '',
        code: '',
        type: 'MANDATORY',
        credits: 3,
        passing_marks: 40,
        max_marks: 100,
        description: '',
        branch_id: '',
    });

    useEffect(() => {
        // Fetch branches to assign subject scope
        apiClient('/structure').then(async res => {
            if (res.ok) {
                const data = await res.json();
                setBranches(data.branches || []);
                // Default to first branch if available
                if (data.branches?.[0]) {
                    setForm(f => ({ ...f, branch_id: data.branches[0].id }));
                }
            }
        });
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await apiClient('/admin/subjects', {
                method: 'POST',
                body: JSON.stringify({
                    ...form,
                    // Parse numbers
                    credits: parseInt(form.credits as any),
                    passing_marks: parseInt(form.passing_marks as any),
                    max_marks: parseInt(form.max_marks as any),
                })
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || 'Failed to create subject');
            }

            // Success
            router.push('/app/admin/structure');
        } catch (e: any) {
            alert(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <button onClick={() => router.back()} className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 mb-4 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Back to Structure
                </button>
                <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                    <div className="p-2 bg-emerald-600 rounded-xl shadow-lg shadow-emerald-200">
                        <BookOpen className="w-8 h-8 text-white" />
                    </div>
                    Create New Subject
                </h1>
                <p className="text-slate-500 mt-2 ml-14">Define a new academic subject for the curriculum.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 pb-20">
                {/* Basic Details Card */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex items-center">
                        <Type className="w-5 h-5 text-indigo-600 mr-2" />
                        <h3 className="font-bold text-slate-800">Subject Identity</h3>
                    </div>
                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Subject Name (English)</label>
                            <input
                                required
                                type="text"
                                placeholder="e.g. Advanced Mathematics"
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all"
                                value={form.name_en}
                                onChange={e => setForm({ ...form, name_en: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider text-right block">Subject Name (Arabic)</label>
                            <input
                                type="text"
                                dir="rtl"
                                placeholder="مثال: الرياضيات المتقدمة"
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all"
                                value={form.name_ar}
                                onChange={e => setForm({ ...form, name_ar: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Subject Code</label>
                            <input
                                required
                                type="text"
                                placeholder="e.g. MTH-101"
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all uppercase"
                                value={form.code}
                                onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Subject Type</label>
                            <select
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all appearance-none cursor-pointer"
                                value={form.type}
                                onChange={e => setForm({ ...form, type: e.target.value })}
                            >
                                <option value="MANDATORY">Mandatory (Core)</option>
                                <option value="ELECTIVE">Elective</option>
                                <option value="EXTRA_CURRICULAR">Extra Curricular</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Academic Config Card */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex items-center">
                        <Hash className="w-5 h-5 text-amber-600 mr-2" />
                        <h3 className="font-bold text-slate-800">Grading Configuration</h3>
                    </div>
                    <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Credit Hours</label>
                            <input
                                required
                                type="number"
                                min="0"
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:bg-white outline-none transition-all"
                                value={form.credits}
                                onChange={e => setForm({ ...form, credits: parseInt(e.target.value) })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Max Marks</label>
                            <input
                                required
                                type="number"
                                min="1"
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:bg-white outline-none transition-all"
                                value={form.max_marks}
                                onChange={e => setForm({ ...form, max_marks: parseInt(e.target.value) })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Passing Marks</label>
                            <input
                                required
                                type="number"
                                min="0"
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:bg-white outline-none transition-all"
                                value={form.passing_marks}
                                onChange={e => setForm({ ...form, passing_marks: parseInt(e.target.value) })}
                            />
                        </div>
                    </div>
                </div>

                {/* Meta Config Card */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex items-center">
                        <AlignLeft className="w-5 h-5 text-blue-600 mr-2" />
                        <h3 className="font-bold text-slate-800">Additional Details</h3>
                    </div>
                    <div className="p-8 space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Target Branch</label>
                            <select
                                required
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all appearance-none cursor-pointer"
                                value={form.branch_id}
                                onChange={e => setForm({ ...form, branch_id: e.target.value })}
                            >
                                <option value="">Select Branch</option>
                                {branches.map(b => (
                                    <option key={b.id} value={b.id}>{b.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Description (Optional)</label>
                            <textarea
                                rows={3}
                                placeholder="Course description and objectives..."
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all resize-none"
                                value={form.description}
                                onChange={e => setForm({ ...form, description: e.target.value })}
                            />
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
                        {loading ? 'Creating...' : <>
                            <Save className="w-5 h-5" />
                            Create Subject
                        </>}
                    </button>
                </div>
            </form>
        </div>
    );
}
