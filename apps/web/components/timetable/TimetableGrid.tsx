
import { Clock } from 'lucide-react';

interface TimetableEntry {
    id?: number;
    day_of_week: string;
    period_no: number;
    subject?: { id: number; name_en: string };
    teacher?: { id: number; full_name: string };
    room_name?: string;
}

interface TimetableGridProps {
    entries: TimetableEntry[];
    periodsPerDay?: number;
    editable?: boolean;
    onCellClick?: (day: string, period: number, currentEntry?: TimetableEntry) => void;
    loading?: boolean;
}

const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

export function TimetableGrid({
    entries,
    periodsPerDay = 8,
    editable = false,
    onCellClick,
    loading = false
}: TimetableGridProps) {

    const getEntry = (day: string, period: number) => {
        return entries.find(e => e.day_of_week === day && e.period_no === period);
    };

    // Auto-color generator based on subject name
    const getColor = (str: string) => {
        const colors = [
            'bg-red-50 text-red-900 border-red-100',
            'bg-orange-50 text-orange-900 border-orange-100',
            'bg-amber-50 text-amber-900 border-amber-100',
            'bg-yellow-50 text-yellow-900 border-yellow-100',
            'bg-lime-50 text-lime-900 border-lime-100',
            'bg-green-50 text-green-900 border-green-100',
            'bg-emerald-50 text-emerald-900 border-emerald-100',
            'bg-teal-50 text-teal-900 border-teal-100',
            'bg-cyan-50 text-cyan-900 border-cyan-100',
            'bg-sky-50 text-sky-900 border-sky-100',
            'bg-blue-50 text-blue-900 border-blue-100',
            'bg-indigo-50 text-indigo-900 border-indigo-100',
            'bg-violet-50 text-violet-900 border-violet-100',
            'bg-purple-50 text-purple-900 border-purple-100',
            'bg-fuchsia-50 text-fuchsia-900 border-fuchsia-100',
            'bg-pink-50 text-pink-900 border-pink-100',
            'bg-rose-50 text-rose-900 border-rose-100',
        ];
        let hash = 0;
        for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
        return colors[Math.abs(hash) % colors.length];
    };

    return (
        <div className="overflow-x-auto border rounded-xl border-slate-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                    <tr>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider sticky left-0 bg-slate-50 z-20 w-24 border-r border-slate-200 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.05)]">
                            Day
                        </th>
                        {Array.from({ length: periodsPerDay }).map((_, i) => (
                            <th key={i} className="px-4 py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider min-w-[140px] border-l border-slate-100">
                                Period {i + 1}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100/50">
                    {DAYS.map(day => (
                        <tr key={day} className="hover:bg-slate-50/30 transition-colors">
                            <td className="px-4 py-4 whitespace-nowrap text-xs font-black text-slate-400 uppercase bg-slate-50/80 backdrop-blur sticky left-0 z-10 border-r border-slate-200 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.05)]">
                                {day}
                            </td>
                            {Array.from({ length: periodsPerDay }).map((_, i) => {
                                const period = i + 1;
                                const entry = getEntry(day, period);
                                const colorClass = entry?.subject?.name_en ? getColor(entry.subject.name_en) : 'bg-slate-50 border-slate-100';

                                return (
                                    <td
                                        key={period}
                                        onClick={() => editable && onCellClick && onCellClick(day, period, entry)}
                                        className={`px-1 py-1 text-center relative h-24 align-top transition-all duration-200 
                                            ${editable ? 'cursor-pointer hover:bg-slate-100/50 active:scale-[0.98]' : ''}`}
                                    >
                                        {entry ? (
                                            <div className={`flex flex-col items-center justify-between p-2 rounded-lg border h-full w-full shadow-sm ${colorClass} transition-transform hover:-translate-y-0.5`}>
                                                <div className="w-full">
                                                    <span className="block font-bold text-sm leading-tight truncate px-1">
                                                        {entry.subject?.name_en || 'Unknown'}
                                                    </span>
                                                    {entry.teacher && (
                                                        <span className="block text-[10px] opacity-80 mt-1 truncate px-1 font-medium">
                                                            {entry.teacher.full_name}
                                                        </span>
                                                    )}
                                                </div>

                                                {entry.room_name && (
                                                    <div className="flex items-center gap-1 mt-1 text-[10px] opacity-60 bg-white/30 px-1.5 py-0.5 rounded-full">
                                                        <Clock className="w-2.5 h-2.5" />
                                                        <span className="truncate max-w-[80px]">{entry.room_name}</span>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            editable && (
                                                <div className="h-full w-full rounded-lg border border-dashed border-slate-200 flex flex-col items-center justify-center gap-1 text-slate-300 hover:text-slate-400 hover:border-slate-300 transition-colors group">
                                                    <div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center text-lg group-hover:bg-slate-100 transition-colors">+</div>
                                                    <span className="text-[10px] font-medium">Add</span>
                                                </div>
                                            )
                                        )}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
            {loading && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-30 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-sm font-medium text-slate-600">Loading schedule...</span>
                    </div>
                </div>
            )}
        </div>
    );
}
