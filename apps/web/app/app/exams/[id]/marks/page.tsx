
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '../../../../../services/apiClient';
import { LoadingState } from '../../../../../components/LoadingState';

export default function ExamMarks() {
    const { id } = useParams();
    const router = useRouter();
    const [exam, setExam] = useState<any>(null);
    const [students, setStudents] = useState<any[]>([]); // We need student list from section
    const [marks, setMarks] = useState<Record<number, { grade: string, remarks: string }>>({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        // Fetch Exam
        apiClient(`/exams/${id}`).then(r => r.json()).then(ex => {
            setExam(ex);
            // Fetch Students in Section
            // TODO: Ideally 'GET /sections/{id}/students' or similiar.
            // For MVP, we presume existing marks or empty.
            // Let's use a mocked or fetched list from 'enrollments' or similar endpoint.
            // 'GET /admin/users...' filtered? too broad.
            // Let's assume the EXAM endpoint returns marks which include STUDENT info if eager loaded.
            // But we need ALL students even if no mark.

            // Hack for MVP: Just use what we have or generic placeholder logic.
            // Better: 'GET /attendance/section/{id}/day' usually returns students list for attendance.
            // Let's reuse that or build a specific one.
            // Let's try fetching '/attendance/section/{ex.section_id}/day' (without date creates new? no 'GET .../day' gets today's)
            // Or just assume marks already has students if previously populated. 
            // If new exam, we need students.
            // Assume we have an endpoint '/sections/{id}/students'. WE DO NOT YET.
            // Fallback: Just let user enter Student ID manually or show existing marks.

            // Wait, look at 'GET /attendance/section/{sectionId}/day' in logs. It calls `AttendanceDay::firstOrCreate`. 
            // And returns entries. Entries have students.
            // Valid workaround for MVP: Call attendance today endpoint to get student list.
            apiClient(`/attendance/section/${ex.section_id}/day`).then(r => r.json()).then(att => {
                const st = att.entries.map((e: any) => e.student);
                setStudents(st);

                // Pre-fill marks
                const initial: any = {};
                ex.marks?.forEach((m: any) => {
                    initial[m.student_id] = { grade: m.grade_letter, remarks: m.remarks || '' };
                });
                setMarks(initial);
            });
        });
    }, [id]);

    const handleSave = async () => {
        setSaving(true);
        const payload = Object.keys(marks).map(sid => ({
            student_id: parseInt(sid),
            grade_letter: marks[parseInt(sid)].grade,
            remarks: marks[parseInt(sid)].remarks
        }));

        try {
            await apiClient(`/exams/${id}/marks`, {
                method: 'PUT',
                body: JSON.stringify({ marks: payload })
            });
            alert("Saved!");
            router.back();
        } catch (e) { alert("Error"); }
        finally { setSaving(false); }
    };

    if (!exam || students.length === 0) return <LoadingState />;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Marks Entry: {exam.exam_type}</h1>
                <button disabled={saving} onClick={handleSave} className="bg-green-600 text-white px-6 py-2 rounded font-bold">
                    {saving ? 'Saving...' : 'Save All Marks'}
                </button>
            </div>

            <div className="bg-white shadow rounded overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Remarks</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {students.map(student => {
                            const m = marks[student.id] || { grade: '', remarks: '' };
                            return (
                                <tr key={student.id}>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{student.full_name} ({student.student_code})</td>
                                    <td className="px-6 py-4">
                                        <select
                                            className="border rounded p-1"
                                            value={m.grade}
                                            onChange={e => setMarks(prev => ({ ...prev, [student.id]: { ...m, grade: e.target.value } }))}
                                        >
                                            <option value="">-</option>
                                            {['A+', 'A', 'B+', 'B', 'C', 'D', 'F'].map(g => <option key={g}>{g}</option>)}
                                        </select>
                                    </td>
                                    <td className="px-6 py-4">
                                        <input
                                            className="border rounded p-1 w-full"
                                            value={m.remarks}
                                            onChange={e => setMarks(prev => ({ ...prev, [student.id]: { ...m, remarks: e.target.value } }))}
                                        />
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
