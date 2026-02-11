
import { Loader2 } from 'lucide-react';

export function LoadingState({ message = 'Loading...' }: { message?: string }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500">
            <Loader2 className="w-8 h-8 animate-spin mb-4 text-blue-600" />
            <p className="text-sm font-medium">{message}</p>
        </div>
    );
}
