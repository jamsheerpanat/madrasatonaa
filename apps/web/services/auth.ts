
import { apiClient } from './apiClient';
import { v4 as uuidv4 } from 'uuid';

// Helper to get or create device ID
function getDeviceId() {
    if (typeof window === 'undefined') return 'server-side'; // Should not happen for login
    let id = localStorage.getItem('device_id');
    if (!id) {
        id = self.crypto.randomUUID ? self.crypto.randomUUID() : 'legacy-uuid-' + Math.random();
        localStorage.setItem('device_id', id);
    }
    return id;
}

export const authService = {
    async staffLogin(email: string, password: string) {
        const deviceId = getDeviceId();
        const res = await apiClient('/auth/staff/login', {
            method: 'POST',
            body: JSON.stringify({
                email,
                password,
                device_id: deviceId,
                device_name: navigator.userAgent,
                platform: 'WEB'
            }),
            skipAuth: true
        });

        if (res.ok) {
            const data = await res.json();
            localStorage.setItem('access_token', data.access_token);
            localStorage.setItem('refresh_token', data.refresh_token);
            localStorage.setItem('last_login_type', 'staff');
            return data;
        }
        throw new Error('Login failed');
    },

    async parentRequestOtp(phone: string) {
        const res = await apiClient('/auth/parent/request-otp', {
            method: 'POST',
            body: JSON.stringify({ phone }),
            skipAuth: true
        });
        if (!res.ok) throw new Error('Request OTP failed');
        return res.json();
    },

    async parentVerifyOtp(phone: string, otp: string) {
        const deviceId = getDeviceId();
        const res = await apiClient('/auth/parent/verify-otp', {
            method: 'POST',
            body: JSON.stringify({
                phone,
                otp,
                device_id: deviceId,
                device_name: navigator.userAgent,
                platform: 'WEB'
            }),
            skipAuth: true
        });

        if (res.ok) {
            const data = await res.json();
            localStorage.setItem('access_token', data.access_token);
            localStorage.setItem('refresh_token', data.refresh_token);
            localStorage.setItem('last_login_type', 'parent');
            return data;
        }
        throw new Error('OTP Verification failed');
    },

    async logout() {
        const deviceId = localStorage.getItem('device_id');
        if (deviceId) {
            // Best effort logout
            await apiClient('/auth/logout', {
                method: 'POST',
                body: JSON.stringify({ device_id: deviceId })
            });
        }
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');

        // Clear the me cache
        const { clearMeCache } = await import('../lib/useMe');
        clearMeCache();

        // Keep device_id
        window.location.href = localStorage.getItem('last_login_type') === 'parent' ? '/parent-login' : '/login';
    }
};
