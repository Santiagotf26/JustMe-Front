import axios, { AxiosError } from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de Solicitud: Inyectar JWT
// Lee el token del mismo localStorage que usa AuthContext ('justme_token')
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('justme_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de Respuesta: Manejar 401/403
apiClient.interceptors.response.use(
  (response) => {
    // Unwrap the standard backend response format { success: true, data: ... }
    if (response.data && response.data.success !== undefined && response.data.data !== undefined) {
      response.data = response.data.data;
    }
    return response;
  },
  (error: AxiosError) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('justme_token');
      localStorage.removeItem('justme_role');
      window.location.href = '/login?session_expired=true';
    }
    return Promise.reject(error);
  }
);
