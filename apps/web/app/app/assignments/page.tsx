
'use client';

import { useState, useEffect } from 'react';
import { useMe } from '../../../lib/useMe';
import { apiClient } from '../../../services/apiClient';
import { LoadingState } from '../../../components/LoadingState';
import { useRouter } from 'next/navigation';
import { EmptyState } from '../../../components/EmptyState';
import {
    Plus, Search, Clock, CheckCircle, AlertCircle,
    FileText, Calendar, ChevronRight
} from 'lucide-react';

export default function AssignmentsPage() {
    const { me, loading } = useMe();
    const router = useRouter();
    const [assignments, setAssignments] = useState<any[]>([]);
    const [loadingList, setLoadingList] = useState(true);
    const [search, setSearch] = useState('');

    // Parent Child Selection MVP
    const [childId, setChildId] = useState<string>('');

    const loadAssignments = async () => {
        setLoadingList(true);
        try {
            if (me?.user_type === 'STAFF') {
                const res = await apiClient('/assignments/mine');
                setAssignments(await res.json());
            } else if (me?.user_type === 'PARENT' || me?.user_type === 'STUDENT') {
                // If Parent, we simulate picking a child (MVP logic maintained)
                // If Student, API handles '/assignments/mine' correctly? 
                // Wait, 'listMine' in controller checks user type.
                // Assuming it works for STUDENT too or we use slightly different logic.
                // Let's rely on 'mine' for Student, and logic for Parent.

                if (me?.user_type === 'STUDENT') {
                    // TODO: Verify endpoint support for Student 'mine'
                    // Typically 'mine' implies created by me for staff.
                    // For student, we might need '/assignments/section/{id}'
                    // But let's assume '/assignments/mine' defaults to listing assignments FOR the student.
                    // If not, we might fail.

                    // Let's try listing by section if 'mine' fails or return empty.
                    // Actually, we can fetch student's active enrollment section.
                    const sectionId = me.student?.enrollments?.find((e: any) => e.status === 'ACTIVE')?.section_id;
                    if (sectionId) {
                        const res = await apiClient(`/assignments/section/${sectionId}`);
                        setAssignments(await res.json());
                    }
                } else {
                    // Parent logic (existing)
                    const childRes = await apiClient('/parent/children');
                    const children = await childRes.json();
                    if (children.length > 0) {
                        const activeChild = childId ? children.find((c: any) => c.student.id.toString() === childId) : children[0];
                        if (activeChild) {
                            const enrollment = activeChild.student.enrollments.find((e: any) => e.status === 'ACTIVE');
                            if (enrollment) {
                                const res = await apiClient(`/assignments/section/${enrollment.section_id}?child_student_id=${activeChild.student.id}`);
                                setAssignments(await res.json());
                            }
                        }
                    }
                }
            }
        } catch (e) {
            console.error(e);
        } finally { setLoadingList(false); }
    };

    useEffect(() => {
        if (!me) return;
        loadAssignments();
    }, [me, childId]);

    const canCreate = Array.isArray(me?.permissions) && me.permissions.includes('assignments.create');

    // Categorize for Kanban (Student/Parent)
    const getKanbanColumns = () => {
        const now = new Date();
        const todo = assignments.filter(a => !a.submission && new Date(a.due_at) > now);
        const missing = assignments.filter(a => !a.submission && new Date(a.due_at) < now);
        const done = assignments.filter(a => a.submission);
        return { todo, missing, done };
    };

    if (loading) return <LoadingState />;

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Assignments</h1>
                    <p className="text-slate-500 mt-1">Manage coursework and submissions</p>
                </div>
                {canCreate && (
                    <button
                        onClick={() => router.push('/app/assignments/new')}
                        className="inline-flex items-center px-5 py-2.5 bg-blue-600 text-white font-medium rounded-xl shadow-sm hover:bg-blue-700 hover:shadow-md transition-all active:scale-95"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        New Assignment
                    </button>
                )}
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                    type="text"
                    placeholder="Search assignments..."
                    className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>

            {loadingList ? (
                <LoadingState />
            ) : assignments.length === 0 ? (
                <EmptyState title="No assignments found" description="You're all caught up for now." />
            ) : (
                <>
                    {/* View Switcher based on Role */}
                    {(me?.user_type === 'STUDENT' || me?.user_type === 'PARENT') ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* TODO Column */}
                            <KanbanColumn
                                title="To Do"
                                items={getKanbanColumns().todo}
                                icon={Clock}
                                color="blue"
                                search={search}
                            />
                            {/* MISSING Column */}
                            <KanbanColumn
                                title="Missing / Overdue"
                                items={getKanbanColumns().missing}
                                icon={AlertCircle}
                                color="red"
                                search={search}
                            />
                            {/* DONE Column */}
                            <KanbanColumn
                                title="Completed"
                                items={getKanbanColumns().done}
                                icon={CheckCircle}
                                color="green"
                                search={search}
                            />
                        </div>
                    ) : (
                        /* Teacher Grid View */
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {assignments.filter(a => a.title_en.toLowerCase().includes(search.toLowerCase())).map((item: any) => (
                                <div
                                    key={item.id}
                                    onClick={() => router.push(`/app/assignments/${item.id}`)}
                                    className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                            <FileText className="w-6 h-6 " />
                                        </div>
                                        <span className={`px-2.5 py-1 text-xs font-bold rounded-full uppercase tracking-wide ${item.assignment_type === 'HOMEWORK' ? 'bg-indigo-100 text-indigo-700' :
                                            item.assignment_type === 'QUIZ' ? 'bg-purple-100 text-purple-700' :
                                                'bg-gray-100 text-gray-700'
                                            }`}>
                                            {item.assignment_type}
                                        </span>
                                    </div>

                                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-2 line-clamp-2">
                                        {item.title_en}
                                    </h3>

                                    <div className="flex items-center text-slate-500 text-sm mb-4">
                                        <Calendar className="w-4 h-4 mr-2" />
                                        <span>Due {new Date(item.due_at).toLocaleDateString()}</span>
                                    </div>

                                    <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-sm">
                                        <span className="text-slate-600 font-medium">
                                            View Submissions
                                        </span>
                                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

function KanbanColumn({ title, items, icon: Icon, color, search }: any) {
    const router = useRouter();
    const filtered = items.filter((i: any) => i.title_en.toLowerCase().includes(search.toLowerCase()));

    const colors: any = {
        blue: 'bg-blue-50 text-blue-700 border-blue-200',
        red: 'bg-red-50 text-red-700 border-red-200',
        green: 'bg-green-50 text-green-700 border-green-200'
    };

    return (
        <div className="flex flex-col gap-4">
            <div className={`p-4 rounded-xl border flex items-center justify-between ${colors[color]}`}>
                <div className="flex items-center gap-2 font-bold">
                    <Icon className="w-5 h-5" />
                    {title}
                </div>
                <span className="bg-white/50 px-2 py-0.5 rounded text-sm font-bold">
                    {filtered.length}
                </span>
            </div>

            <div className="space-y-4">
                {filtered.map((item: any) => (
                    <div
                        key={item.id}
                        onClick={() => router.push(`/app/assignments/${item.id}`)}
                        className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all cursor-pointer group"
                    >
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                {item.assignment_type}
                            </span>
                            {item.max_grade && (
                                <span className="text-xs font-medium text-slate-400">
                                    {item.max_grade} pts
                                </span>
                            )}
                        </div>
                        <h4 className="font-bold text-slate-800 mb-2 leading-tight group-hover:text-blue-600 transition-colors">
                            {item.title_en}
                        </h4>
                        <div className="flex items-center text-xs text-slate-500">
                            <Clock className="w-3.5 h-3.5 mr-1.5" />
                            {new Date(item.due_at).toLocaleDateString()}
                        </div>
                    </div>
                ))}
                {filtered.length === 0 && (
                    <div className="text-center py-8 text-slate-400 text-sm border-2 border-dashed border-slate-100 rounded-xl">
                        No assignments
                    </div>
                )}
            </div>
        </div>
    );
}
