
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '../../../../../services/apiClient';
import { LoadingState } from '../../../../../components/LoadingState';
import { ErrorState } from '../../../../../components/ErrorState';
import {
    ArrowLeft, Save, GraduationCap, Link2,
    User, Calendar, MapPin, Mail, Phone, HeartPulse, Shield
} from 'lucide-react';

export default function NewStudentPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [sections, setSections] = useState<any[]>([]);
    const [structure, setStructure] = useState<any>(null);
    const [form, setForm] = useState({
        student_code: '',
        full_name: '',
        section_id: '',
        academic_year_id: '',
        gender: 'MALE',
        dob: '',
        address: '',
        blood_group: '',
        email: '',
        phone: '',
    });

    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                const res = await apiClient('/structure');
                if (res.ok) {
                    const data = await res.json();
                    setStructure(data);
                    // Smart default: Current Year
                    if (data.current_academic_year) {
                        setForm(f => ({ ...f, academic_year_id: data.current_academic_year.id.toString() }));
                    } else if (data.school_settings?.current_academic_year_id) {
                        setForm(f => ({ ...f, academic_year_id: data.school_settings.current_academic_year_id.toString() }));
                    }
                }

                const secRes = await apiClient('/sections');
                if (secRes.ok) {
                    const secData = await secRes.json();
                    setSections(secData);
                }
            } catch (e) {
                console.error(e);
            }
        };
        fetchMetadata();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Validation
            if (!form.academic_year_id) {
                throw new Error("Academic Year is required. Please check system configuration.");
            }

            const res = await apiClient('/admin/students', {
                method: 'POST',
                body: JSON.stringify({
                    ...form,
                    academic_year_id: parseInt(form.academic_year_id),
                    section_id: parseInt(form.section_id)
                })
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || errorData.error?.message || 'Failed to create student');
            }

            // Success animation or toast could go here
            router.push('/app/admin/students');
        } catch (e: any) {
            alert(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <button onClick={() => router.back()} className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 mb-4 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Back to Directory
                </button>
                <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg shadow-blue-200">
                        <GraduationCap className="w-8 h-8 text-white" />
                    </div>
                    New Student Enrollment
                </h1>
                <p className="text-slate-500 mt-2 ml-14">Register a new student, assign class, and setup initial profile.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 pb-20">

                {/* Core Identification */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex items-center">
                        <User className="w-5 h-5 text-indigo-600 mr-2" />
                        <h3 className="font-bold text-slate-800">Student Identity</h3>
                    </div>
                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Legal Name</label>
                            <input
                                required
                                type="text"
                                placeholder="e.g. Ahmed Ali"
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
                                value={form.full_name}
                                onChange={e => setForm({ ...form, full_name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Student ID / Code</label>
                            <input
                                required
                                type="text"
                                placeholder="e.g. 2024-001"
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all uppercase"
                                value={form.student_code}
                                onChange={e => setForm({ ...form, student_code: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gender</label>
                            <div className="grid grid-cols-2 gap-4">
                                <label className={`flex items-center justify-center p-3 rounded-xl border cursor-pointer transition-all ${form.gender === 'MALE' ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                                    <input type="radio" name="gender" value="MALE" className="hidden" checked={form.gender === 'MALE'} onChange={() => setForm({ ...form, gender: 'MALE' })} />
                                    Male
                                </label>
                                <label className={`flex items-center justify-center p-3 rounded-xl border cursor-pointer transition-all ${form.gender === 'FEMALE' ? 'bg-pink-50 border-pink-500 text-pink-700 font-bold' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                                    <input type="radio" name="gender" value="FEMALE" className="hidden" checked={form.gender === 'FEMALE'} onChange={() => setForm({ ...form, gender: 'FEMALE' })} />
                                    Female
                                </label>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Date of Birth</label>
                            <input
                                required
                                type="date"
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
                                value={form.dob}
                                onChange={e => setForm({ ...form, dob: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                {/* Contact & Personal Details */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex items-center">
                        <MapPin className="w-5 h-5 text-emerald-600 mr-2" />
                        <h3 className="font-bold text-slate-800">Personal Details</h3>
                    </div>
                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Residential Address</label>
                            <textarea
                                rows={2}
                                placeholder="Full address..."
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all resize-none"
                                value={form.address}
                                onChange={e => setForm({ ...form, address: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email (Optional)</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="email"
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all"
                                    value={form.email}
                                    onChange={e => setForm({ ...form, email: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Blood Group</label>
                            <div className="relative">
                                <HeartPulse className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="e.g. O+"
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all uppercase"
                                    value={form.blood_group}
                                    onChange={e => setForm({ ...form, blood_group: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Academic Placement */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex items-center">
                        <Link2 className="w-5 h-5 text-amber-600 mr-2" />
                        <h3 className="font-bold text-slate-800">Academic Placement</h3>
                    </div>
                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Academic Year</label>
                            <select
                                required
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:ring-2 focus:ring-amber-500 focus:bg-white outline-none transition-all appearance-none cursor-pointer"
                                value={form.academic_year_id}
                                onChange={e => setForm({ ...form, academic_year_id: e.target.value })}
                            >
                                <option value="">Select Year</option>
                                {structure?.branches?.map((b: any) => (
                                    <optgroup key={b.id} label={b.name}>
                                        <option value={structure.current_academic_year?.id}>{structure.current_academic_year?.name} (Current)</option>
                                    </optgroup>
                                ))}
                                {!structure && <option disabled>Loading...</option>}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Class / Section</label>
                            <select
                                required
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:ring-2 focus:ring-amber-500 focus:bg-white outline-none transition-all appearance-none cursor-pointer"
                                value={form.section_id}
                                onChange={e => setForm({ ...form, section_id: e.target.value })}
                            >
                                <option value="">Select Section</option>
                                {sections.map(s => (
                                    <option key={s.id} value={s.id}>{s.grade.name} - {s.name}</option>
                                ))}
                            </select>
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
                        {loading ? 'Processing...' : <>
                            <Save className="w-5 h-5" />
                            Enroll Student
                        </>}
                    </button>
                </div>
            </form>
        </div>
    );
}
