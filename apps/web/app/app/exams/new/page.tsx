
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '../../../../services/apiClient';
import { LoadingState } from '../../../../components/LoadingState';
import { useMe } from '../../../../lib/useMe';
import {
    Calendar, Users, BookOpen, Layers, CheckCircle,
    AlertCircle, FileText
} from 'lucide-react';

export default function ScheduleExam() {
    const { me } = useMe();
    const router = useRouter();

    const [terms, setTerms] = useState<any[]>([]);
    const [sections, setSections] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [loadingInit, setLoadingInit] = useState(true);

    const [form, setForm] = useState({
        section_id: '',
        subject_id: '',
        term_id: '',
        exam_type: 'MIDTERM',
        exam_date: '',
        max_grade: '100'
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadData = async () => {
            try {
                const [termsRes, subjectsRes, timetableRes] = await Promise.all([
                    apiClient('/terms/current'),
                    apiClient('/subjects'),
                    apiClient('/timetable/teacher/me')
                ]);

                if (termsRes.ok) {
                    const t = await termsRes.json();
                    setTerms(t);
                    if (t.length > 0) setForm(f => ({ ...f, term_id: t[0].id }));
                }

                if (subjectsRes.ok) {
                    setSubjects(await subjectsRes.json());
                }

                if (timetableRes.ok) {
                    const entries = await timetableRes.json();
                    const uniqueSections = Array.from(new Map(entries.map((e: any) => [e.section_id, e.section])).values());
                    setSections(uniqueSections);
                }
            } catch (e) {
                console.error("Failed to load generic data", e);
            } finally {
                setLoadingInit(false);
            }
        };

        if (me?.user_type === 'STAFF') {
            loadData();
        } else {
            setLoadingInit(false);
        }
    }, [me]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            const res = await apiClient('/exams', {
                method: 'POST',
                body: JSON.stringify({
                    section_id: parseInt(form.section_id),
                    subject_id: parseInt(form.subject_id),
                    term_id: parseInt(form.term_id),
                    exam_type: form.exam_type,
                    exam_date: form.exam_date,
                    max_grade: parseInt(form.max_grade)
                })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Failed to schedule exam');
            }

            router.push('/app/exams');
        } catch (e: any) {
            setError(e.message);
            setIsSubmitting(false);
        }
    };

    if (loadingInit) return <LoadingState />;

    return (
        <div className="max-w-3xl mx-auto py-8 space-y-8">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Schedule Exam</h1>
                    <p className="text-slate-500 mt-1">Plan assessments for the academic term</p>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p>{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-8 space-y-8">

                    {/* Term Selection */}
                    <div className="space-y-2 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                        <label className="text-sm font-semibold text-blue-900 flex items-center gap-2">
                            <Layers className="w-4 h-4" /> Academic Term
                        </label>
                        <select
                            required
                            className="w-full px-4 py-2.5 bg-white border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-blue-900 font-medium"
                            value={form.term_id}
                            onChange={e => setForm({ ...form, term_id: e.target.value })}
                        >
                            <option value="">Select Term</option>
                            {terms.map((t: any) => (
                                <option key={t.id} value={t.id}>{t.name} {t.publication?.published_at ? '(Published)' : ''}</option>
                            ))}
                        </select>
                    </div>

                    {/* Section & Subject */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                <Users className="w-4 h-4" /> Target Section
                            </label>
                            <select
                                required
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                value={form.section_id}
                                onChange={e => setForm({ ...form, section_id: e.target.value })}
                            >
                                <option value="">Select Section</option>
                                {sections.map((s: any) => (
                                    <option key={s.id} value={s.id}>{s.name} - {s.grade?.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                <BookOpen className="w-4 h-4" /> Subject
                            </label>
                            <select
                                required
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                value={form.subject_id}
                                onChange={e => setForm({ ...form, subject_id: e.target.value })}
                            >
                                <option value="">Select Subject</option>
                                {subjects.map((s: any) => (
                                    <option key={s.id} value={s.id}>{s.name || s.name_en}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Exam Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                <FileText className="w-4 h-4" /> Exam Type
                            </label>
                            <select
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                value={form.exam_type}
                                onChange={e => setForm({ ...form, exam_type: e.target.value })}
                            >
                                {['UNIT', 'MIDTERM', 'FINAL', 'PROJECT'].map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                <Calendar className="w-4 h-4" /> Exam Date
                            </label>
                            <input
                                type="date"
                                required
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                value={form.exam_date}
                                onChange={e => setForm({ ...form, exam_date: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                <CheckCircle className="w-4 h-4" /> Max Marks
                            </label>
                            <input
                                type="number"
                                required
                                min="0"
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                value={form.max_grade}
                                onChange={e => setForm({ ...form, max_grade: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                <div className="px-8 py-6 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-6 py-2.5 text-slate-600 font-medium hover:bg-white hover:shadow-sm rounded-xl transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        disabled={isSubmitting}
                        className="px-8 py-2.5 bg-indigo-600 text-white font-bold rounded-xl shadow-md hover:bg-indigo-700 hover:shadow-lg transition-all disabled:opacity-70 flex items-center gap-2"
                    >
                        {isSubmitting ? 'Scheduling...' : 'Schedule Exam'}
                    </button>
                </div>
            </form>
        </div>
    );
}
