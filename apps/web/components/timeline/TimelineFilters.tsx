
import { useState, useEffect } from 'react';
import { useMe } from '../../lib/useMe';
import { apiClient } from '../../services/apiClient';

interface Props {
    filters: any;
    onChange: (filters: any) => void;
}

export function TimelineFilters({ filters, onChange }: Props) {
    const { me } = useMe();
    const [children, setChildren] = useState<any[]>([]);

    const isParent = me?.user.user_type === 'PARENT';
    const isStaff = me?.user.user_type === 'STAFF';

    // Fetch children if parent
    useEffect(() => {
        if (isParent) {
            apiClient('/parent/children').then(async res => {
                if (res.ok) setChildren(await res.json());
            });
        }
    }, [isParent]);

    const handleChange = (key: string, value: any) => {
        onChange({ ...filters, [key]: value === 'all' ? undefined : value });
    };

    return (
        <div className="flex flex-wrap gap-4 mb-6 bg-white p-3 border rounded-lg shadow-sm">
            {/* Event Type */}
            <select
                className="px-3 py-2 border rounded-md text-sm bg-white"
                value={filters.event_type || 'all'}
                onChange={(e) => handleChange('event_type', e.target.value)}
            >
                <option value="all">All Event Types</option>
                <option value="AttendanceIncident">Attendance (Individual)</option>
                <option value="AttendanceSubmitted">Attendance (Submitted)</option>
                <option value="AssignmentPosted">Assignment</option>
                <option value="ExamScheduled">Exam</option>
                <option value="TimetableUpdated">Timetable</option>
                <option value="Announcement">Announcement</option>
            </select>

            {/* Branch Scope (Staff) */}
            {isStaff && me.branch_scope_ids && me.branch_scope_ids.length > 0 && (
                <select
                    className="px-3 py-2 border rounded-md text-sm bg-white"
                    value={filters.branch_id || 'all'}
                    onChange={(e) => handleChange('branch_id', e.target.value)}
                >
                    <option value="all">All Branches</option>
                    {me.roles.map((r: any, idx: number) =>
                        r.branch_id ? <option key={`branch-${r.branch_id}-${idx}`} value={r.branch_id}>Branch {r.branch_id}</option> : null
                    )}
                    {/* Better: we should fetch branch names, but for MVP branch_id is mostly hidden context or just ID */}
                </select>
            )}

            {/* Child Filter (Parent) */}
            {isParent && children.length > 0 && (
                <select
                    className="px-3 py-2 border rounded-md text-sm bg-white"
                    value={filters.child_student_id || 'all'}
                    onChange={(e) => handleChange('child_student_id', e.target.value)}
                >
                    <option value="all">All Children</option>
                    {children.map(child => (
                        <option key={child.id} value={child.id}>{child.full_name}</option>
                    ))}
                </select>
            )}
        </div>
    );
}
