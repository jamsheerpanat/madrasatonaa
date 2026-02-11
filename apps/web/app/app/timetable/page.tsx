
'use client';

import { useState, useEffect } from 'react';
import { useMe } from '../../../lib/useMe';
import { useBranchScope } from '../../../lib/useBranchScope';
import { apiClient } from '../../../services/apiClient';
import { TimetableGrid } from '../../../components/timetable/TimetableGrid';
import { LoadingState } from '../../../components/LoadingState';
import { ErrorState } from '../../../components/ErrorState';
import { EmptyState } from '../../../components/EmptyState';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function TimetablePage() {
    const { me, loading: meLoading } = useMe();
    const [loading, setLoading] = useState(true);
    const [entries, setEntries] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);

    // For parents with multiple children
    const [children, setChildren] = useState<any[]>([]);
    const [selectedChildId, setSelectedChildId] = useState<string | null>(null);

    // For Staff (Teachers vs Admins)
    // Teacher -> /timetable/teacher/me
    // Admin -> Redirect to /timetable/manage or show current section picker?
    // For V1 MVP, Admin viewing without managing: redirect to manage page?
    // Or show "Select Section" here.

    useEffect(() => {
        if (meLoading) return;
        if (!me) return;

        const fetchTimetable = async () => {
            setLoading(true);
            setError(null);
            try {
                if (me.user.user_type === 'STAFF') {
                    // Logic for STAFF (Teachers/Admins)...
                    if (me.permissions.includes('timetable.view')) {
                        const res = await apiClient('/timetable/teacher/me');
                        if (res.ok) {
                            setEntries(await res.json());
                        }
                    }
                } else if (me.user.user_type === 'STUDENT') {
                    // Logic for STUDENT
                    const student = me.student;
                    const enrollment = student?.enrollments?.[0];
                    const sectionId = enrollment?.section_id;

                    if (sectionId) {
                        const res = await apiClient(`/timetable/section/${sectionId}`);
                        if (res.ok) {
                            setEntries(await res.json());
                        } else {
                            throw new Error('Failed to fetch student timetable');
                        }
                    } else {
                        setLoading(false);
                    }
                } else if (me.user.user_type === 'PARENT') {
                    // Logic for PARENT...
                    const childrenRes = await apiClient('/parent/children');
                    if (!childrenRes.ok) throw new Error('Failed to fetch children');
                    const childrenData = await childrenRes.json();
                    setChildren(childrenData);

                    if (childrenData.length > 0) {
                        setSelectedChildId(childrenData[0].id);
                    } else {
                        setLoading(false);
                    }
                }
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchTimetable();
    }, [me, meLoading]);

    // Fetch specific child timetable when selected
    useEffect(() => {
        if (!selectedChildId) return;

        const fetchChildTimetable = async () => {
            setLoading(true);
            try {
                const res = await apiClient(`/timetable/parent/child/${selectedChildId}`);
                if (!res.ok) throw new Error('Failed to fetch child timetable');
                setEntries(await res.json());
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchChildTimetable();
    }, [selectedChildId]);

    if (meLoading) return <LoadingState />;
    if (error) return <ErrorState message={error} />;

    if (me?.user.user_type === 'PARENT' && children.length === 0) {
        return <EmptyState title="No students found" description="You don't have any students linked to your account." />;
    }

    const isManager = me?.permissions?.includes('timetable.manage') || me?.roles?.some((r: any) => r.name === 'Administrator');

    console.log('Permissions:', me?.permissions);

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">
                    {me?.user.user_type === 'STAFF' ? 'My Timetable' : 'Student Timetable'}
                </h1>
                {isManager && (
                    <Link href="/app/timetable/manage" className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded hover:bg-indigo-700">
                        Manage Timetables
                    </Link>
                )}
            </div>

            {me?.user.user_type === 'PARENT' && children.length > 1 && (
                <div className="flex space-x-2">
                    {children.map(child => (
                        <button
                            key={child.id}
                            onClick={() => setSelectedChildId(child.id)}
                            className={`px-4 py-2 rounded-full text-sm font-medium ${selectedChildId === child.id
                                ? 'bg-blue-600 text-white'
                                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            {child.full_name}
                        </button>
                    ))}
                </div>
            )}

            {(entries.length === 0 && !loading) ? (
                <EmptyState title="No timetable configured" description="No schedule entries found for this context." />
            ) : (
                <TimetableGrid entries={entries} loading={loading} />
            )}
        </div>
    );
}
