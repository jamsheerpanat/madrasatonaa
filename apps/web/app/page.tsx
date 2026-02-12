'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';
        const res = await fetch(`${apiUrl}/health`);
        if (!res.ok) throw new Error('Failed to connect to API');
        const data = await res.json();
        setHealth(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHealth();
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50 text-gray-900">
      <img src="/logo.png" alt="Madrasatonaa Logo" className="h-16 w-auto mb-8 animate-in fade-in zoom-in duration-700" />
      <h1 className="text-4xl font-bold mb-4 tracking-tight">Madrasatonaa</h1>
      <p className="text-xl text-gray-500 mb-12">Next-Generation School Operating System</p>

      <div className="p-6 bg-white rounded-lg shadow-md border border-gray-200 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4 border-b pb-2">API Connectivity Test</h2>

        {loading && <div className="text-blue-500 animate-pulse">Connecting to API...</div>}

        {error && (
          <div className="text-red-500 bg-red-50 p-3 rounded">
            <strong>Error:</strong> {error}
          </div>
        )}

        {health && (
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">Status:</span>
              <span className="font-mono text-green-600 font-bold">{health.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Service:</span>
              <span className="font-mono">{health.service}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Version:</span>
              <span className="font-mono">{health.version}</span>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 flex gap-4">
        <a href="/login" className="px-6 py-3 bg-blue-600 text-white rounded shadow hover:bg-blue-700 font-bold">Staff Login</a>
        <a href="/parent-login" className="px-6 py-3 bg-green-600 text-white rounded shadow hover:bg-green-700 font-bold">Parent Login</a>
      </div>
    </main>
  );
}
