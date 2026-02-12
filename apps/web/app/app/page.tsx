
'use client';

import { useMe } from '../../lib/useMe';
import { PrincipalDashboard } from '../../components/dashboards/PrincipalDashboard';
import { TeacherDashboard } from '../../components/dashboards/TeacherDashboard';
import { StudentDashboard } from '../../components/dashboards/StudentDashboard';
import { ParentDashboard } from '../../components/dashboards/ParentDashboard';
import { OfficeDashboard } from '../../components/dashboards/OfficeDashboard';
import { LoadingState } from '../../components/LoadingState';
import { LayoutDashboard } from 'lucide-react';

export default function Dashboard() {
    const { me, loading } = useMe();

    if (loading) return <LoadingState />;
    if (!me) return null;

    // specific role checks
    const roles = me.roles?.map((r: any) => r.name.toUpperCase()) || [];
    const type = me.user_type;

    if (type === 'STUDENT') {
        return <StudentDashboard />;
    }

    if (type === 'PARENT') {
        return <ParentDashboard />;
    }

    if (roles.includes('PRINCIPAL') || roles.includes('SUPER_ADMIN')) {
        return <PrincipalDashboard />;
    }

    if (roles.includes('TEACHER') || roles.includes('STAFF_TEACHING')) {
        return <TeacherDashboard />;
    }

    if (roles.includes('OFFICE') || roles.includes('ADMIN') || roles.includes('CLERK')) {
        return <OfficeDashboard />;
    }

    // Fallback / Generic User Dashboard
    // Or if they are STAFF but without specific role mappings yet
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
            <div className="p-4 bg-slate-100 rounded-full">
                <LayoutDashboard className="w-12 h-12 text-slate-400" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Welcome, {me.user.full_name}</h1>
            <p className="text-slate-500 max-w-md">
                You are logged in as <strong>{type}</strong>.
                {roles.length > 0 && <span> Your roles: {roles.join(', ')}.</span>}
                <br />
                No specific dashboard is configured for your role yet.
            </p>
        </div>
    );
}
