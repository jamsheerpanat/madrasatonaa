
'use client';

import { useState, useEffect } from 'react';
import { useMe } from '../../../../lib/useMe';
import { useBranchScope } from '../../../../lib/useBranchScope';
import { apiClient } from '../../../../services/apiClient';
import { TimetableGrid } from '../../../../components/timetable/TimetableGrid';
import { LoadingState } from '../../../../components/LoadingState';
import { ErrorState } from '../../../../components/ErrorState';
import { Settings } from 'lucide-react';
import Link from 'next/link';

// Simple types for dropdowns
interface Section {
    id: number;
    name: string;
    grade: { name: string };
    branch_id: number;
    branch_subjects: Subject[];
}
interface Subject { id: number; name_en: string; code: string }
interface Teacher { id: number; full_name: string }

export default function TimetableManagePage() {
    const { me, loading: meLoading } = useMe();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [sections, setSections] = useState<Section[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [sectionSubjects, setSectionSubjects] = useState<any[]>([]);

    const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null);
    const [entries, setEntries] = useState<any[]>([]);
    const [periodsPerDay, setPeriodsPerDay] = useState(8);

    // Editor State
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editCell, setEditCell] = useState<{ day: string, period: number } | null>(null);
    const [editSubjectId, setEditSubjectId] = useState<number | null>(null);
    const [editTeacherId, setEditTeacherId] = useState<number | null>(null);
    const [editRoom, setEditRoom] = useState<string>('');

    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [newPeriodsPerDay, setNewPeriodsPerDay] = useState(8);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        // Load initial data (Structure + Staff + Subjects)
        async function init() {
            try {
                // Parallel fetch
                const [structureRes, teachersRes, subjectsRes] = await Promise.all([
                    apiClient('/structure'),
                    apiClient('/admin/users?user_type=STAFF'), // Using user_type for broader compatibility
                    apiClient('/subjects')
                ]);

                if (!structureRes.ok || !teachersRes.ok) throw new Error("Failed to load metadata");

                const sectionsRes = await structureRes.json();
                const flatSections: Section[] = [];
                sectionsRes.branches.forEach((b: any) => b.grades.forEach((g: any) => g.sections.forEach((s: any) =>
                    flatSections.push({
                        ...s,
                        grade: { name: g.name },
                        branch_id: b.id,
                        branch_subjects: b.subjects || []
                    })
                )));
                setSections(flatSections);

                const teachersData = await teachersRes.json();
                setTeachers(teachersData.data || []);

                if (subjectsRes.ok) {
                    setSubjects(await subjectsRes.json());
                }

            } catch (e: any) { console.error(e); setError("Failed to load school data: " + e.message); }
        }
        init();
    }, []);

    // Filter Subjects by Section/Grade if possible (Optional advanced feature)
    // For now, show all subjects.

    const handleSectionSelect = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const sectionId = parseInt(e.target.value);
        setSelectedSectionId(sectionId);
        if (!sectionId) {
            setEntries([]);
            return;
        }

        setLoading(true);
        try {
            const [entriesRes, subjectsRes, templateRes] = await Promise.all([
                apiClient(`/timetable/section/${sectionId}`),
                apiClient(`/admin/sections/${sectionId}/subjects`),
                apiClient(`/timetable/branch/${sections.find(s => s.id === sectionId)?.branch_id}/template`)
            ]);

            if (entriesRes.ok) setEntries(await entriesRes.json());
            if (subjectsRes.ok) setSectionSubjects(await subjectsRes.json());
            if (templateRes.ok) {
                const template = await templateRes.json();
                if (template) {
                    setPeriodsPerDay(template.periods_per_day);
                    setNewPeriodsPerDay(template.periods_per_day);
                }
            }

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCellClick = (day: string, period: number, entry: any) => {
        setEditCell({ day, period });
        setEditSubjectId(entry?.subject_id || null);
        setEditTeacherId(entry?.teacher_user_id || null);
        setEditRoom(entry?.room_name || '');
        setIsEditorOpen(true);
    };

    const handleSaveCell = async () => {
        if (!selectedSectionId || !editCell) return;

        // Optimistic update
        const newEntries = [...entries];
        const idx = newEntries.findIndex(e => e.day_of_week === editCell.day && e.period_no === editCell.period);
        if (idx > -1) newEntries.splice(idx, 1);

        if (editSubjectId) {
            newEntries.push({
                day_of_week: editCell.day,
                period_no: editCell.period,
                subject_id: editSubjectId,
                teacher_user_id: editTeacherId,
                room_name: editRoom,
                // populate mock objects for display
                subject: subjects.find(s => s.id === editSubjectId),
                teacher: teachers.find(t => t.id === editTeacherId)
            });
        }
        setEntries(newEntries);
        setIsEditorOpen(false);
    };

    const saveTimetable = async () => {
        if (!selectedSectionId) return;
        setLoading(true);
        setError(null);
        try {
            const payload = {
                entries: entries.map(e => ({
                    day_of_week: e.day_of_week,
                    period_no: e.period_no,
                    subject_id: e.subject_id,
                    teacher_user_id: e.teacher_user_id,
                    room_name: e.room_name
                }))
            };

            const res = await apiClient(`/timetable/section/${selectedSectionId}`, {
                method: 'PUT',
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || (errData.errors ? JSON.stringify(errData.errors) : 'Failed to save'));
            }

            const updatedEntries = await res.json();
            setEntries(updatedEntries);
            alert('Timetable published successfully!');
        } catch (err: any) {
            let msg = err.message;
            // Parse common Laravel validation error format if stringified
            if (msg.includes('conflicts')) {
                // Try to prettify
                try {
                    const parsed = JSON.parse(msg);
                    if (parsed.conflicts) msg = parsed.conflicts;
                } catch { }
            }
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const saveTemplate = async () => {
        const section = sections.find(s => s.id === selectedSectionId);
        if (!section) return;
        setSaving(true);
        try {
            const res = await apiClient(`/timetable/branch/${section.branch_id}/template`, {
                method: 'PUT',
                body: JSON.stringify({ periods_per_day: newPeriodsPerDay })
            });
            if (res.ok) {
                setPeriodsPerDay(newPeriodsPerDay);
                setIsSettingsOpen(false);
            } else {
                const err = await res.json();
                alert(err.message || 'Failed to save template');
            }
        } catch (e) {
            console.error(e);
        } finally {
            setSaving(false);
        }
    };

    if (!(Array.isArray(me?.permissions) && me.permissions.includes('timetable.manage'))) return <ErrorState title="Access Denied" message="You do not have permission to manage timetables." />;

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-32 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Timetable Management</h1>
                    <p className="text-slate-500 mt-1">Configure class schedules, assign teachers, and manage room allocations.</p>
                </div>

                <div className="flex items-center gap-3">
                    <Link href="/app/timetable" className="text-slate-500 hover:text-slate-700 font-medium text-sm transition-colors">
                        View Grid
                    </Link>
                    {selectedSectionId && (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setIsSettingsOpen(true)}
                                className="p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-all flex items-center gap-2"
                                title="Schedule Settings"
                            >
                                <Settings className="w-4 h-4" />
                            </button>
                            <button
                                onClick={saveTimetable}
                                disabled={loading}
                                className={`px-6 py-2.5 rounded-xl font-bold shadow-lg text-sm transition-all flex items-center gap-2
                                    ${loading ? 'bg-slate-100 text-slate-400 cursor-wait' : 'bg-slate-900 text-white hover:bg-slate-800 hover:shadow-slate-200/50 hover:-translate-y-0.5'}`}
                            >
                                {loading ? 'Publishing...' : 'Publish Changes'}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-100 flex items-start gap-3">
                    <div className="mt-0.5">⚠️</div>
                    <div className="flex-1 whitespace-pre-wrap font-medium text-sm">{error}</div>
                    <button onClick={() => setError(null)} className="opacity-50 hover:opacity-100">✕</button>
                </div>
            )}

            {/* Selection Bar */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 grid md:grid-cols-3 gap-6">
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Target Section</label>
                    <div className="relative">
                        <select
                            className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 appearance-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                            onChange={handleSectionSelect}
                            value={selectedSectionId || ''}
                        >
                            <option value="">-- Select a Class --</option>
                            {sections.map(s => (
                                <option key={s.id} value={s.id}>{s.grade.name} - {s.name}</option>
                            ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
                    </div>
                </div>

                {/* Stats / Info could go here */}
                {selectedSectionId && (
                    <div className="md:col-span-2 flex items-center justify-end gap-6 text-sm text-slate-500">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                            Total Periods: <span className="font-bold text-slate-900">{entries.length}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                            Periods/Day: <span className="font-bold text-slate-900">{periodsPerDay}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Grid */}
            {selectedSectionId ? (
                <div className="animate-in slide-in-from-bottom-4 duration-500">
                    <TimetableGrid
                        entries={entries}
                        periodsPerDay={periodsPerDay}
                        editable={true}
                        onCellClick={handleCellClick}
                        loading={loading}
                    />
                </div>
            ) : (
                <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-100 mx-auto flex items-center justify-center mb-4">
                        <span className="text-2xl">📅</span>
                    </div>
                    <h3 className="text-slate-900 font-bold text-lg">No Section Selected</h3>
                    <p className="text-slate-500 max-w-sm mx-auto mt-2">Please select a class section above to view and edit its weekly schedule.</p>
                </div>
            )}

            {/* Editor Modal */}
            {isEditorOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-2xl relative animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">Edit Slot</h3>
                                <p className="text-slate-500 text-sm">{editCell?.day} • Period {editCell?.period}</p>
                            </div>
                            <button onClick={() => setIsEditorOpen(false)} className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center hover:bg-slate-100 transition-colors">✕</button>
                        </div>

                        <div className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 align-middle">
                                    Subject
                                </label>
                                <select
                                    className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    value={editSubjectId || ''}
                                    onChange={e => {
                                        const subId = Number(e.target.value) || null;
                                        setEditSubjectId(subId);
                                        // Auto-select assigned teacher for this subject
                                        if (subId) {
                                            const assignment = sectionSubjects.find(ss => ss.subject_id === subId);
                                            if (assignment?.teacher_user_id) {
                                                setEditTeacherId(assignment.teacher_user_id);
                                            }
                                        }
                                    }}
                                >
                                    <option value="">(Free Period)</option>
                                    {(sections.find(s => s.id === selectedSectionId)?.branch_subjects || subjects).map(s => (
                                        <option key={s.id} value={s.id}>{s.name_en} {s.code ? `(${s.code})` : ''}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 align-middle">
                                    Teacher
                                </label>
                                <select
                                    className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    value={editTeacherId || ''}
                                    onChange={e => setEditTeacherId(Number(e.target.value) || null)}
                                >
                                    <option value="">(No Teacher)</option>

                                    {/* Show assigned teacher for this subject first if exists */}
                                    {editSubjectId && (
                                        <>
                                            {(() => {
                                                const assignedId = sectionSubjects.find(ss => ss.subject_id === editSubjectId)?.teacher_user_id;
                                                const assignedTeacher = teachers.find(t => t.id === assignedId);
                                                if (assignedTeacher) {
                                                    return (
                                                        <optgroup label="Assigned for Subject">
                                                            <option key={`assigned-${assignedTeacher.id}`} value={assignedTeacher.id}>
                                                                ⭐ {assignedTeacher.full_name}
                                                            </option>
                                                        </optgroup>
                                                    );
                                                }
                                                return null;
                                            })()}
                                            <optgroup label="All Staff">
                                                {teachers.map(t => (
                                                    <option key={t.id} value={t.id}>{t.full_name}</option>
                                                ))}
                                            </optgroup>
                                        </>
                                    )}

                                    {!editSubjectId && teachers.map(t => (
                                        <option key={t.id} value={t.id}>{t.full_name}</option>
                                    ))}

                                    {teachers.length === 0 && (
                                        <option disabled>No staff members loaded</option>
                                    )}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 align-middle">
                                    Room (Optional)
                                </label>
                                <input
                                    type="text"
                                    className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-400"
                                    placeholder="e.g. Lab 1, Room 101"
                                    value={editRoom}
                                    onChange={e => setEditRoom(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-slate-50">
                            <button onClick={() => setIsEditorOpen(false)} className="px-5 py-2.5 text-slate-600 font-bold text-sm hover:bg-slate-50 rounded-xl transition-colors">Cancel</button>
                            <button onClick={handleSaveCell} className="px-6 py-2.5 bg-indigo-600 text-white font-bold text-sm rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all hover:-translate-y-0.5">
                                Update Slot
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Template Settings Modal */}
            {isSettingsOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white p-6 rounded-3xl w-full max-w-sm shadow-2xl relative animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-slate-900">Schedule Settings</h3>
                            <button onClick={() => setIsSettingsOpen(false)} className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center hover:bg-slate-100 transition-colors">✕</button>
                        </div>

                        <div className="space-y-4">
                            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                                <p className="text-xs text-emerald-800 leading-relaxed font-medium">
                                    Define the number of periods available per day for this branch. This will update the grid layout for all classes.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Periods Per Day</label>
                                <input
                                    type="number"
                                    min={1}
                                    max={12}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none"
                                    value={newPeriodsPerDay}
                                    onChange={e => setNewPeriodsPerDay(parseInt(e.target.value))}
                                />
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-100 flex gap-3">
                            <button onClick={() => setIsSettingsOpen(false)} className="flex-1 px-4 py-3 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">Cancel</button>
                            <button
                                onClick={saveTemplate}
                                disabled={saving}
                                className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
                            >
                                {saving ? 'Saving...' : 'Save Settings'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
