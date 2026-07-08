// Central Axios instance — all API calls go through here
// Sets base URL, attaches JWT token automatically, and handles silent token refresh
import axios from "axios";
import { useAuthStore } from "../store/authStore";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

const getStoredItem = (key: string) => {
  return localStorage.getItem(key) || sessionStorage.getItem(key);
}

// Attach token on header of every call
apiClient.interceptors.request.use((config) => {
    const token = getStoredItem("access_token")
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

// Keep track of refresh requests to prevent loops
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
}

// Intercept responses — silent token refresh on 401
apiClient.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;

    // If 401 and request has not already been retried
    if (err.response?.status === 401 && !originalRequest._retry) {
      // If refresh itself or login fails, logout immediately to prevent loops
      if (originalRequest.url === '/auth/refresh' || originalRequest.url === '/auth/login') {
        useAuthStore.getState().logout();
        return Promise.reject(err);
      }

      // If already refreshing, queue current request
      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return apiClient(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getStoredItem("refresh_token");
      if (!refreshToken) {
        useAuthStore.getState().logout();
        const isAuthPage = window.location.pathname.startsWith('/login') || window.location.pathname.startsWith('/register');
        if (!isAuthPage) {
          window.location.href = '/login';
        }
        isRefreshing = false;
        return Promise.reject(err);
      }

      try {
        const response = await axios.post(`${BASE_URL}/auth/refresh`, {
          refresh_token: refreshToken
        });

        const { access_token, refresh_token } = response.data;
        const isRememberMe = localStorage.getItem('remember_me') === 'true';
        const storage = isRememberMe ? localStorage : sessionStorage;

        storage.setItem('access_token', access_token);
        storage.setItem('refresh_token', refresh_token);

        originalRequest.headers['Authorization'] = 'Bearer ' + access_token;
        processQueue(null, access_token);
        isRefreshing = false;

        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        useAuthStore.getState().logout();
        const isAuthPage = window.location.pathname.startsWith('/login') || window.location.pathname.startsWith('/register');
        if (!isAuthPage) {
          window.location.href = '/login';
        }
        isRefreshing = false;
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(err);
  }
)