
import { AlertCircle } from 'lucide-react';

export function ErrorState({ title = 'Error', message, retry }: { title?: string, message: string, retry?: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6">
            <div className="bg-red-50 p-4 rounded-full mb-4">
                <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
            <p className="text-gray-500 max-w-sm mb-6">{message}</p>
            {retry && (
                <button
                    onClick={retry}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                    Try Again
                </button>
            )}
        </div>
    );
}
