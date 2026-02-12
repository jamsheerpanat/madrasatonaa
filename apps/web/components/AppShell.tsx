
import { useMe } from '../lib/useMe';
import { SideNav } from './SideNav';
import { TopBar } from './TopBar';
import { LoadingState } from './LoadingState';
import { ErrorState } from './ErrorState';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function AppShell({ children, title }: { children: React.ReactNode, title?: string }) {
    const { me, loading, error } = useMe();
    const router = useRouter();

    // Auth Guard
    useEffect(() => {
        // If not loading and no me data (and maybe explicit 401/error handled by apiClient redirect loop? 
        // apiClient redirects, but we might want to check here too if me is null but no error yet)
        // Actually apiClient redirects logic is only on 401. If network error, we stay.
        // So if no me and no loading, we assume issue.
        if (!loading && !me && !error) {
            // Should have been handled by apiClient 401, but maybe cold start with invalid token?
            // Just wait.
        }
    }, [loading, me, error, router]);

    if (loading) {
        return <LoadingState message="Initializing app..." />;
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <ErrorState message="Could not load user session. Please try refreshing." retry={() => window.location.reload()} />
            </div>
        );
    }

    if (!me) return null; // Wait for redirect if any

    return (
        <div className="flex min-h-screen bg-gray-50 text-gray-900 font-sans">
            <SideNav />
            <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
                <TopBar title={title} />
                <main className="flex-1 p-8 overflow-y-auto w-full max-w-7xl mx-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
