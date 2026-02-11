
'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '../../../../services/apiClient';
import { LoadingState } from '../../../../components/LoadingState';
import { BookOpen, Layers, Plus, School, Trash2, Edit3, Settings, Hash } from 'lucide-react';
import Link from 'next/link';

export default function StructureMasterPage() {
    const [loading, setLoading] = useState(true);
    const [structure, setStructure] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'subjects' | 'grades' | 'branches'>('subjects');
    const [editingSection, setEditingSection] = useState<any>(null);
    const [editingBranch, setEditingBranch] = useState<any>(null);
    const [editingGrade, setEditingGrade] = useState<any>(null);
    const [editingSubject, setEditingSubject] = useState<any>(null);
    const [assignedSubjects, setAssignedSubjects] = useState<any[]>([]);
    const [teachers, setTeachers] = useState<any[]>([]);
    const [saving, setSaving] = useState(false);
    const [currentSectionTab, setCurrentSectionTab] = useState<'details' | 'subjects'>('details');

    const fetchStructure = async () => {
        setLoading(true);
        try {
            const res = await apiClient('/structure');
            if (!res.ok) throw new Error('Failed to fetch structure');
            const data = await res.json();
            setStructure(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStructure();
    }, []);

    const fetchTeachers = async () => {
        try {
            const res = await apiClient('/admin/users?user_type=STAFF');
            if (res.ok) {
                const data = await res.json();
                setTeachers(Array.isArray(data.data) ? data.data : []);
            }
        } catch (e) {
            console.error('Failed to fetch teachers', e);
        }
    };

    const fetchSectionSubjects = async (sectionId: number) => {
        try {
            const res = await apiClient(`/admin/sections/${sectionId}/subjects`);
            if (res.ok) {
                const data = await res.json();
                setAssignedSubjects(data.map((item: any) => ({
                    subject_id: item.subject_id,
                    teacher_user_id: item.teacher_user_id
                })));
            }
        } catch (e) {
            console.error('Failed to fetch section subjects', e);
        }
    };

    const handleEditSection = (section: any) => {
        setEditingSection({ ...section });
        setCurrentSectionTab('details');
        setAssignedSubjects([]);
        if (section.id) {
            fetchSectionSubjects(section.id);
        }
        if (teachers.length === 0) fetchTeachers();
    };

    const handleUpdateSection = async () => {
        if (!editingSection) return;
        setSaving(true);
        try {
            const isNew = !editingSection.id;
            const res = await apiClient(`/admin/sections${isNew ? '' : `/${editingSection.id}`}`, {
                method: isNew ? 'POST' : 'PUT',
                body: JSON.stringify({
                    grade_id: editingSection.grade_id,
                    name: editingSection.name,
                    capacity: editingSection.capacity,
                    class_teacher_id: editingSection.class_teacher_id
                })
            });

            if (res.ok) {
                // If we also assigned subjects, sync those
                if (!isNew && assignedSubjects.length > 0) {
                    await apiClient(`/admin/sections/${editingSection.id}/subjects`, {
                        method: 'POST',
                        body: JSON.stringify({ subjects: assignedSubjects })
                    });
                }
                setEditingSection(null);
                fetchStructure();
            } else {
                const err = await res.json();
                alert(err.message || 'Update failed');
            }
        } catch (e) {
            console.error(e);
            alert('An error occurred');
        } finally {
            setSaving(false);
        }
    };

    const handleEditGrade = (grade: any) => {
        setEditingGrade({ ...grade });
    };

    const handleUpdateGrade = async () => {
        if (!editingGrade) return;
        setSaving(true);
        try {
            const isNew = !editingGrade.id;
            const res = await apiClient(`/admin/grades${isNew ? '' : `/${editingGrade.id}`}`, {
                method: isNew ? 'POST' : 'PUT',
                body: JSON.stringify(editingGrade)
            });

            if (res.ok) {
                setEditingGrade(null);
                fetchStructure();
            } else {
                const err = await res.json();
                alert(err.message || 'Saving failed');
            }
        } catch (e) {
            console.error(e);
            alert('An error occurred');
        } finally {
            setSaving(false);
        }
    };

    const handleEditBranch = (branch: any) => {
        setEditingBranch({ ...branch });
    };

    const handleUpdateBranch = async () => {
        if (!editingBranch) return;
        setSaving(true);
        try {
            const isNew = !editingBranch.id;
            const payload = {
                name: editingBranch.name,
                code: editingBranch.code,
                address: editingBranch.address,
                phone: editingBranch.phone,
                email: editingBranch.email,
                is_active: editingBranch.is_active
            };

            const res = await apiClient(`/admin/branches${isNew ? '' : `/${editingBranch.id}`}`, {
                method: isNew ? 'POST' : 'PUT',
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                setEditingBranch(null);
                fetchStructure();
            } else {
                const err = await res.json();
                alert(err.message || 'Saving failed');
            }
        } catch (e) {
            console.error(e);
            alert('An error occurred');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteGrade = async (id: number) => {
        if (!confirm('Are you sure you want to delete this grade? All sections must be removed first.')) return;
        try {
            const res = await apiClient(`/admin/grades/${id}`, { method: 'DELETE' });
            if (res.ok) fetchStructure();
            else {
                const err = await res.json();
                alert(err.message || 'Delete failed');
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleDeleteSection = async (id: number) => {
        if (!confirm('Are you sure you want to delete this section?')) return;
        try {
            const res = await apiClient(`/admin/sections/${id}`, { method: 'DELETE' });
            if (res.ok) fetchStructure();
            else {
                const err = await res.json();
                alert(err.message || 'Delete failed');
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleEditSubject = (subject: any) => {
        setEditingSubject({ ...subject });
    };

    const handleDeleteSubject = async (id: number) => {
        if (!confirm('Are you sure you want to delete this subject?')) return;
        try {
            const res = await apiClient(`/admin/subjects/${id}`, { method: 'DELETE' });
            if (res.ok) fetchStructure();
            else {
                const err = await res.json();
                alert(err.message || 'Delete failed');
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleUpdateSubject = async () => {
        if (!editingSubject) return;
        setSaving(true);
        try {
            const res = await apiClient(`/admin/subjects/${editingSubject.id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    ...editingSubject,
                    credits: parseInt(editingSubject.credits),
                    passing_marks: parseInt(editingSubject.passing_marks),
                    max_marks: parseInt(editingSubject.max_marks)
                })
            });

            if (res.ok) {
                setEditingSubject(null);
                fetchStructure();
            } else {
                const err = await res.json();
                alert(err.message || 'Update failed');
            }
        } catch (e) {
            console.error(e);
            alert('An error occurred');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <LoadingState />;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center text-gray-900">
                        <Settings className="w-8 h-8 mr-3 text-emerald-600" />
                        Academic Structure
                    </h1>
                    <p className="text-gray-500">Manage branches, grades, sections and subject offerings.</p>
                </div>
            </div>

            <div className="flex border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('subjects')}
                    className={`px-6 py-3 text-sm font-bold flex items-center transition-all border-b-2 ${activeTab === 'subjects' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    <BookOpen className="w-4 h-4 mr-2" />
                    Subject Master
                </button>
                <button
                    onClick={() => setActiveTab('grades')}
                    className={`px-6 py-3 text-sm font-bold flex items-center transition-all border-b-2 ${activeTab === 'grades' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    <Layers className="w-4 h-4 mr-2" />
                    Grades & Sections
                </button>
                <button
                    onClick={() => setActiveTab('branches')}
                    className={`px-6 py-3 text-sm font-bold flex items-center transition-all border-b-2 ${activeTab === 'branches' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    <School className="w-4 h-4 mr-2" />
                    Branches
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {activeTab === 'subjects' && (
                    <div className="p-0">
                        <div className="p-4 bg-gray-50/50 flex items-center justify-between border-b border-gray-100">
                            <span className="text-sm font-bold text-gray-600 uppercase tracking-tighter">Global Subject Catalog</span>
                            <Link href="/app/admin/structure/subjects/new" className="flex items-center text-xs font-bold bg-emerald-600 text-white px-3 py-1.5 rounded hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-100">
                                <Plus className="w-3.5 h-3.5 mr-1" />
                                Add New Subject
                            </Link>
                        </div>
                        <table className="min-w-full divide-y divide-gray-100">
                            <thead className="bg-white">
                                <tr>
                                    <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Subject Name</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Code</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Type</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Credits</th>
                                    <th className="px-6 py-4 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-50">
                                {structure?.branches?.[0]?.subjects?.map((sub: any) => (
                                    <tr key={sub.id} className="hover:bg-emerald-50/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mr-3 font-bold text-xs">
                                                    {(sub.name_en || '').charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-gray-900">{sub.name_en || 'Unknown Subject'}</div>
                                                    <div className="text-xs text-gray-400">{sub.name_ar}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-xs font-mono font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded uppercase tracking-tighter">
                                                {sub.code}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-widest ${sub.type === 'MANDATORY' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}`}>
                                                {sub.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center text-sm font-bold text-gray-700">
                                                <Hash className="w-3.5 h-3.5 mr-1 text-gray-300" />
                                                {sub.credits}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleEditSubject(sub)}
                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                >
                                                    <Edit3 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteSubject(sub.id)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'grades' && (
                    <div className="p-8">
                        {structure?.branches?.map((branch: any) => (
                            <div key={branch.id} className="space-y-6">
                                <div className="flex items-center justify-between border-b pb-2">
                                    <h3 className="text-lg font-bold flex items-center text-gray-800">
                                        <School className="w-5 h-5 mr-2 text-emerald-600" />
                                        {branch.name}
                                    </h3>
                                    <button
                                        onClick={() => handleEditGrade({ branch_id: branch.id, name: '', level_type: 'Primary', sort_order: 1 })}
                                        className="flex items-center text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 px-3 py-1 rounded-lg hover:bg-emerald-100 transition-colors"
                                    >
                                        <Plus className="w-3 h-3 mr-1" />
                                        Add Grade
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {branch.grades?.map((grade: any) => (
                                        <div key={grade.id} className="border border-gray-100 rounded-xl bg-gray-50/30 p-4 hover:shadow-md transition-shadow group/grade">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-bold text-gray-900">{grade.name}</h4>
                                                    <button
                                                        onClick={() => handleEditGrade(grade)}
                                                        className="p-1 px-1.5 bg-white border border-gray-100 rounded text-gray-400 hover:text-emerald-600 opacity-0 group-hover/grade:opacity-100 transition-all shadow-sm"
                                                    >
                                                        <Edit3 className="w-3 h-3" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteGrade(grade.id)}
                                                        className="p-1 px-1.5 bg-white border border-gray-100 rounded text-gray-400 hover:text-red-600 opacity-0 group-hover/grade:opacity-100 transition-all shadow-sm"
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </button>
                                                </div>
                                                <span className="text-[10px] font-bold bg-white border border-gray-200 text-gray-500 px-2 py-0.5 rounded uppercase tracking-wider">
                                                    {grade.sections?.length || 0} Sections
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {grade.sections?.map((section: any) => (
                                                    <div
                                                        key={section.id}
                                                        onClick={() => handleEditSection(section)}
                                                        className="px-3 py-1.5 bg-white border border-gray-100 rounded-lg text-sm text-gray-600 flex flex-col hover:border-emerald-200 hover:text-emerald-700 transition-all cursor-pointer group shadow-sm min-w-[100px]"
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <span className="font-bold">{section.name}</span>
                                                            <div className="flex gap-1">
                                                                <Edit3 className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                                <Trash2
                                                                    className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-600"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleDeleteSection(section.id);
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="text-[10px] text-gray-400 mt-1 truncate">
                                                            {section.class_teacher?.full_name || 'No Teacher'}
                                                        </div>
                                                    </div>
                                                ))}
                                                <button
                                                    onClick={() => handleEditSection({ grade_id: grade.id, name: '', capacity: 30, class_teacher_id: null })}
                                                    className="px-3 py-1.5 border border-dashed border-gray-300 rounded-lg text-sm text-gray-400 hover:border-emerald-400 hover:text-emerald-600 transition-all flex items-center"
                                                >
                                                    <Plus className="w-3 h-3 mr-1" />
                                                    Add
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'branches' && (
                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                        {structure?.branches?.map((branch: any) => (
                            <div key={branch.id} className="p-6 bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-2xl shadow-sm hover:shadow-lg transition-all group">
                                <div className="flex items-start justify-between">
                                    <div className="w-14 h-14 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-2xl shadow-lg shadow-emerald-100 group-hover:scale-110 transition-transform">
                                        {(branch.name || '').charAt(0)}
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEditBranch(branch)}
                                            className="p-2 bg-white border border-gray-100 rounded-lg text-gray-400 hover:text-emerald-600 hover:border-emerald-100 transition-all"
                                        >
                                            <Edit3 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <div className="mt-6">
                                    <h3 className="text-xl font-bold text-gray-900 mb-1">{branch.name}</h3>
                                    <p className="text-sm text-gray-500 mb-4">{branch.address || 'No address specified'}</p>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-3 bg-white border border-gray-100 rounded-xl">
                                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Grades</div>
                                            <div className="text-xl font-bold text-gray-900">{branch.grades?.length || 0}</div>
                                        </div>
                                        <div className="p-3 bg-white border border-gray-100 rounded-xl">
                                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Created</div>
                                            <div className="text-sm font-bold text-gray-700">{new Date(branch.created_at).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <button
                            onClick={() => handleEditBranch({ name: '', code: '', address: '', phone: '', email: '', is_active: true })}
                            className="p-6 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-gray-400 hover:border-emerald-400 hover:text-emerald-600 transition-all group bg-gray-50/50"
                        >
                            <Plus className="w-10 h-10 mb-2 group-hover:scale-110 transition-transform text-gray-300 group-hover:text-emerald-300" />
                            <span className="font-bold">Add New Branch</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Editing Section Modal */}
            {editingSection && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="bg-slate-50 border-b border-slate-100 flex overflow-hidden">
                            <button
                                onClick={() => setCurrentSectionTab('details')}
                                className={`flex-1 px-8 py-4 text-sm font-bold transition-all ${currentSectionTab === 'details' ? 'bg-white text-emerald-600 border-b-2 border-emerald-600' : 'text-slate-500 hover:bg-slate-100'}`}
                            >
                                Section Details
                            </button>
                            <button
                                onClick={() => setCurrentSectionTab('subjects')}
                                className={`flex-1 px-8 py-4 text-sm font-bold transition-all ${currentSectionTab === 'subjects' ? 'bg-white text-emerald-600 border-b-2 border-emerald-600' : 'text-slate-500 hover:bg-slate-100'}`}
                            >
                                Subjects & Teachers
                            </button>
                        </div>

                        <div className="p-8 space-y-6">
                            {currentSectionTab === 'details' ? (
                                <>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Section Name</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                                            value={editingSection.name}
                                            onChange={e => setEditingSection({ ...editingSection, name: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Class Teacher (Overall)</label>
                                        <select
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                                            value={editingSection.class_teacher_id || ''}
                                            onChange={e => setEditingSection({ ...editingSection, class_teacher_id: e.target.value || null })}
                                        >
                                            <option value="">-- No Teacher Assigned --</option>
                                            {teachers.map(t => (
                                                <option key={t.id} value={t.id}>{t.full_name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Max Capacity</label>
                                        <input
                                            type="number"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                                            value={editingSection.capacity}
                                            onChange={e => setEditingSection({ ...editingSection, capacity: parseInt(e.target.value) })}
                                        />
                                    </div>
                                </>
                            ) : (
                                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Assigned Subjects</h4>

                                    {/* Get subjects for the branch this section belongs to */}
                                    {structure?.branches?.find((b: any) => b.grades.some((g: any) => g.id === editingSection.grade_id))?.subjects?.map((subject: any) => {
                                        const assigned = assignedSubjects.find(as => as.subject_id === subject.id);
                                        return (
                                            <div key={subject.id} className="flex gap-4 items-end p-4 bg-slate-50 rounded-2xl border border-slate-100 group transition-all hover:bg-white hover:shadow-md">
                                                <div className="flex-1 space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-2 h-2 rounded-full ${assigned ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                                                        <span className="text-sm font-bold text-slate-900">{subject.name_en}</span>
                                                    </div>
                                                    <select
                                                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium outline-none focus:ring-2 focus:ring-emerald-500"
                                                        value={assigned?.teacher_user_id || ''}
                                                        onChange={(e) => {
                                                            const teacherId = e.target.value ? parseInt(e.target.value) : null;
                                                            if (!assigned) {
                                                                setAssignedSubjects([...assignedSubjects, { subject_id: subject.id, teacher_user_id: teacherId }]);
                                                            } else {
                                                                setAssignedSubjects(assignedSubjects.map(as =>
                                                                    as.subject_id === subject.id ? { ...as, teacher_user_id: teacherId } : as
                                                                ));
                                                            }
                                                        }}
                                                    >
                                                        <option value="">-- No Teacher Assigned --</option>
                                                        {teachers.map(t => (
                                                            <option key={t.id} value={t.id}>{t.full_name}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <button
                                                    onClick={() => setAssignedSubjects(assignedSubjects.filter(as => as.subject_id !== subject.id))}
                                                    className={`p-2 rounded-lg transition-all ${assigned ? 'text-red-500 hover:bg-red-50' : 'invisible'}`}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                                {!assigned && (
                                                    <button
                                                        onClick={() => setAssignedSubjects([...assignedSubjects, { subject_id: subject.id, teacher_user_id: null }])}
                                                        className="px-3 py-2 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-bold hover:bg-emerald-600 hover:text-white transition-all"
                                                    >
                                                        Add to Section
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })}

                                    {(!structure?.branches?.find((b: any) => b.grades.some((g: any) => g.id === editingSection.grade_id))?.subjects || structure?.branches?.find((b: any) => b.grades.some((g: any) => g.id === editingSection.grade_id))?.subjects.length === 0) && (
                                        <div className="text-center py-8 text-slate-400">
                                            <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-20" />
                                            <p className="text-sm">No subjects defined in this branch.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex gap-3">
                            <button
                                onClick={() => setEditingSection(null)}
                                className="flex-1 px-4 py-3 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdateSection}
                                disabled={saving}
                                className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-lg shadow-emerald-200"
                            >
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Editing Branch Modal */}
            {editingBranch && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="bg-slate-50 px-8 py-6 border-b border-slate-100">
                            <h3 className="text-xl font-bold text-slate-900">{editingBranch.id ? 'Edit Branch' : 'Add New Branch'}</h3>
                            <p className="text-sm text-slate-500">Define administrative and location details.</p>
                        </div>

                        <div className="p-8 grid grid-cols-2 gap-6">
                            <div className="col-span-2 space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Branch Name</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                                    placeholder="e.g. Al Rawda Campus"
                                    value={editingBranch.name}
                                    onChange={e => setEditingBranch({ ...editingBranch, name: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Branch Code</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                                    placeholder="e.g. RAW-01"
                                    value={editingBranch.code}
                                    onChange={e => setEditingBranch({ ...editingBranch, code: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact Number</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                                    placeholder="+966 ..."
                                    value={editingBranch.phone || ''}
                                    onChange={e => setEditingBranch({ ...editingBranch, phone: e.target.value })}
                                />
                            </div>

                            <div className="col-span-2 space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</label>
                                <input
                                    type="email"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                                    placeholder="campus@madrasatonaa.com"
                                    value={editingBranch.email || ''}
                                    onChange={e => setEditingBranch({ ...editingBranch, email: e.target.value })}
                                />
                            </div>

                            <div className="col-span-2 space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Physical Address</label>
                                <textarea
                                    rows={2}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 transition-all resize-none"
                                    value={editingBranch.address || ''}
                                    onChange={e => setEditingBranch({ ...editingBranch, address: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex gap-3">
                            <button
                                onClick={() => setEditingBranch(null)}
                                className="flex-1 px-4 py-3 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdateBranch}
                                disabled={saving}
                                className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-lg shadow-emerald-200"
                            >
                                {saving ? (editingBranch.id ? 'Updating...' : 'Creating...') : (editingBranch.id ? 'Save Changes' : 'Create Branch')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Editing Grade Modal */}
            {editingGrade && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="bg-slate-50 px-8 py-6 border-b border-slate-100">
                            <h3 className="text-xl font-bold text-slate-900">{editingGrade.id ? 'Edit Grade' : 'Add New Grade'}</h3>
                            <p className="text-sm text-slate-500">Configure grade name and academic level.</p>
                        </div>

                        <div className="p-8 space-y-6">
                            {!editingGrade.id && (
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Branch</label>
                                    <select
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                                        value={editingGrade.branch_id}
                                        onChange={e => setEditingGrade({ ...editingGrade, branch_id: parseInt(e.target.value) })}
                                    >
                                        {structure?.branches?.map((b: any) => (
                                            <option key={b.id} value={b.id}>{b.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Grade Name</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                                    placeholder="e.g. Grade 1"
                                    value={editingGrade.name}
                                    onChange={e => setEditingGrade({ ...editingGrade, name: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Level Type</label>
                                <select
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                                    value={editingGrade.level_type}
                                    onChange={e => setEditingGrade({ ...editingGrade, level_type: e.target.value })}
                                >
                                    <option value="KG">Kindergarten (KG)</option>
                                    <option value="Primary">Primary</option>
                                    <option value="Middle">Middle / Secondary</option>
                                    <option value="High">High School</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sort Order</label>
                                <input
                                    type="number"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                                    value={editingGrade.sort_order}
                                    onChange={e => setEditingGrade({ ...editingGrade, sort_order: parseInt(e.target.value) })}
                                />
                            </div>
                        </div>

                        <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex gap-3">
                            <button
                                onClick={() => setEditingGrade(null)}
                                className="flex-1 px-4 py-3 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdateGrade}
                                disabled={saving}
                                className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-lg shadow-emerald-200"
                            >
                                {saving ? 'Saving...' : (editingGrade.id ? 'Save Changes' : 'Create Grade')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Editing Subject Modal */}
            {editingSubject && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="bg-slate-50 px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">Edit Subject</h3>
                                <p className="text-sm text-slate-500">Modify course details and grading requirements.</p>
                            </div>
                            <div className="text-xs font-mono font-bold bg-slate-200 text-slate-600 px-3 py-1 rounded-lg uppercase">
                                {editingSubject.code}
                            </div>
                        </div>

                        <div className="p-8 grid grid-cols-2 gap-6 overflow-y-auto max-h-[70vh]">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Name (English)</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                                    value={editingSubject.name_en}
                                    onChange={e => setEditingSubject({ ...editingSubject, name_en: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-right block">Name (Arabic)</label>
                                <input
                                    type="text"
                                    dir="rtl"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                                    value={editingSubject.name_ar}
                                    onChange={e => setEditingSubject({ ...editingSubject, name_ar: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Subject Type</label>
                                <select
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                                    value={editingSubject.type}
                                    onChange={e => setEditingSubject({ ...editingSubject, type: e.target.value })}
                                >
                                    <option value="MANDATORY">Mandatory</option>
                                    <option value="ELECTIVE">Elective</option>
                                    <option value="EXTRA_CURRICULAR">Extra Curricular</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Credit Hours</label>
                                <input
                                    type="number"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                                    value={editingSubject.credits}
                                    onChange={e => setEditingSubject({ ...editingSubject, credits: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Max Marks</label>
                                <input
                                    type="number"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                                    value={editingSubject.max_marks}
                                    onChange={e => setEditingSubject({ ...editingSubject, max_marks: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Passing Marks</label>
                                <input
                                    type="number"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                                    value={editingSubject.passing_marks}
                                    onChange={e => setEditingSubject({ ...editingSubject, passing_marks: e.target.value })}
                                />
                            </div>

                            <div className="col-span-2 space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</label>
                                <textarea
                                    rows={3}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                                    value={editingSubject.description || ''}
                                    onChange={e => setEditingSubject({ ...editingSubject, description: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex gap-3">
                            <button
                                onClick={() => setEditingSubject(null)}
                                className="flex-1 px-4 py-3 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdateSubject}
                                disabled={saving}
                                className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-lg shadow-emerald-200"
                            >
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
