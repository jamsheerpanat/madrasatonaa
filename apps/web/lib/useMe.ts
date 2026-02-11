
import { useState, useEffect } from 'react';
import { apiClient } from '../services/apiClient';

// Minimal global cache
let meCache: any = null;
let fetchingPromise: Promise<any> | null = null;

export function useMe() {
    const [data, setData] = useState<any>(meCache);
    const [loading, setLoading] = useState<boolean>(!meCache);
    const [error, setError] = useState<any>(null);

    useEffect(() => {
        if (meCache) {
            setLoading(false);
            setData(meCache);
            return;
        }

        if (!fetchingPromise) {
            fetchingPromise = apiClient('/me')
                .then(async (res) => {
                    if (!res.ok) throw new Error('Failed to fetch me');
                    return res.json();
                })
                .then((data) => {
                    meCache = data;
                    return data;
                })
                .catch((err) => {
                    meCache = null; // Don't cache error permanently?
                    throw err;
                })
                .finally(() => {
                    fetchingPromise = null;
                });
        }

        fetchingPromise
            .then((d) => {
                setData(d);
                setLoading(false);
            })
            .catch((e) => {
                setError(e);
                setLoading(false);
            });
    }, []);

    return { me: data, loading, error };
}

// Reset cache on logout
export function clearMeCache() {
    meCache = null;
}
