import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - Add access token to headers
api.interceptors.request.use((config) => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
});

// Response interceptor - Handle token refresh on 401 errors
let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If error is 401 and we haven't tried to refresh yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                // If already refreshing, queue this request
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return api(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const refreshToken = localStorage.getItem('refreshToken');

            if (!refreshToken) {
                // No refresh token, logout user
                isRefreshing = false;
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                window.location.href = '/login';
                return Promise.reject(error);
            }

            try {
                // Call refresh endpoint
                const response = await axios.post('http://localhost:8080/auth/refresh', {
                    refreshToken
                });

                const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;

                // Store new tokens
                localStorage.setItem('accessToken', newAccessToken);
                if (newRefreshToken) {
                    localStorage.setItem('refreshToken', newRefreshToken);
                }

                // Update auth store
                const { useAuthStore } = await import('@/stores/auth-store');
                useAuthStore.getState().setToken(newAccessToken, newRefreshToken);

                // Update the failed request with new token
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

                // Process queued requests
                processQueue(null, newAccessToken);
                isRefreshing = false;

                // Retry original request
                return api(originalRequest);
            } catch (refreshError) {
                // Refresh failed, logout user
                processQueue(refreshError, null);
                isRefreshing = false;
                
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                window.location.href = '/login';
                
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export { api };

