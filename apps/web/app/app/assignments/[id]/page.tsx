
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useMe } from '../../../../lib/useMe';
import { apiClient } from '../../../../services/apiClient';
import { LoadingState } from '../../../../components/LoadingState';

export default function AssignmentDetails() {
    const { id } = useParams();
    const { me } = useMe();
    const router = useRouter();
    const [details, setDetails] = useState<any>(null);
    const [mySubmission, setMySubmission] = useState<any>(null); // For Parent
    const [submitText, setSubmitText] = useState('');

    useEffect(() => {
        // Load Details
        apiClient(`/assignments/${id}`).then(r => r.json()).then(setDetails);
        // If Parent, check submissions or submissions logic
        // For now, load details only. 
        // We lack "getMySubmission" endpoint explicitly, but can infer or add one.
        // Or if parent, we might fetch detail.
    }, [id]);

    const submitWork = async () => {
        // We need student_id.
        // For MVP, fetch children first or simplistic assumption?
        // Let's ask user to pick child ID if Parent? Or auto-detect.
        const childId = prompt("Enter Student ID to submit for:");
        if (!childId) return;

        try {
            await apiClient(`/assignments/${id}/submit`, {
                method: 'POST',
                body: JSON.stringify({
                    student_id: parseInt(childId),
                    submission_text: submitText
                })
            });
            alert("Submitted!");
            router.refresh();
        } catch (e) { alert("Error"); }
    };

    if (!details) return <LoadingState />;

    const isTeacher = me?.user_type === 'STAFF';

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white p-6 rounded shadow border">
                <div className="flex justify-between items-start">
                    <h1 className="text-3xl font-bold">{details.title_en}</h1>
                    {isTeacher && (
                        <button
                            onClick={() => router.push(`/app/assignments/${id}/submissions`)}
                            className="px-4 py-2 bg-indigo-600 text-white rounded font-medium"
                        >
                            View Submissions
                        </button>
                    )}
                </div>
                <div className="mt-4 prose">
                    <p>{details.instructions_en}</p>
                </div>
                {details.due_at && <div className="mt-4 text-red-600 font-bold">Due: {new Date(details.due_at).toLocaleString()}</div>}
            </div>

            {me?.user_type === 'PARENT' && (
                <div className="bg-white p-6 rounded shadow border">
                    <h2 className="text-xl font-bold mb-4">Submit Work</h2>
                    <textarea
                        className="w-full border p-2 rounded h-32"
                        placeholder="Type answer or paste link..."
                        value={submitText}
                        onChange={e => setSubmitText(e.target.value)}
                    />
                    <button onClick={submitWork} className="mt-4 px-6 py-2 bg-green-600 text-white rounded font-bold">
                        Submit
                    </button>
                    <p className="text-xs text-gray-500 mt-2">Enter your Child's Student ID when prompted (MVP).</p>
                </div>
            )}
        </div>
    );
}
