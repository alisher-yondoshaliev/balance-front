import axios from 'axios';
import { useAuthStore } from '../store/auth.store';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — token qo'shish
api.interceptors.request.use((config) => {
  // Get token from Zustand store
  const token = useAuthStore.getState().accessToken;
  console.log('[Axios] Request to', config.url, 'with token:', token ? 'EXISTS' : 'MISSING');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('[Axios] Authorization header set');
  } else {
    console.warn('[Axios] NO TOKEN in Zustand store');
  }
  return config;
});

// Response interceptor — token yangilash
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      try {
        const refreshToken = useAuthStore.getState().refreshToken;
        console.log('[Axios] Token expired, attempting refresh with refreshToken:', refreshToken ? 'EXISTS' : 'MISSING');

        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/auth/refresh`,
          {},
          { headers: { Authorization: `Bearer ${refreshToken}` } },
        );

        const { setAuth } = useAuthStore.getState();
        setAuth(useAuthStore.getState().user!, data.accessToken, data.refreshToken);

        original.headers.Authorization = `Bearer ${data.accessToken}`;
        console.log('[Axios] Token refreshed successfully');

        return api(original);
      } catch {
        console.error('[Axios] Token refresh failed, logging out');
        useAuthStore.getState().logout();
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  },
);

export default api;