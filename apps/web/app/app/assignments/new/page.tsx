
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '../../../../services/apiClient';
import { LoadingState } from '../../../../components/LoadingState';
import {
    BookOpen, Calendar, FileText, Upload, X,
    CheckCircle, AlertCircle, Users, Layout
} from 'lucide-react';
import { useMe } from '../../../../lib/useMe';

export default function CreateAssignment() {
    const { me } = useMe();
    const router = useRouter();

    const [sections, setSections] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [loadingInit, setLoadingInit] = useState(true);

    const [form, setForm] = useState<any>({
        section_id: '',
        subject_id: '',
        assignment_type: 'HOMEWORK',
        title_en: '',
        instructions_en: '',
        due_at: '',
        max_grade: '10',
        attachments: []
    });

    const [files, setFiles] = useState<File[]>([]); // For future file upload implementation
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadData = async () => {
            try {
                // Parallel fetch
                const [subjectsRes, timetableRes] = await Promise.all([
                    apiClient('/subjects'),
                    apiClient('/timetable/teacher/me')
                ]);

                if (subjectsRes.ok) {
                    setSubjects(await subjectsRes.json());
                }

                if (timetableRes.ok) {
                    const entries = await timetableRes.json();
                    // Extract unique sections from timetable
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
            // TODO: Upload files first and get URLs/IDs
            // For now, we just pass empty attachments or mock

            const payload = {
                ...form,
                section_id: parseInt(form.section_id),
                subject_id: parseInt(form.subject_id),
                max_grade: parseInt(form.max_grade),
                attachments: [] // Implement file upload service later
            };

            const res = await apiClient('/assignments', {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Failed to create assignment');
            }

            // Success
            router.push('/app/assignments');
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
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Create Assignment</h1>
                    <p className="text-slate-500 mt-1">Distribute work to your students</p>
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

                    {/* Metadata */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                <Layout className="w-4 h-4" /> Type
                            </label>
                            <select
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                value={form.assignment_type}
                                onChange={e => setForm({ ...form, assignment_type: e.target.value })}
                            >
                                {['HOMEWORK', 'CLASSWORK', 'PROJECT', 'QUIZ'].map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                <Calendar className="w-4 h-4" /> Due Date
                            </label>
                            <input
                                type="datetime-local"
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                value={form.due_at}
                                onChange={e => setForm({ ...form, due_at: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                <CheckCircle className="w-4 h-4" /> Max Points
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

                    {/* Content */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Assignment Title</label>
                        <input
                            required
                            placeholder="e.g. Chapter 5 Review Questions"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-lg"
                            value={form.title_en}
                            onChange={e => setForm({ ...form, title_en: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Instructions</label>
                        <textarea
                            required
                            placeholder="Provide detailed instructions for the students..."
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all h-40 resize-none"
                            value={form.instructions_en}
                            onChange={e => setForm({ ...form, instructions_en: e.target.value })}
                        />
                    </div>

                    {/* File Attachment Mock */}
                    <div className="p-6 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer flex flex-col items-center justify-center text-slate-500 gap-2">
                        <Upload className="w-8 h-8 text-slate-400" />
                        <span className="text-sm font-medium">Click to attach files (Coming Soon)</span>
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
                        {isSubmitting ? 'Publishing...' : 'Publish Assignment'}
                    </button>
                </div>
            </form>
        </div>
    );
}
