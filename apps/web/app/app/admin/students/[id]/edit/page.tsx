'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '../../../../../../services/apiClient';
import { LoadingState } from '../../../../../../components/LoadingState';
import { ErrorState } from '../../../../../../components/ErrorState';
import { ArrowLeft, Edit, Save, Trash2, Calendar, Shield, BookOpen, User } from 'lucide-react';

export default function EditStudentPage() {
    const { id } = useParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [student, setStudent] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    // Form states
    const [formData, setFormData] = useState({
        first_name_en: '',
        last_name_en: '',
        admission_number: '',
        dob: '',
        gender: '',
        blood_group: '',
        address: '',
        email: '',
        phone: '',
    });

    useEffect(() => {
        if (!id) return;

        const fetchStudent = async () => {
            try {
                const res = await apiClient(`/admin/students/${id}`);
                if (!res.ok) throw new Error('Failed to load student details');
                const data = await res.json();
                setStudent(data);

                // Pre-fill form
                setFormData({
                    first_name_en: data.first_name_en || '',
                    last_name_en: data.last_name_en || '',
                    admission_number: data.admission_number || '',
                    dob: data.dob ? new Date(data.dob).toISOString().split('T')[0] : '',
                    gender: data.gender === 'M' ? 'MALE' : (data.gender === 'F' ? 'FEMALE' : (data.gender || '')),
                    blood_group: data.blood_group || '',
                    address: data.address || '',
                    email: data.email || '',
                    phone: data.phone || '',
                });
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchStudent();
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            // Implement update endpoint in backend
            const res = await apiClient(`/admin/students/${id}`, {
                method: 'PUT',
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                const errorData = await res.json();
                const msg = errorData.error?.message || errorData.message || 'Failed to update student';
                const details = errorData.error?.details ? JSON.stringify(errorData.error.details) : '';
                throw new Error(`${msg} ${details}`);
            }

            // Success
            alert('Student profile updated successfully!');
            router.push(`/app/admin/students/${id}`);
        } catch (err: any) {
            alert(err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <LoadingState />;
    if (error) return <ErrorState message={error} title="Student Not Found" />;

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <button onClick={() => router.back()} className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 mb-2 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Cancel & Go Back
                    </button>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                        <div className="p-2 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-200">
                            <Edit className="w-8 h-8 text-white" />
                        </div>
                        Edit Student Profile
                    </h1>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Personal Info Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
                    <h3 className="text-lg font-bold text-slate-900 border-b border-slate-50 pb-4 mb-6 flex items-center gap-2">
                        <User className="w-5 h-5 text-indigo-500" />
                        Personal Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">First Name (English)</label>
                            <input
                                type="text"
                                required
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                value={formData.first_name_en}
                                onChange={e => setFormData({ ...formData, first_name_en: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Last Name (English)</label>
                            <input
                                type="text"
                                required
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                value={formData.last_name_en}
                                onChange={e => setFormData({ ...formData, last_name_en: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Admission Number</label>
                            <input
                                type="text"
                                required
                                className="w-full px-4 py-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
                                value={formData.admission_number}
                                readOnly
                            />
                            <p className="text-xs text-slate-400">Unique identifier cannot be changed.</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Date of Birth</label>
                            <input
                                type="date"
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                value={formData.dob}
                                onChange={e => setFormData({ ...formData, dob: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Gender</label>
                            <select
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                value={formData.gender}
                                onChange={e => setFormData({ ...formData, gender: e.target.value })}
                            >
                                <option value="">Select Gender</option>
                                <option value="MALE">Male</option>
                                <option value="FEMALE">Female</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Blood Group</label>
                            <select
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                value={formData.blood_group}
                                onChange={e => setFormData({ ...formData, blood_group: e.target.value })}
                            >
                                <option value="">Select Group</option>
                                <option value="A+">A+</option>
                                <option value="A-">A-</option>
                                <option value="B+">B+</option>
                                <option value="B-">B-</option>
                                <option value="O+">O+</option>
                                <option value="O-">O-</option>
                                <option value="AB+">AB+</option>
                                <option value="AB-">AB-</option>
                            </select>
                        </div>
                    </div>

                    <div className="mt-6 space-y-2">
                        <label className="text-sm font-bold text-slate-700">Address</label>
                        <textarea
                            rows={3}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                            value={formData.address}
                            onChange={e => setFormData({ ...formData, address: e.target.value })}
                        />
                    </div>
                </div>

                {/* Contact Info (Linked User) */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
                    <h3 className="text-lg font-bold text-slate-900 border-b border-slate-50 pb-4 mb-6 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-indigo-500" />
                        Account & Contact
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Email Address</label>
                            <input
                                type="email"
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Phone Number</label>
                            <input
                                type="tel"
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-4 pt-4 border-t border-slate-200">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-6 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-8 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {saving ? (
                            <>Saving...</>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
