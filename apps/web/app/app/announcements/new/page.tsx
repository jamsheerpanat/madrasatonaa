
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '../../../../services/apiClient';

export default function CreateAnnouncement() {
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);

    // MVP Form
    const [form, setForm] = useState({
        title_en: '',
        title_ar: '',
        body_en: '',
        body_ar: '',
        audience: [] as string[],
        branch_id: '', // Target Primary Branch Context
        publish_now: true,
        publish_at: ''
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
                    // MVP: Teacher assumes their branch or simple input
                    // Advanced: Helper to select branch
                },
                publish_at: form.publish_now ? new Date().toISOString() : form.publish_at
            };

            await apiClient('/broadcasts/announcements', {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            alert("Published!");
            router.push('/app/announcements');
        } catch (e) {
            alert("Error");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6 bg-white p-8 rounded shadow">
            <h1 className="text-2xl font-bold">Create Announcement</h1>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium">Title (EN)</label>
                    <input className="w-full border p-2 rounded" required
                        value={form.title_en} onChange={e => setForm({ ...form, title_en: e.target.value })} />
                </div>
                <div>
                    <label className="block text-sm font-medium">Title (AR)</label>
                    <input className="w-full border p-2 rounded text-right" dir="rtl"
                        value={form.title_ar} onChange={e => setForm({ ...form, title_ar: e.target.value })} />
                </div>
                <div>
                    <label className="block text-sm font-medium">Body (EN)</label>
                    <textarea className="w-full border p-2 rounded h-24" required
                        value={form.body_en} onChange={e => setForm({ ...form, body_en: e.target.value })} />
                </div>

                <div>
                    <label className="block text-sm font-medium">Target Audience</label>
                    <div className="flex space-x-4 mt-2">
                        {['STUDENT', 'PARENT', 'STAFF'].map(type => (
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
                    <label className="block text-sm font-medium">Target Branch ID (Optional/MVP)</label>
                    <input className="w-full border p-2 rounded" type="number" placeholder="Leave empty for Global"
                        value={form.branch_id} onChange={e => setForm({ ...form, branch_id: e.target.value })} />
                </div>

                <button
                    disabled={submitting || form.audience.length === 0}
                    className="w-full py-3 bg-blue-600 text-white rounded font-bold hover:bg-blue-700 disabled:bg-gray-400"
                >
                    {submitting ? 'Publishing...' : 'Publish Announcement'}
                </button>
            </form>
        </div>
    );
}
