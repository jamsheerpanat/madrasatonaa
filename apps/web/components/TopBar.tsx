
import { useMe } from '../lib/useMe';
import { Search, Bell, HelpCircle, ChevronDown, Calendar, School } from 'lucide-react';

export function TopBar({ title }: { title?: string }) {
    const { me } = useMe();

    // Fallback if not loaded
    if (!me) return <div className="h-20" />;

    const primaryRole = me.roles?.[0]?.name || 'User';
    const activeBranch = me.roles?.[0]?.branch_id ? `Branch ${me.roles[0].branch_id}` : 'Main Campus';

    return (
        <header className="h-20 px-8 flex items-center justify-between sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100 transition-all">
            {/* Left: Title or Breadcrumbs */}
            <div className="flex flex-col">
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                    {title || 'Dashboard'}
                </h1>
                <div className="flex items-center text-xs text-gray-500 gap-2 mt-0.5">
                    <School className="w-3 h-3" />
                    <span>{activeBranch}</span>
                    <span className="w-1 h-1 rounded-full bg-gray-300" />
                    <Calendar className="w-3 h-3" />
                    <span>Academic Year 2025-2026</span>
                </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-6">
                {/* Search Bar */}
                <div className="hidden md:flex items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 w-64 transition-all focus-within:ring-2 focus-within:ring-indigo-100 focus-within:border-indigo-300">
                    <Search className="w-4 h-4 text-gray-400 mr-3" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="bg-transparent border-none outline-none text-sm w-full text-gray-600 placeholder:text-gray-400"
                    />
                    <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] font-bold text-gray-400 bg-white border border-gray-200 rounded-md shadow-sm">
                        ⌘K
                    </kbd>
                </div>

                {/* Icons */}
                <div className="flex items-center gap-3 border-r border-gray-200 pr-6">
                    <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all relative group">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white animate-pulse" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                        <HelpCircle className="w-5 h-5" />
                    </button>
                </div>

                {/* User Profile Trigger */}
                <button className="flex items-center gap-3 pl-2 group">
                    <div className="text-right hidden sm:block">
                        <div className="text-sm font-bold text-gray-900 group-hover:text-indigo-700 transition-colors">
                            {me.full_name || me.user?.full_name || 'User'}
                        </div>
                        <div className="text-xs text-indigo-500 font-medium">
                            {primaryRole}
                        </div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 p-0.5 shadow-lg shadow-indigo-100 group-hover:scale-105 transition-transform">
                        <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center text-indigo-700 font-bold text-lg">
                            {(me.full_name || me.user?.full_name || 'U').charAt(0)}
                        </div>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                </button>
            </div>
        </header>
    );
}
