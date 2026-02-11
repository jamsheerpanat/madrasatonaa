
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';

interface RequestOptions extends RequestInit {
    skipAuth?: boolean;
}

// Simple mutex for refreshing
let isRefreshing = false;
let failedQueue: Array<{ resolve: (value?: unknown) => void; reject: (reason?: unknown) => void }> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });

    failedQueue = [];
};

export async function apiClient(endpoint: string, options: RequestOptions = {}) {
    const { skipAuth, headers, ...rest } = options;

    const performRequest = async (token?: string) => {
        const authHeader = token && !skipAuth ? { Authorization: `Bearer ${token}` } : {};

        const res = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                ...authHeader,
                ...(headers as any),
            } as any,
            ...rest,
        });

        return res;
    };

    const accessToken = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    let response = await performRequest(accessToken || undefined);

    if (response.status === 401 && !skipAuth) {
        if (isRefreshing) {
            try {
                await new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                });
                const newToken = localStorage.getItem('access_token');
                return performRequest(newToken || undefined);
            } catch (err) {
                return response; // Return original 401
            }
        }

        // Attempt refresh
        const refreshToken = localStorage.getItem('refresh_token');
        const deviceId = localStorage.getItem('device_id');

        if (refreshToken && deviceId) {
            isRefreshing = true;

            try {
                const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    body: JSON.stringify({ refresh_token: refreshToken, device_id: deviceId }),
                });

                if (refreshResponse.ok) {
                    const data = await refreshResponse.json();
                    localStorage.setItem('access_token', data.access_token);
                    if (data.refresh_token) localStorage.setItem('refresh_token', data.refresh_token);

                    processQueue(null, data.access_token);
                    isRefreshing = false;

                    return performRequest(data.access_token);
                } else {
                    throw new Error('Refresh failed');
                }
            } catch (err) {
                processQueue(err as Error);
                isRefreshing = false;
                // Logout
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    const lastType = localStorage.getItem('last_login_type');
                    window.location.href = lastType === 'parent' ? '/parent-login' : '/login';
                }
            }
        } else {
            // No refresh token
            if (typeof window !== 'undefined') {
                localStorage.removeItem('access_token');
                const lastType = localStorage.getItem('last_login_type');
                window.location.href = lastType === 'parent' ? '/parent-login' : '/login';
            }
        }
    }

    return response;
}
