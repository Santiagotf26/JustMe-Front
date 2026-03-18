import { apiClient } from './api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  lastName?: string;
  email: string;
  password: string;
  role: 'user' | 'professional';
  phone?: string;
}

export interface AuthResponse {
  access_token?: string;
  token?: string;
  refresh_token?: string;
  user: {
    id: number;
    name: string;
    lastName?: string;
    email: string;
    roles: { id: number; name: string }[];
    photoUrl?: string;
    avatar?: string;
  };
}

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const payload = {
        email: credentials.email,
        password: credentials.password
      };
      const response = await apiClient.post<AuthResponse>('/auth/login', payload);
      return response.data;
    } catch (error: any) {
      console.error('Login service error:', error.response?.data || error.message);
      throw error;
    }
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    try {
      const payload = {
        name: data.name,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        role: data.role,
        phone: data.phone
      };
      const response = await apiClient.post<AuthResponse>('/auth/register', payload);
      return response.data;
    } catch (error: any) {
      console.error('Register service error:', error.response?.data || error.message);
      throw error;
    }
  },

  getProfile: async () => {
    const response = await apiClient.get('/auth/profile');
    return response.data;
  }
};
