
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMe } from '../lib/useMe';
import {
    LayoutDashboard, Clock, User, Shield, LogOut, Calendar,
    ClipboardCheck, Megaphone, Inbox, BookOpen, GraduationCap,
    MessageSquare, Settings, ChevronRight, PieChart, Users,
    FileText, Bell, Search, Command, UserCheck
} from 'lucide-react';
import { authService } from '../services/auth';
import { useState } from 'react';

export function SideNav() {
    const pathname = usePathname();
    const { me } = useMe();
    const [collapsed, setCollapsed] = useState(false);

    if (!me) return null;

    const permissions = Array.isArray(me.permissions) ? me.permissions : [];
    const isPrincipal = me.roles?.some((r: any) => ['PRINCIPAL', 'OFFICEADMIN', 'SUPER_ADMIN'].includes(r.name?.toUpperCase()));

    const navItems = [
        { name: 'Dashboard', href: '/app', icon: LayoutDashboard, group: 'Main' },
        { name: 'Timeline', href: '/app/timeline', icon: Clock, group: 'Main' },

        ...(permissions.includes('principal.dashboard.view') || isPrincipal ? [{ name: 'Rhythm', href: '/app/principal/dashboard', icon: PieChart, group: 'Main' }] : []),

        { name: 'Timetable', href: '/app/timetable', icon: Calendar, group: 'Academic' },
        { name: 'Attendance', href: '/app/attendance', icon: ClipboardCheck, group: 'Academic' },

        ...(isPrincipal || permissions.includes('announcements.view') ? [{ name: 'Broadcasts', href: '/app/announcements', icon: Megaphone, group: 'Communication' }] : []),
        ...(isPrincipal || permissions.includes('memos.view') ? [{ name: 'Memos', href: '/app/memos', icon: Inbox, group: 'Communication' }] : []),

        ...(isPrincipal || permissions.includes('assignments.view') ? [{ name: 'Assignments', href: '/app/assignments', icon: BookOpen, group: 'Learning' }] : []),
        ...(isPrincipal || permissions.includes('exams.view') ? [{ name: 'Exams & Results', href: '/app/exams', icon: GraduationCap, group: 'Learning' }] : []),

        ...(isPrincipal || permissions.includes('tickets.view') ? [{ name: 'Support Tickets', href: '/app/requests', icon: MessageSquare, group: 'Support' }] : []),

        ...(isPrincipal || permissions.includes('students.view') ? [{ name: 'Students', href: '/app/admin/students', icon: Users, group: 'Administration' }] : []),
        ...(isPrincipal ? [{ name: 'Parents', href: '/app/admin/parents', icon: UserCheck, group: 'Administration' }] : []),
        ...(isPrincipal || permissions.includes('admin.users.manage') ? [{ name: 'Staff', href: '/app/admin/staff', icon: Shield, group: 'Administration' }] : []),
        ...(isPrincipal || permissions.includes('structure.view') ? [{ name: 'Subjects', href: '/app/admin/structure', icon: BookOpen, group: 'Administration' }] : []),
        ...(isPrincipal ? [{ name: 'User Directory', href: '/app/users', icon: Users, group: 'Administration' }] : []),

        { name: 'Profile', href: '/app/profile', icon: User, group: 'Account' },
        { name: 'Settings', href: '/app/settings', icon: Settings, group: 'Account' },
    ];

    const groups = ['Main', 'Academic', 'Communication', 'Learning', 'Support', 'Administration', 'Account'];
    const visibleGroups = groups.filter(g => navItems.some(i => i.group === g));

    return (
        <aside
            className={`${collapsed ? 'w-20' : 'w-72'} bg-[#0f172a] text-slate-300 flex flex-col h-screen sticky top-0 z-50 shadow-2xl border-r border-slate-800 transition-all duration-300 ease-in-out flex-shrink-0`}
        >
            {/* Header */}
            <div className={`h-20 flex items-center ${collapsed ? 'justify-center' : 'px-6'} border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-md relative`}>
                <Link href="/app" className="flex items-center gap-3 group">
                    <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300">
                        {/* Placeholder Logo Icon */}
                        <div className="w-5 h-5 border-2 border-white rounded-md flex items-center justify-center">
                            <span className="text-[10px] font-bold text-white">M</span>
                        </div>
                    </div>
                    {!collapsed && (
                        <div className="flex flex-col animate-in fade-in slide-in-from-left-2 duration-300">
                            <span className="text-white font-bold tracking-tight text-lg">Madrasatonaa</span>
                            <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">School OS</span>
                        </div>
                    )}
                </Link>
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-indigo-600 transition-all shadow-lg z-50 opacity-0 group-hover:opacity-100 peer-hover:opacity-100"
                >
                    <ChevronRight className={`w-3 h-3 transition-transform ${collapsed ? '' : 'rotate-180'}`} />
                </button>
            </div>

            {/* Global Search Trigger (Mini) */}
            {!collapsed && (
                <div className="px-4 py-4">
                    <button className="w-full bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 rounded-xl px-3 py-2.5 flex items-center gap-2 text-sm text-slate-400 transition-all group">
                        <Search className="w-4 h-4 group-hover:text-indigo-400" />
                        <span className="flex-1 text-left">Quick Search...</span>
                        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-900 border border-slate-700 text-[10px] font-mono">
                            <Command className="w-3 h-3" /> K
                        </div>
                    </button>
                </div>
            )}

            {/* Navigation */}
            <nav className="flex-1 px-3 py-2 space-y-6 overflow-y-auto custom-scrollbar">
                {visibleGroups.map(group => {
                    const groupItems = navItems.filter(i => i.group === group);
                    if (groupItems.length === 0) return null;

                    return (
                        <div key={group} className="space-y-1">
                            {!collapsed && (
                                <h3 className="px-3 text-[10px] font-extrabold uppercase tracking-widest text-slate-600 mb-2 mt-4 first:mt-0">
                                    {group}
                                </h3>
                            )}
                            {groupItems.map((item) => {
                                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                                const Icon = item.icon;

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`group flex items-center ${collapsed ? 'justify-center p-3' : 'px-3 py-2.5'} text-sm font-medium rounded-xl transition-all duration-200 relative ${isActive
                                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20'
                                            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                            }`}
                                        title={collapsed ? item.name : undefined}
                                    >
                                        <Icon className={`w-5 h-5 ${!collapsed && 'mr-3'} transition-all ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-white'}`} />

                                        {!collapsed && (
                                            <>
                                                <span className="flex-1">{item.name}</span>
                                                {isActive && <div className="w-1.5 h-1.5 rounded-full bg-white shadow-sm" />}
                                            </>
                                        )}

                                        {collapsed && isActive && (
                                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-l-full" />
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    );
                })}
            </nav>

            {/* User Profile */}
            <div className={`p-4 border-t border-slate-800 bg-slate-900/30 backdrop-blur-sm ${collapsed ? 'flex flex-col items-center' : ''}`}>
                <div className={`flex items-center gap-3 mb-3 ${collapsed ? 'justify-center' : ''}`}>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 p-0.5 shadow-lg relative group cursor-pointer">
                        <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center text-indigo-400 font-bold text-sm group-hover:bg-transparent group-hover:text-white transition-all">
                            {me.user.full_name?.charAt(0)}
                        </div>
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-slate-900 rounded-full"></span>
                    </div>

                    {!collapsed && (
                        <div className="flex-1 min-w-0 overflow-hidden">
                            <p className="text-sm font-bold text-white truncate">
                                {me.user.full_name}
                            </p>
                            <p className="text-xs text-slate-500 truncate capitalize flex items-center gap-1">
                                {me.user.user_type.toLowerCase()} • <span className="text-green-500">Online</span>
                            </p>
                        </div>
                    )}
                </div>

                <button
                    onClick={() => authService.logout()}
                    className={`flex items-center justify-center w-full ${collapsed ? 'p-3' : 'px-4 py-2.5'} text-xs font-bold uppercase tracking-wider text-red-400 bg-red-500/10 border border-red-500/10 rounded-xl hover:bg-red-500/20 hover:border-red-500/30 hover:text-red-300 transition-all group`}
                    title="Sign Out"
                >
                    <LogOut className={`w-4 h-4 ${!collapsed && 'mr-2'} group-hover:scale-110 transition-transform`} />
                    {!collapsed && "Sign Out"}
                </button>
            </div>
        </aside>
    );
}
