
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '../../../../../services/apiClient';
import { LoadingState } from '../../../../../components/LoadingState';
import { ErrorState } from '../../../../../components/ErrorState';
import {
    ArrowLeft, User, Phone, Mail, Calendar, MapPin,
    BookOpen, CheckCircle, FileText, Activity, Shield,
    GraduationCap, Edit, MoreVertical, Plus, X, Trash2, Key
} from 'lucide-react';
import Link from 'next/link';

export default function StudentProfilePage() {
    const { id } = useParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [student, setStudent] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [showAddGuardian, setShowAddGuardian] = useState(false);
    const [editingGuardian, setEditingGuardian] = useState<any>(null);

    const fetchStudent = async () => {
        try {
            const res = await apiClient(`/admin/students/${id}`);
            if (!res.ok) throw new Error('Failed to load student profile');
            const data = await res.json();
            setStudent(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!id) return;
        fetchStudent();
    }, [id]);

    if (loading) return <LoadingState />;
    if (error) return <ErrorState message={error} title="Student Not Found" />;
    if (!student) return <ErrorState message="Student data is unavailable" title="No Data" />;

    const activeEnrollment = student.enrollments?.find((e: any) => e.status === 'ACTIVE');

    const tabs = [
        { id: 'overview', label: 'Overview', icon: User },
        { id: 'academic', label: 'Academic', icon: BookOpen },
        { id: 'guardians', label: 'Guardians', icon: Shield },
        { id: 'documents', label: 'Documents', icon: FileText },
        { id: 'activity', label: 'Activity', icon: Activity },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
            {/* Header */}
            <div>
                <button onClick={() => router.back()} className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 mb-4 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Back to Directory
                </button>

                <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50"></div>

                    <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
                        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-4xl shadow-lg ring-4 ring-white">
                            {(student.full_name || 'U').charAt(0)}
                        </div>
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{student.full_name}</h1>
                            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm font-medium text-slate-500">
                                <span className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-lg text-slate-600 border border-slate-200">
                                    <span className="font-mono font-bold tracking-tight">ID: {student.student_code}</span>
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <MapPin className="w-4 h-4 text-slate-400" />
                                    Main Campus
                                </span>
                                {student.dob && (
                                    <span className="flex items-center gap-1.5">
                                        <Calendar className="w-4 h-4 text-slate-400" />
                                        Born {new Date(student.dob).toLocaleDateString()}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition-all border border-transparent hover:border-slate-100">
                                <MoreVertical className="w-5 h-5" />
                            </button>
                            <Link href={`/app/admin/students/${id}/edit`} className="px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center gap-2">
                                <Edit className="w-4 h-4" />
                                Edit Profile
                            </Link>
                        </div>
                    </div>

                    {/* Quick Stats / Tabs Interface */}
                    <div className="mt-8 flex flex-col sm:flex-row items-center border-t border-slate-100 pt-6 gap-6">
                        <div className="flex flex-1 w-full gap-8 overflow-x-auto pb-2 sm:pb-0">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 pb-2 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${activeTab === tab.id
                                        ? 'text-indigo-600 border-indigo-600'
                                        : 'text-slate-500 border-transparent hover:text-slate-800'
                                        }`}
                                >
                                    <tab.icon className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column (Main Info) */}
                <div className="lg:col-span-2 space-y-6">
                    {activeTab === 'overview' && (
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-50 pb-4">Personal Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Full Name</p>
                                    <p className="font-medium text-slate-900">{student.full_name}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Gender</p>
                                    <p className="font-medium text-slate-900 capitalize">{student.gender ? student.gender.toLowerCase() : '--'}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Date of Birth</p>
                                    <p className="font-medium text-slate-900">{student.dob ? new Date(student.dob).toLocaleDateString() : '--'}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Blood Group</p>
                                    <p className="font-medium text-slate-900">{student.blood_group || '--'}</p>
                                </div>
                                <div className="md:col-span-2">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Address</p>
                                    <p className="font-medium text-slate-900">{student.address || 'No address provided.'}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'academic' && (
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-50 pb-4">Current Enrollment</h3>
                            {activeEnrollment ? (
                                <div className="bg-indigo-50/50 rounded-xl p-6 border border-indigo-100">
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-indigo-100 rounded-lg text-indigo-600">
                                            <GraduationCap className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-indigo-900 text-lg">
                                                {activeEnrollment.section?.grade?.name} - {activeEnrollment.section?.name}
                                            </h4>
                                            <p className="text-indigo-600/80 font-medium">Academic Year 2024-2025</p>
                                            <div className="mt-4 flex gap-3">
                                                <span className="px-3 py-1 bg-white rounded-lg text-xs font-bold text-indigo-600 border border-indigo-100 shadow-sm flex items-center gap-1.5">
                                                    <CheckCircle className="w-3.5 h-3.5" />
                                                    Active Status
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                    <p className="text-slate-500 font-medium">No active enrollment found.</p>
                                </div>
                            )}

                            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-50 pb-4 pt-4">Attendance Summary</h3>
                            <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                <p className="text-slate-500 font-medium">Attendance records will appear here.</p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'guardians' && (
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                                <h3 className="text-lg font-bold text-slate-900">Linked Guardians</h3>
                                <button
                                    onClick={() => setShowAddGuardian(true)}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-bold hover:bg-indigo-100 transition-all"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Guardian
                                </button>
                            </div>

                            <div className="space-y-4">
                                {student.guardians?.map((g: any) => (
                                    <div key={g.id} className="flex items-center p-4 bg-slate-50 rounded-xl border border-slate-100 group hover:border-indigo-200 transition-all">
                                        <div className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 font-bold text-lg mr-4">
                                            {(g.user?.full_name || '?').charAt(0)}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-slate-900">{g.user?.full_name || 'Unknown Guardian'}</h4>
                                            <p className="text-sm text-slate-500 capitalize">{(g.pivot?.relationship || g.relationship || '--').toLowerCase()}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            {g.user?.phone && (
                                                <button className="p-2 bg-white rounded-lg border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 transition-all" title={g.user.phone}>
                                                    <Phone className="w-4 h-4" />
                                                </button>
                                            )}
                                            {g.user?.email && (
                                                <button className="p-2 bg-white rounded-lg border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 transition-all" title={g.user.email}>
                                                    <Mail className="w-4 h-4" />
                                                </button>
                                            )}
                                            <button
                                                onClick={async () => {
                                                    const newPass = prompt(`Enter new login password for ${g.user?.full_name || 'this guardian'}:`);
                                                    if (!newPass) return;
                                                    try {
                                                        const res = await apiClient(`/admin/users/${g.user_id}/reset-password`, {
                                                            method: 'POST',
                                                            body: JSON.stringify({ password: newPass })
                                                        });
                                                        if (res.ok) alert('Password updated successfully!');
                                                        else alert('Failed to update password');
                                                    } catch (err) {
                                                        alert('An error occurred');
                                                    }
                                                }}
                                                className="p-2 bg-white rounded-lg border border-slate-200 text-slate-400 hover:text-orange-600 hover:border-orange-200 transition-all"
                                                title="Reset Login Password"
                                            >
                                                <Key className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => setEditingGuardian(g)}
                                                className="p-2 bg-white rounded-lg border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 transition-all"
                                                title="Edit Guardian"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={async () => {
                                                    if (!confirm(`Are you sure you want to unlink ${g.user?.full_name || 'this guardian'}?`)) return;
                                                    try {
                                                        const res = await apiClient(`/admin/students/${id}/guardians/${g.id}`, {
                                                            method: 'DELETE'
                                                        });
                                                        if (res.ok) fetchStudent();
                                                        else {
                                                            const data = await res.json();
                                                            alert('Failed to unlink guardian: ' + (data.error || 'Unknown error'));
                                                        }
                                                    } catch (err) {
                                                        alert('An error occurred');
                                                    }
                                                }}
                                                className="p-2 bg-white rounded-lg border border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-200 transition-all"
                                                title="Unlink Guardian"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {(!student.guardians || student.guardians.length === 0) && (
                                    <div className="p-8 text-center">
                                        <p className="text-slate-500">No guardians linked yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {(activeTab === 'documents' || activeTab === 'activity') && (
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                                {activeTab === 'documents' ? <FileText className="w-8 h-8" /> : <Activity className="w-8 h-8" />}
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">Coming Soon</h3>
                            <p className="text-slate-500 max-w-sm mx-auto">
                                This module is currently under development. Check back later for updates.
                            </p>
                        </div>
                    )}
                </div>

                {/* Right Column (Sidebar) */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                        <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">Contact Info</h3>
                        <ul className="space-y-4">
                            <li className="flex items-center text-sm text-slate-600">
                                <div className="p-2 bg-slate-50 rounded-lg mr-3 text-slate-400">
                                    <Mail className="w-4 h-4" />
                                </div>
                                <span className="truncate">{student.email || 'No email provided'}</span>
                            </li>
                            <li className="flex items-center text-sm text-slate-600">
                                <div className="p-2 bg-slate-50 rounded-lg mr-3 text-slate-400">
                                    <Phone className="w-4 h-4" />
                                </div>
                                <span className="truncate">{student.phone || 'No phone provided'}</span>
                            </li>
                        </ul>
                    </div>

                    <div className="bg-gradient-to-br from-slate-900 to-indigo-900 rounded-2xl shadow-lg p-6 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                        <h3 className="text-lg font-bold mb-2 relative z-10">Quick Actions</h3>
                        <div className="space-y-2 relative z-10">
                            <button className="w-full text-left px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                                <FileText className="w-4 h-4" /> Generate Report Card
                            </button>
                            <button
                                onClick={async () => {
                                    const newPass = prompt('Enter new password (min 6 chars):');
                                    if (!newPass || newPass.length < 6) {
                                        if (newPass) alert('Password must be at least 6 characters.');
                                        return;
                                    }
                                    try {
                                        const res = await apiClient(`/admin/users/${student.user_id}/reset-password`, {
                                            method: 'POST',
                                            body: JSON.stringify({ password: newPass })
                                        });
                                        if (res.ok) alert('Password reset successfully!');
                                        else throw new Error('Failed to reset password');
                                    } catch (err: any) {
                                        alert(err.message);
                                    }
                                }}
                                className="w-full text-left px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                            >
                                <Shield className="w-4 h-4" /> Reset Password
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {showAddGuardian && (
                <AddGuardianModal
                    studentId={id as string}
                    onClose={() => setShowAddGuardian(false)}
                    onSuccess={() => {
                        setShowAddGuardian(false);
                        fetchStudent();
                    }}
                />
            )}

            {editingGuardian && (
                <EditGuardianModal
                    studentId={id as string}
                    guardian={editingGuardian}
                    onClose={() => setEditingGuardian(null)}
                    onSuccess={() => {
                        setEditingGuardian(null);
                        fetchStudent();
                    }}
                />
            )}
        </div>
    );
}

function EditGuardianModal({ studentId, guardian, onClose, onSuccess }: { studentId: string, guardian: any, onClose: () => void, onSuccess: () => void }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        full_name: guardian.user?.full_name || '',
        relationship: guardian.pivot?.relationship || guardian.relationship || 'FATHER',
        email: guardian.user?.email || '',
        phone: guardian.user?.phone || '',
        is_primary: guardian.pivot?.is_primary || false,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const res = await apiClient(`/admin/students/${studentId}/guardians/${guardian.id}`, {
                method: 'PUT',
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                const data = await res.json();
                let msg = 'Failed to update guardian';
                if (data.error) {
                    msg = data.error.message || msg;
                    if (data.error.details) {
                        const firstError = Object.values(data.error.details)[0];
                        if (Array.isArray(firstError)) msg = firstError[0];
                    }
                } else if (data.message) {
                    msg = data.message;
                }
                throw new Error(msg);
            }

            onSuccess();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl relative animate-in zoom-in-95 duration-300 mx-4">
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <h2 className="text-2xl font-bold text-slate-900 mb-6">Edit Guardian</h2>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100 italic text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Full Name</label>
                        <input
                            required
                            type="text"
                            value={formData.full_name}
                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Relationship</label>
                        <select
                            value={formData.relationship}
                            onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                        >
                            <option value="FATHER">Father</option>
                            <option value="MOTHER">Mother</option>
                            <option value="GUARDIAN">Guardian</option>
                            <option value="OTHER">Other</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Phone</label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Email</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                        <input
                            type="checkbox"
                            id="edit_is_primary"
                            checked={formData.is_primary}
                            onChange={(e) => setFormData({ ...formData, is_primary: e.target.checked })}
                            className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                        />
                        <label htmlFor="edit_is_primary" className="text-sm font-bold text-slate-600 cursor-pointer">Set as Primary Guardian</label>
                    </div>

                    <div className="flex gap-3 pt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-5 py-3 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-5 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Updating...' : 'Update Guardian'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function AddGuardianModal({ studentId, onClose, onSuccess }: { studentId: string, onClose: () => void, onSuccess: () => void }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        full_name: '',
        relationship: 'FATHER',
        email: '',
        phone: '',
        password: '',
        is_primary: false,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const res = await apiClient(`/admin/students/${studentId}/add-guardian`, {
                method: 'POST',
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                const data = await res.json();
                let msg = 'Failed to add guardian';

                if (data.error) {
                    if (typeof data.error === 'string') {
                        msg = data.error;
                    } else {
                        msg = data.error.message || msg;
                        if (data.error.details) {
                            const firstError = Object.values(data.error.details)[0];
                            if (Array.isArray(firstError)) msg = firstError[0];
                        }
                    }
                } else if (data.message) {
                    msg = data.message;
                }
                throw new Error(msg);
            }

            onSuccess();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl relative animate-in zoom-in-95 duration-300 mx-4">
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <h2 className="text-2xl font-bold text-slate-900 mb-6">Add New Guardian</h2>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100 italic">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Full Name</label>
                        <input
                            required
                            type="text"
                            value={formData.full_name}
                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                            placeholder="Guardian's full name"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Relationship</label>
                        <select
                            value={formData.relationship}
                            onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                        >
                            <option value="FATHER">Father</option>
                            <option value="MOTHER">Mother</option>
                            <option value="GUARDIAN">Guardian</option>
                            <option value="OTHER">Other</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Phone</label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                placeholder="+1234..."
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Email</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                placeholder="Email address"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Login Password</label>
                        <input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono"
                            placeholder="Set login password"
                        />
                        <p className="mt-1 text-[10px] text-slate-400 font-medium ml-1">If empty, default is 'password123'</p>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                        <input
                            type="checkbox"
                            id="is_primary"
                            checked={formData.is_primary}
                            onChange={(e) => setFormData({ ...formData, is_primary: e.target.checked })}
                            className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                        />
                        <label htmlFor="is_primary" className="text-sm font-bold text-slate-600 cursor-pointer">Set as Primary Guardian</label>
                    </div>

                    <div className="flex gap-3 pt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-5 py-3 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-5 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Adding...' : 'Add Guardian'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
