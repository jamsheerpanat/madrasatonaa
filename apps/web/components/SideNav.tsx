
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMe } from '../lib/useMe';
import { LayoutDashboard, Clock, User, Shield, LogOut, Calendar, ClipboardCheck, Megaphone, Inbox, BookOpen, GraduationCap, MessageSquare, Menu, X } from 'lucide-react';
import { authService } from '../services/auth';

export function SideNav() {
    const pathname = usePathname();
    const { me } = useMe();

    if (!me) return null;

    const permissions = Array.isArray(me.permissions) ? me.permissions : [];
    const isPrincipal = me.roles?.some((r: any) => ['Principal', 'OfficeAdmin'].includes(r.name));

    // Group navigation items for cleaner structure if needed, or flat list with headers
    const navItems = [
        // Core
        { name: 'Timeline', href: '/app/timeline', icon: Clock, group: 'Overview' },

        // Dashboards
        ...(permissions.includes('principal.dashboard.view') ? [{ name: 'Rhythm Dashboard', href: '/app/principal/dashboard', icon: LayoutDashboard, group: 'Overview' }] : []),

        // Academic
        ...(permissions.includes('timetable.view') ? [{ name: 'Timetable', href: '/app/timetable', icon: Calendar, group: 'Academic' }] : []),
        ...(permissions.includes('attendance.view') ? [{ name: 'Attendance', href: '/app/attendance', icon: ClipboardCheck, group: 'Academic' }] : []),

        // Communication
        ...(isPrincipal || permissions.includes('announcements.view') || permissions.includes('announcements.publish') ? [{ name: 'Announcements', href: '/app/announcements', icon: Megaphone, group: 'Communication' }] : []),
        ...(isPrincipal || permissions.includes('memos.view') || permissions.includes('memos.publish') ? [{ name: 'Memos', href: '/app/memos', icon: Inbox, group: 'Communication' }] : []),

        // Coursework
        ...(isPrincipal || permissions.includes('assignments.view') ? [{ name: 'Assignments', href: '/app/assignments', icon: BookOpen, group: 'Learning' }] : []),
        ...(isPrincipal || permissions.includes('exams.view') ? [{ name: 'Exams & Results', href: '/app/exams', icon: GraduationCap, group: 'Learning' }] : []),

        // Requests
        ...(isPrincipal || permissions.includes('tickets.view') || permissions.includes('tickets.create') ? [{ name: 'Requests', href: '/app/requests', icon: MessageSquare, group: 'Support' }] : []),

        // Masters (Admin / Principal / HOD)
        ...(isPrincipal || permissions.includes('students.view') ? [{ name: 'Student Master', href: '/app/admin/students', icon: GraduationCap, group: 'Administration' }] : []),
        ...(isPrincipal || permissions.includes('admin.users.manage') ? [{ name: 'Staff Master', href: '/app/admin/staff', icon: Shield, group: 'Administration' }] : []),
        ...(isPrincipal || permissions.includes('structure.view') ? [{ name: 'Subject Master', href: '/app/admin/structure', icon: BookOpen, group: 'Administration' }] : []),

        { name: 'Profile', href: '/app/profile', icon: User, group: 'Account' },
    ];

    // Helper to render groups
    const groups = ['Overview', 'Academic', 'Communication', 'Learning', 'Support', 'Administration', 'Account'];

    // Check if a group has any visible items
    const visibleGroups = groups.filter(g => navItems.some(i => i.group === g));

    return (
        <div className="w-72 bg-[#0f172a] text-slate-300 flex flex-col h-full fixed left-0 top-0 bottom-0 z-20 shadow-2xl border-r border-slate-800">
            {/* Header / Logo */}
            <div className="h-24 flex items-center px-6 border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-sm">
                <Link href="/app" className="flex items-center gap-3 group transition-all">
                    <div className="bg-white p-2 rounded-xl shadow-lg ring-1 ring-white/10 group-hover:scale-105 transition-transform duration-300">
                        <img
                            src="/logo.png"
                            alt="Madrasatonaa"
                            className="h-8 w-auto object-contain"
                        />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-white font-bold tracking-tight">Madrasatonaa</span>
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">School OS</span>
                    </div>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-8 overflow-y-auto custom-scrollbar">
                {visibleGroups.map(group => {
                    const groupItems = navItems.filter(i => i.group === group);
                    if (groupItems.length === 0) return null;

                    return (
                        <div key={group} className="space-y-1">
                            <h3 className="px-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
                                {group}
                            </h3>
                            {groupItems.map((item) => {
                                const isActive = pathname === item.href;
                                const Icon = item.icon;

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 relative overflow-hidden ${isActive
                                            ? 'bg-indigo-600/10 text-white shadow-sm'
                                            : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                                            }`}
                                    >
                                        {isActive && (
                                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-500 rounded-r-full shadow-[0_0_12px_rgba(99,102,241,0.5)]" />
                                        )}
                                        <Icon className={`w-5 h-5 mr-3 transition-colors ${isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'
                                            }`} />
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </div>
                    );
                })}
            </nav>

            {/* Footer / User Profile */}
            <div className="p-4 border-t border-slate-800 bg-slate-900/30">
                <div className="flex items-center gap-3 mb-4 px-2">
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white ring-2 ring-slate-800">
                        {me.user.full_name?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                            {me.user.full_name}
                        </p>
                        <p className="text-xs text-slate-500 truncate capitalize">
                            {me.user.user_type.toLowerCase()}
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => authService.logout()}
                    className="flex items-center justify-center w-full px-4 py-2 text-xs font-bold uppercase tracking-wider text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg hover:bg-red-500/20 hover:text-red-300 transition-all group"
                >
                    <LogOut className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
                    Sign Out
                </button>
            </div>
        </div>
    );
}
