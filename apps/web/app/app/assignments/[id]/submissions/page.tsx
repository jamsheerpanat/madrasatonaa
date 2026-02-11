
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { apiClient } from '../../../../../services/apiClient';
import { LoadingState } from '../../../../../components/LoadingState';

export default function SubmissionsPage() {
    const { id } = useParams();
    const [subs, setSubs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [gradingId, setGradingId] = useState<number | null>(null);
    const [gradeVal, setGradeVal] = useState('');

    useEffect(() => {
        apiClient(`/assignments/${id}/submissions`).then(r => r.json()).then(setSubs).finally(() => setLoading(false));
    }, [id]);

    const submitGrade = async (subId: number) => {
        await apiClient(`/submissions/${subId}/grade`, {
            method: 'POST',
            body: JSON.stringify({ grade_value: parseInt(gradeVal), feedback: 'Good' })
        });
        setGradingId(null);
        // Refresh
        apiClient(`/assignments/${id}/submissions`).then(r => r.json()).then(setSubs);
    };

    if (loading) return <LoadingState />;

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Submissions</h1>
            <div className="bg-white rounded shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted At</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {subs.map((s: any) => (
                            <tr key={s.id}>
                                <td className="px-6 py-4 text-sm font-medium text-gray-900">ID: {s.student_id}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">{new Date(s.submitted_at).toLocaleString()}</td>
                                <td className="px-6 py-4 text-sm">
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${s.status === 'GRADED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                        {s.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    {s.status === 'GRADED' ? s.grade_value : (
                                        gradingId === s.id ? (
                                            <div className="flex space-x-2">
                                                <input className="border w-16 p-1 rounded" value={gradeVal} onChange={e => setGradeVal(e.target.value)} type="number" />
                                                <button onClick={() => submitGrade(s.id)} className="text-blue-600 font-bold">Save</button>
                                            </div>
                                        ) : (
                                            <button onClick={() => { setGradingId(s.id); setGradeVal(''); }} className="text-indigo-600 hover:text-indigo-900">Grade</button>
                                        )
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
