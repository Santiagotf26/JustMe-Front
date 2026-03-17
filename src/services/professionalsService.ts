import { apiClient } from './api';

export interface LocationParams {
  latitude: number;
  longitude: number;
  radius?: number; // km
}

export interface SearchParams extends LocationParams {
  category?: string;
  date?: string;
  time?: string;
}

export interface WorkingHour {
  dayOfWeek: number; // 0-6
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  isActive: boolean;
}

export interface ProfessionalServiceDto {
  name: string;
  description: string;
  price: number;
  duration: number; // minutes
}

export const professionalsService = {
  // Search and discovery
  getNearbyProfessionals: async (params: SearchParams) => {
    const response = await apiClient.get('/professionals/nearby', { params });
    return response.data;
  },

  getProfessionalById: async (id: string) => {
    const response = await apiClient.get(`/professionals/${id}`);
    return response.data;
  },

  // Profile management for professionals
  updateProfile: async (id: string, data: any) => {
    const response = await apiClient.patch(`/professionals/${id}`, data);
    return response.data;
  },

  updateSchedule: async (id: string, schedule: WorkingHour[]) => {
    const response = await apiClient.put(`/professionals/${id}/schedule`, { schedule });
    return response.data;
  },

  getServices: async (professionalId: string) => {
    const response = await apiClient.get(`/professionals/${professionalId}/services`);
    return response.data;
  },

  addService: async (professionalId: string, service: ProfessionalServiceDto) => {
    const response = await apiClient.post(`/professionals/${professionalId}/services`, service);
    return response.data;
  },

  deleteService: async (professionalId: string, serviceId: string) => {
    const response = await apiClient.delete(`/professionals/${professionalId}/services/${serviceId}`);
    return response.data;
  },

  uploadPortfolioImages: async (professionalId: string, files: File[]) => {
    const formData = new FormData();
    files.forEach(file => formData.append('images', file));
    
    const response = await apiClient.post(`/professionals/${professionalId}/portfolio`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }
};
