import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1',
    withCredentials: true, // Send httpOnly cookies with every request
});

// ── In-memory CSRF token store ──
let csrfToken = null;

export const setCsrfToken = (token) => { csrfToken = token; };
export const clearCsrfToken = () => { csrfToken = null; };

// Request interceptor — attach CSRF token to state-changing requests
api.interceptors.request.use((config) => {
    const method = config.method?.toUpperCase();
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) && csrfToken) {
        config.headers['X-CSRF-Token'] = csrfToken;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Response interceptor — auto-capture CSRF token from any response body
api.interceptors.response.use((response) => {
    const token = response.data?.data?.csrfToken;
    if (token) {
        csrfToken = token;
    }
    return response;
});

// Response interceptor for silent token refresh
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve();
        }
    });
    failedQueue = [];
};

// Endpoints that should NOT trigger a refresh attempt
const SKIP_REFRESH = ['/auth/refresh', '/auth/login', '/auth/register-company', '/auth/logout'];

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        const shouldSkip = SKIP_REFRESH.some((path) => originalRequest.url.includes(path));

        // Only intercept 401s on protected API calls
        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !shouldSkip
        ) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(() => {
                    return api(originalRequest);
                }).catch((err) => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const refreshRes = await axios.post(
                    `${api.defaults.baseURL}/auth/refresh`,
                    {},
                    { withCredentials: true }
                );

                // Capture new CSRF token from refresh response
                const newCsrfToken = refreshRes.data?.data?.csrfToken;
                if (newCsrfToken) {
                    csrfToken = newCsrfToken;
                }

                // Refresh succeeded — new cookies set automatically
                processQueue(null);
                return api(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError);
                // Don't redirect — let React Router / AuthContext handle it
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;

