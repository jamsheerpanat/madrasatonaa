
import { formatDistanceToNow, parseISO, format } from 'date-fns';
import {
    User, Users, Building, Layers,
    BookOpen, Calendar, AlertCircle, CheckCircle,
    Clock, FileText, Bell, PenTool, LayoutGrid, ArrowRight
} from 'lucide-react';

interface TimelinePayload {
    [key: string]: any;
}

interface TimelineEvent {
    id: number;
    title_en: string;
    body_en?: string;
    event_type: string;
    created_at: string;
    visibility_scope: string;
    payload_json?: TimelinePayload; // Changed from payload
    actor?: { full_name: string };
    branch?: { name: string };
    section?: { name: string };
    student?: { full_name: string };
}

export function TimelineCard({ event, actions }: { event: TimelineEvent; actions?: React.ReactNode }) {

    // 1. Determine Style & Icon based on Type
    const getTypeConfig = (type: string) => {
        switch (type) {
            case 'AttendanceIncident':
                const isAbsent = event.payload_json?.status === 'ABSENT' || event.body_en?.includes('ABSENT');
                return {
                    icon: isAbsent ? <AlertCircle className="w-5 h-5 text-red-600" /> : <CheckCircle className="w-5 h-5 text-green-600" />,
                    bg: isAbsent ? 'bg-red-50' : 'bg-green-50',
                    border: isAbsent ? 'border-l-4 border-l-red-500' : 'border-l-4 border-l-green-500',
                    badge: isAbsent ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                };
            case 'AttendanceSubmitted':
                return {
                    icon: <CheckCircle className="w-5 h-5 text-blue-600" />,
                    bg: 'bg-blue-50',
                    border: 'border-l-4 border-l-blue-500',
                    badge: 'bg-blue-100 text-blue-700'
                };
            case 'AssignmentPosted':
                return {
                    icon: <BookOpen className="w-5 h-5 text-indigo-600" />,
                    bg: 'bg-indigo-50',
                    border: 'border-l-4 border-l-indigo-500',
                    badge: 'bg-indigo-100 text-indigo-700'
                };
            case 'ExamScheduled':
                return {
                    icon: <PenTool className="w-5 h-5 text-purple-600" />,
                    bg: 'bg-purple-50',
                    border: 'border-l-4 border-l-purple-500',
                    badge: 'bg-purple-100 text-purple-700'
                };
            case 'TimetableUpdated':
                return {
                    icon: <LayoutGrid className="w-5 h-5 text-teal-600" />,
                    bg: 'bg-teal-50',
                    border: 'border-l-4 border-l-teal-500',
                    badge: 'bg-teal-100 text-teal-700'
                };
            case 'AnnouncementPublished':
                return {
                    icon: <Bell className="w-5 h-5 text-amber-600" />,
                    bg: 'bg-amber-50',
                    border: 'border-l-4 border-l-amber-500',
                    badge: 'bg-amber-100 text-amber-700'
                };
            case 'MemoPublished':
                return {
                    icon: <FileText className="w-5 h-5 text-orange-600" />,
                    bg: 'bg-orange-50',
                    border: 'border-l-4 border-l-orange-500',
                    badge: 'bg-orange-100 text-orange-700'
                };
            default:
                return {
                    icon: <Layers className="w-5 h-5 text-slate-500" />,
                    bg: 'bg-slate-50',
                    border: 'border-l-4 border-l-slate-300',
                    badge: 'bg-slate-100 text-slate-700'
                };
        }
    };

    const config = getTypeConfig(event.event_type);

    const timeAgo = formatDistanceToNow(parseISO(event.created_at), { addSuffix: true });

    return (
        <div className={`relative bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all duration-200 group ${config.border}`}>
            <div className="p-5">
                <div className="flex items-start gap-4">
                    {/* Icon Circle */}
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${config.bg}`}>
                        {config.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded textxs font-medium ${config.badge}`}>
                                {event.event_type.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                            <span className="text-xs text-slate-400 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {timeAgo}
                            </span>
                        </div>

                        <h3 className="text-lg font-bold text-slate-900 leading-tight mb-1">
                            {event.title_en}
                        </h3>

                        {event.body_en && (
                            <p className="text-slate-600 text-sm leading-relaxed mb-3">
                                {event.body_en}
                            </p>
                        )}

                        {/* Metadata Grid */}
                        <div className="flex flex-wrap gap-2 mt-3">
                            {event.payload_json?.date && (
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-100 text-xs font-medium text-slate-600">
                                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                    <span>Date: {event.payload_json.date}</span>
                                </div>
                            )}
                            {event.payload_json?.due_at && (
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-50 border border-red-100 text-xs font-medium text-red-600">
                                    <AlertCircle className="w-3.5 h-3.5" />
                                    <span>Due: {format(parseISO(event.payload_json.due_at), 'PPP')}</span>
                                </div>
                            )}
                            {event.actor && (
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-100 text-xs font-medium text-slate-600">
                                    <User className="w-3.5 h-3.5 text-slate-400" />
                                    <span>By: {event.actor.full_name}</span>
                                </div>
                            )}
                            {event.branch && (
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-100 text-xs font-medium text-slate-600">
                                    <Building className="w-3.5 h-3.5 text-slate-400" />
                                    <span>{event.branch.name}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Action Footer */}
            {(['AssignmentPosted', 'ExamScheduled', 'TimetableUpdated'].includes(event.event_type) || actions) && (
                <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex justify-end items-center gap-3">
                    {actions}

                    {/* Default Actions if no custom actions provided */}
                    {!actions && ['AssignmentPosted', 'ExamScheduled', 'TimetableUpdated'].includes(event.event_type) && (
                        <button className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline flex items-center gap-1">
                            View Details <ArrowRight className="w-3 h-3" />
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
