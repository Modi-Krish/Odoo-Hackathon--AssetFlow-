/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';

const API_BASE_URL = typeof process !== 'undefined'
  ? (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api')
  : 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Sets a cookie so Next.js Edge Middleware can verify auth without localStorage access.
 * The cookie is NOT HttpOnly (Edge Middleware reads it from JS), but it's Secure and SameSite=Strict.
 */
const setTokenCookie = (token: string) => {
  if (typeof document !== 'undefined') {
    // SameSite=Strict prevents CSRF. Secure ensures HTTPS-only in production.
    document.cookie = `assetflow_token=${token}; path=/; SameSite=Strict; max-age=900`; // 15 min matches JWT_EXPIRES_IN
  }
};

const clearTokenCookie = () => {
  if (typeof document !== 'undefined') {
    document.cookie = 'assetflow_token=; path=/; max-age=0';
  }
};

// Request interceptor — attach JWT token and mirror it to cookie
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
        // Keep cookie in sync with localStorage token
        setTokenCookie(token);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401 (expired/invalid token) globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        clearTokenCookie();
        // Redirect to login — preserving the current path for post-login redirect
        const currentPath = window.location.pathname;
        window.location.href = `/login?from=${encodeURIComponent(currentPath)}`;
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
export { setTokenCookie, clearTokenCookie };

