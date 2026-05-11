import axios, { AxiosError } from 'axios';
import { useAuthStore } from '@/entities/session/model/store';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de Solicitud: Inyectar JWT
apiClient.interceptors.request.use(
  (config) => {
    // Obtenemos el token directamente del estado de Zustand
    const token = useAuthStore.getState().token;
    if (token && config.headers) {
      config.headers.Authorization = \`Bearer \${token}\`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de Respuesta: Manejar 401/403
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Si el token expira o el rol no es válido, cerramos sesión
      useAuthStore.getState().logout();
      // Opcionalmente, forzar recarga o redirección al login
      window.location.href = '/login?session_expired=true';
    }
    return Promise.reject(error);
  }
);
