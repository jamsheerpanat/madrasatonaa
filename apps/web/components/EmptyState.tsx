
import { FolderOpen } from 'lucide-react';

export function EmptyState({ title = 'No data found', description, action }: { title?: string, description?: string, action?: React.ReactNode }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[300px] text-center p-6 border-2 border-dashed border-gray-200 rounded-lg">
            <div className="bg-gray-50 p-3 rounded-full mb-3">
                <FolderOpen className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
            {description && <p className="text-sm text-gray-500 mt-1 max-w-xs">{description}</p>}
            {action && <div className="mt-4">{action}</div>}
        </div>
    );
}
