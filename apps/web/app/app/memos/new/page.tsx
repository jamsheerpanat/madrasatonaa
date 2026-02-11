
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '../../../../services/apiClient';

export default function CreateMemo() {
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);

    const [form, setForm] = useState({
        title_en: '',
        title_ar: '',
        body_en: '',
        body_ar: '',
        audience: [] as string[],
        branch_id: '',
        ack_required: true
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = {
                ...form,
                scope_json: {
                    audience: form.audience,
                    branch_ids: form.branch_id ? [parseInt(form.branch_id)] : []
                },
                publish_at: new Date().toISOString()
            };

            await apiClient('/broadcasts/memos', {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            alert("Memo Published!");
            router.push('/app/memos');
        } catch (e) {
            alert("Error");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6 bg-white p-8 rounded shadow">
            <h1 className="text-2xl font-bold text-purple-700">Create Compliance Memo</h1>
            <p className="text-sm text-gray-500">Memos require explicit acknowledgement from recipients.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium">Title (EN)</label>
                    <input className="w-full border p-2 rounded" required
                        value={form.title_en} onChange={e => setForm({ ...form, title_en: e.target.value })} />
                </div>
                <div>
                    <label className="block text-sm font-medium">Body (EN)</label>
                    <textarea className="w-full border p-2 rounded h-24" required
                        value={form.body_en} onChange={e => setForm({ ...form, body_en: e.target.value })} />
                </div>

                <div>
                    <label className="block text-sm font-medium">Target Audience</label>
                    <div className="flex space-x-4 mt-2">
                        {['PARENT', 'STAFF'].map(type => (
                            <label key={type} className="flex items-center space-x-2">
                                <input type="checkbox"
                                    checked={form.audience.includes(type)}
                                    onChange={e => {
                                        if (e.target.checked) setForm({ ...form, audience: [...form.audience, type] });
                                        else setForm({ ...form, audience: form.audience.filter(x => x !== type) });
                                    }}
                                />
                                <span>{type}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium">Target Branch ID (Optional)</label>
                    <input className="w-full border p-2 rounded" type="number"
                        value={form.branch_id} onChange={e => setForm({ ...form, branch_id: e.target.value })} />
                </div>

                <button
                    disabled={submitting || form.audience.length === 0}
                    className="w-full py-3 bg-purple-600 text-white rounded font-bold hover:bg-purple-700 disabled:bg-gray-400"
                >
                    {submitting ? 'Publishing...' : 'Publish Memo'}
                </button>
            </form>
        </div>
    );
}
