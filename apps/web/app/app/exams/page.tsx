
'use client';

import { useState, useEffect } from 'react';
import { useMe } from '../../../lib/useMe';
import { apiClient } from '../../../services/apiClient';
import { LoadingState } from '../../../components/LoadingState';
import { useRouter } from 'next/navigation';
import { EmptyState } from '../../../components/EmptyState';
import {
    Plus, Calendar, CheckCircle, AlertCircle,
    FileText, Calculator, Layers, Users
} from 'lucide-react';

export default function ExamsPage() {
    const { me, loading } = useMe();
    const router = useRouter();
    const [terms, setTerms] = useState<any[]>([]);
    const [activeTerm, setActiveTerm] = useState<string>('');
    const [exams, setExams] = useState<any[]>([]);
    const [loadingExams, setLoadingExams] = useState(false);

    // Teacher Section Logic
    const [teacherSections, setTeacherSections] = useState<any[]>([]);
    const [sectionId, setSectionId] = useState<string>('');

    // Parent Logic
    const [childId, setChildId] = useState<string>('');

    // 1. Load Terms & Initial Data
    useEffect(() => {
        const loadInit = async () => {
            try {
                const termRes = await apiClient('/terms/current');
                const t = await termRes.json();
                setTerms(t);
                if (t.length > 0) setActiveTerm(t[0].id);

                if (me?.user_type === 'STAFF') {
                    const timetableRes = await apiClient('/timetable/teacher/me');
                    if (timetableRes.ok) {
                        const entries = await timetableRes.json();
                        const uniqueSections = Array.from(new Map(entries.map((e: any) => [e.section_id, e.section])).values());
                        setTeacherSections(uniqueSections);
                        if (uniqueSections.length > 0) {
                            setSectionId((uniqueSections[0] as any).id.toString());
                        }
                    }
                }
            } catch (e) { console.error(e); }
        };
        if (me) loadInit();
    }, [me]);

    // 2. Load Exams based on selection
    useEffect(() => {
        if (!activeTerm || !me) return;

        const loadExams = async () => {
            setLoadingExams(true);
            try {
                let url = '';
                if (me.user_type === 'STAFF') {
                    if (!sectionId) return; // Wait for section
                    url = `/exams/section/${sectionId}?term_id=${activeTerm}`;
                } else if (me.user_type === 'STUDENT') {
                    const sSection = me.student?.enrollments?.find((e: any) => e.status === 'ACTIVE')?.section_id;
                    if (sSection) url = `/exams/section/${sSection}?term_id=${activeTerm}`;
                } else if (me.user_type === 'PARENT') {
                    // MVP Parent Logic (first child)
                    const childRes = await apiClient('/parent/children');
                    const children = await childRes.json();
                    if (children.length > 0) {
                        const activeChild = childId ? children.find((c: any) => c.student.id.toString() === childId) : children[0];
                        if (activeChild) {
                            const enrollment = activeChild.student.enrollments.find((e: any) => e.status === 'ACTIVE');
                            if (enrollment) {
                                url = `/exams/section/${enrollment.section_id}?term_id=${activeTerm}`;
                            }
                        }
                    }
                }

                if (url) {
                    const res = await apiClient(url);
                    setExams(await res.json());
                }
            } catch (e) { console.error(e); }
            finally { setLoadingExams(false); }
        };

        loadExams();
    }, [activeTerm, sectionId, me, childId]);

    const canSchedule = Array.isArray(me?.permissions) && me.permissions.includes('exams.schedule');
    const canEnterMarks = Array.isArray(me?.permissions) && me.permissions.includes('exams.marks.update');

    if (loading) return <LoadingState />;

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Exams & Results</h1>
                    <p className="text-slate-500 mt-1">Manage assessments and grading</p>
                </div>
                {canSchedule && (
                    <button
                        onClick={() => router.push('/app/exams/new')}
                        className="inline-flex items-center px-5 py-2.5 bg-blue-600 text-white font-medium rounded-xl shadow-sm hover:bg-blue-700 hover:shadow-md transition-all active:scale-95"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Schedule Exam
                    </button>
                )}
            </div>

            {/* Controls */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-wrap gap-6 items-center">
                {/* Term Selector */}
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                        <Layers className="w-5 h-5" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Term</label>
                        <select
                            className="bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-48 p-2.5 font-medium"
                            value={activeTerm}
                            onChange={e => setActiveTerm(e.target.value)}
                        >
                            {terms.map((t: any) => (
                                <option key={t.id} value={t.id}>
                                    {t.name} {t.publication?.published_at ? '' : '(Draft)'}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Section Selector (Teacher) */}
                {me?.user_type === 'STAFF' && (
                    <div className="flex items-center gap-3 border-l border-slate-100 pl-6">
                        <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                            <Users className="w-5 h-5" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Class Section</label>
                            {teacherSections.length > 0 ? (
                                <select
                                    className="bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-48 p-2.5 font-medium"
                                    value={sectionId}
                                    onChange={e => setSectionId(e.target.value)}
                                >
                                    {teacherSections.map((s: any) => (
                                        <option key={s.id} value={s.id}>{s.name} - {s.grade?.name}</option>
                                    ))}
                                </select>
                            ) : (
                                <span className="text-sm text-red-500 italic">No sections found</span>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Content */}
            {loadingExams ? (
                <LoadingState />
            ) : exams.length === 0 ? (
                <EmptyState title="No exams scheduled" description="Select a different term or schedule a new one." />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {exams.map((exam: any) => {
                        const isPast = new Date(exam.exam_date) < new Date();
                        // Check if we can infer grading status? (Not in generic response, unless added via `withCount`)
                        // Assume if past, grading might be needed.

                        return (
                            <div key={exam.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-all group relative overflow-hidden">
                                <div className={`absolute top-0 left-0 w-1 h-full ${exam.exam_type === 'MIDTERM' ? 'bg-orange-500' :
                                    exam.exam_type === 'FINAL' ? 'bg-red-500' : 'bg-blue-500'
                                    }`} />

                                <div className="flex justify-between items-start mb-4 pl-3">
                                    <span className={`px-2.5 py-1 text-xs font-bold rounded-full uppercase tracking-wide ${exam.exam_type === 'MIDTERM' ? 'bg-orange-100 text-orange-700' :
                                        exam.exam_type === 'FINAL' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                                        }`}>
                                        {exam.exam_type}
                                    </span>
                                    {isPast ? (
                                        <div className="flex items-center text-xs text-slate-500 font-medium bg-slate-100 px-2 py-1 rounded">
                                            <CheckCircle className="w-3 h-3 mr-1" />
                                            Completed
                                        </div>
                                    ) : (
                                        <div className="flex items-center text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded">
                                            <Calendar className="w-3 h-3 mr-1" />
                                            Upcoming
                                        </div>
                                    )}
                                </div>

                                <div className="pl-3 mb-6">
                                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-1">
                                        {exam.subject?.name_en || `Subject ID: ${exam.subject_id}`}
                                    </h3>
                                    <p className="text-slate-500 text-sm">
                                        Max Marks: <span className="font-semibold text-slate-900">{exam.max_grade}</span>
                                    </p>
                                    <div className="mt-3 flex items-center text-sm font-medium text-slate-600">
                                        <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                                        {new Date(exam.exam_date).toLocaleDateString()}
                                    </div>
                                </div>

                                {canEnterMarks && (
                                    <div className="pl-3 mt-4 pt-4 border-t border-slate-100">
                                        <button
                                            onClick={() => router.push(`/app/exams/${exam.id}/marks`)}
                                            className="w-full py-2.5 bg-indigo-50 text-indigo-700 font-bold rounded-xl hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2 text-sm"
                                        >
                                            <Calculator className="w-4 h-4" />
                                            {isPast ? 'Manage Marks' : 'Prepare Grading'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
