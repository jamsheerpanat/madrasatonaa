'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '../../../../../services/apiClient';
import { LoadingState } from '../../../../../components/LoadingState';
import { ArrowLeft, User, Phone, Mail, FileText, Plus, Trash2, X, Search, Check } from 'lucide-react';
import Link from 'next/link';

export default function ParentDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [guardian, setGuardian] = useState<any>(null);
    const [students, setStudents] = useState<any[]>([]);

    // Modal State
    const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [selectedStudent, setSelectedStudent] = useState<any>(null);
    const [relationship, setRelationship] = useState('FATHER');
    const [isLinking, setIsLinking] = useState(false);

    const fetchGuardian = async () => {
        try {
            const res = await apiClient(`/admin/guardians/${id}`);
            if (res.ok) {
                const data = await res.json();
                setGuardian(data);
                setStudents(data.students || []);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGuardian();
    }, [id]);

    const handleSearch = async (query: string) => {
        setSearchQuery(query);
        if (query.length > 2) {
            try {
                const res = await apiClient(`/admin/students?search=${query}`);
                if (res.ok) {
                    const data = await res.json();
                    setSearchResults(data.data || []);
                }
            } catch (error) {
                console.error(error);
            }
        } else {
            setSearchResults([]);
        }
    };

    const linkStudent = async () => {
        if (!selectedStudent) return;
        setIsLinking(true);
        try {
            const res = await apiClient(`/admin/guardians/${id}/link-student`, {
                method: 'POST',
                body: JSON.stringify({
                    student_id: selectedStudent.id,
                    relationship: relationship,
                    is_primary: true
                })
            });

            if (res.ok) {
                setIsLinkModalOpen(false);
                setSelectedStudent(null);
                setSearchQuery('');
                fetchGuardian(); // Refresh list
            } else {
                alert('Failed to link student. They might already be linked.');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLinking(false);
        }
    };

    const unlinkStudent = async (studentId: string) => {
        if (!confirm('Are you sure you want to remove this student from this guardian?')) return;
        try {
            const res = await apiClient(`/admin/guardians/${id}/link-student/${studentId}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                fetchGuardian();
            }
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) return <LoadingState />;
    if (!guardian) return <div>Guardian not found</div>;

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 relative">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/app/admin/parents" className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">{guardian.user?.full_name}</h1>
                    <p className="text-slate-500 text-sm flex items-center gap-2">
                        <User className="w-3 h-3" /> Guardian Profile
                        <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded textxs font-bold uppercase tracking-wider text-[10px]">
                            ID: {guardian.national_id || 'N/A'}
                        </span>
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Profile Card */}
                <div className="md:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center text-orange-600 text-2xl font-bold mx-auto mb-4">
                            {guardian.user?.full_name?.charAt(0)}
                        </div>
                        <h3 className="text-center font-bold text-slate-900">{guardian.user?.full_name}</h3>
                        <p className="text-center text-slate-500 text-sm mb-6">Guardian</p>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-sm text-slate-600">
                                <Mail className="w-4 h-4 text-slate-400" />
                                <span className="truncate">{guardian.user?.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-slate-600">
                                <Phone className="w-4 h-4 text-slate-400" />
                                <span>{guardian.user?.phone || 'No Phone'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-slate-600">
                                <FileText className="w-4 h-4 text-slate-400" />
                                <span>Nat ID: {guardian.national_id || '-'}</span>
                            </div>
                        </div>

                        <button className="w-full mt-6 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                            Edit Profile
                        </button>
                    </div>
                </div>

                {/* Linked Students */}
                <div className="md:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-slate-900">Linked Students</h2>
                        <button
                            onClick={() => setIsLinkModalOpen(true)}
                            className="px-4 py-2 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 flex items-center gap-2 shadow-lg shadow-slate-200 transition-all"
                        >
                            <Plus className="w-4 h-4" /> Link Student
                        </button>
                    </div>

                    {students.length === 0 ? (
                        <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-200 text-center">
                            <p className="text-slate-400 font-medium">No students linked to this guardian yet.</p>
                            <button
                                onClick={() => setIsLinkModalOpen(true)}
                                className="mt-4 text-orange-600 font-bold text-sm hover:underline"
                            >
                                Link a Student
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {students.map((student: any) => (
                                <div key={student.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between group hover:border-orange-200 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 font-bold">
                                            {student.first_name_en?.charAt(0)}
                                        </div>
                                        <div>
                                            <Link href={`/app/admin/students/${student.id}`} className="font-bold text-slate-900 hover:text-indigo-600 transition-colors block">
                                                {student.first_name_en} {student.last_name_en}
                                            </Link>
                                            <p className="text-xs text-slate-500">
                                                Class: {student.current_enrollment?.section?.grade?.name || 'N/A'} - {student.current_enrollment?.section?.name || 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Relation</span>
                                            <span className="text-sm font-medium text-slate-700">{student.pivot?.relationship || 'Parent'}</span>
                                        </div>
                                        <button
                                            onClick={() => unlinkStudent(student.id)}
                                            className="p-2 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Unlink Student"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Link Student Modal */}
            {isLinkModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="font-bold text-slate-900">Link Student</h3>
                            <button onClick={() => setIsLinkModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {!selectedStudent ? (
                                <div className="space-y-4">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="text"
                                            placeholder="Search student by name..."
                                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-100 outline-none"
                                            value={searchQuery}
                                            onChange={(e) => handleSearch(e.target.value)}
                                            autoFocus
                                        />
                                    </div>

                                    <div className="max-h-60 overflow-y-auto space-y-2">
                                        {searchResults.map(student => (
                                            <button
                                                key={student.id}
                                                onClick={() => setSelectedStudent(student)}
                                                className="w-full text-left p-3 hover:bg-slate-50 rounded-xl transition-colors flex items-center gap-3 border border-transparent hover:border-slate-100"
                                            >
                                                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xs">
                                                    {student.first_name_en?.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm text-slate-900">{student.first_name_en} {student.last_name_en}</p>
                                                    <p className="text-xs text-slate-500">ID: {student.admission_number}</p>
                                                </div>
                                            </button>
                                        ))}
                                        {searchQuery.length > 2 && searchResults.length === 0 && (
                                            <p className="text-center text-slate-400 text-sm py-4">No students found.</p>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                                    <div className="flex items-center gap-4 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-indigo-600 font-bold shadow-sm">
                                            {selectedStudent.first_name_en?.charAt(0)}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-indigo-900">{selectedStudent.first_name_en} {selectedStudent.last_name_en}</p>
                                            <button onClick={() => setSelectedStudent(null)} className="text-xs text-indigo-500 underline hover:text-indigo-700">Change Student</button>
                                        </div>
                                        <Check className="w-5 h-5 text-indigo-500" />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Relationship</label>
                                        <select
                                            className="w-full p-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-100"
                                            value={relationship}
                                            onChange={(e) => setRelationship(e.target.value)}
                                        >
                                            <option value="FATHER">Father</option>
                                            <option value="MOTHER">Mother</option>
                                            <option value="GUARDIAN">Guardian</option>
                                            <option value="SIBLING">Sibling</option>
                                            <option value="RELATIVE">Relative</option>
                                        </select>
                                    </div>

                                    <button
                                        onClick={linkStudent}
                                        disabled={isLinking}
                                        className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                                    >
                                        {isLinking ? 'Linking...' : 'Confirm Link'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
