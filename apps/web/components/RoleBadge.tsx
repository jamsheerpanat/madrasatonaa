
export function RoleBadge({ role }: { role: string }) {
    const colors: Record<string, string> = {
        'OfficeAdmin': 'bg-purple-100 text-purple-700 border-purple-200',
        'Principal': 'bg-indigo-100 text-indigo-700 border-indigo-200',
        'Teacher': 'bg-blue-100 text-blue-700 border-blue-200',
        'Parent': 'bg-green-100 text-green-700 border-green-200',
        'Student': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    };

    const style = colors[role] || 'bg-gray-100 text-gray-700 border-gray-200';

    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${style}`}>
            {role}
        </span>
    );
}
