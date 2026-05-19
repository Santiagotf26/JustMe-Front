import axios, { type AxiosError, type InternalAxiosRequestConfig, type AxiosResponse } from 'axios';
import { API_URL, API_TIMEOUT } from '../config/api';

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('justme_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response Interceptor: Handle global errors and unwrap standard API responses
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Unwrap the standard backend response format { success: true, data: ... }
    if (response.data && response.data.success !== undefined && response.data.data !== undefined) {
      response.data = response.data.data;
    }
    return response;
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      const configToken = error.config?.headers?.Authorization?.toString().split(' ')[1];
      const currentToken = localStorage.getItem('justme_token');
      
      // Solo limpiar si el token que falló es el que tenemos actualmente
      if (configToken === currentToken || !currentToken) {
        console.warn('Unauthorized access - clearing session');
        localStorage.removeItem('justme_token');
        localStorage.removeItem('justme_role');
        window.dispatchEvent(new Event('auth:unauthorized'));
      } else {
        console.warn('Ignoring 401 from an old/different token');
      }
    }
    return Promise.reject(error);
  }
);
