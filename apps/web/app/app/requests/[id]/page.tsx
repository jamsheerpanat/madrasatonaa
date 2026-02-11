
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useMe } from '../../../../lib/useMe';
import { apiClient } from '../../../../services/apiClient';
import { LoadingState } from '../../../../components/LoadingState';

export default function RequestDetails() {
    const { id } = useParams();
    const { me } = useMe();
    const router = useRouter();
    const [ticket, setTicket] = useState<any>(null);
    const [reply, setReply] = useState('');

    const loadTicket = () => apiClient(`/tickets/${id}`).then(r => r.json()).then(setTicket);

    useEffect(() => { loadTicket(); }, [id]);

    const sendReply = async () => {
        if (!reply.trim()) return;
        await apiClient(`/tickets/${id}/reply`, {
            method: 'POST',
            body: JSON.stringify({ message: reply })
        });
        setReply('');
        loadTicket();
    };

    const changeStatus = async (status: string) => {
        if (!confirm(`Change status to ${status}?`)) return;
        await apiClient(`/tickets/${id}/status`, {
            method: 'POST',
            body: JSON.stringify({ status })
        });
        loadTicket();
    };

    if (!ticket) return <LoadingState />;

    const canResolve = Array.isArray(me?.permissions) && me.permissions.includes('tickets.resolve');

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white p-6 rounded shadow border-l-4 border-blue-500">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold">{ticket.subject}</h1>
                        <p className="text-sm text-gray-500">#{ticket.ticket_code} • {ticket.category.name_en}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded font-bold">{ticket.status}</span>
                        {canResolve && ticket.status !== 'CLOSED' && (
                            <div className="flex gap-1">
                                {ticket.status !== 'RESOLVED' && (
                                    <button onClick={() => changeStatus('RESOLVED')} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Mark Resolved</button>
                                )}
                                <button onClick={() => changeStatus('CLOSED')} className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">Close</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                {ticket.messages.map((msg: any) => (
                    <div key={msg.id} className={`flex ${msg.sender_user_id === me?.id ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-4 rounded-lg shadow-sm ${msg.sender_user_id === me?.id ? 'bg-blue-50 border border-blue-100' : 'bg-white border border-gray-200'
                            }`}>
                            <div className="text-xs text-gray-400 mb-1 flex justify-between gap-4">
                                <span className="font-bold text-gray-600">{msg.sender.first_name}</span>
                                <span>{new Date(msg.created_at).toLocaleString()}</span>
                            </div>
                            <p className="text-gray-800 whitespace-pre-wrap">{msg.message_text}</p>
                        </div>
                    </div>
                ))}
            </div>

            {ticket.status !== 'CLOSED' && (
                <div className="bg-white p-4 rounded shadow border sticky bottom-0">
                    <textarea
                        className="w-full border p-2 rounded h-24 mb-2"
                        placeholder="Write a reply..."
                        value={reply}
                        onChange={e => setReply(e.target.value)}
                    />
                    <div className="flex justify-end">
                        <button onClick={sendReply} className="px-6 py-2 bg-blue-600 text-white font-bold rounded">
                            Send Reply
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
