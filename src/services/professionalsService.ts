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

  // Get professional profile by user ID
  getProfessionalByUserId: async (userId: string) => {
    try {
      const response = await apiClient.get(`/professionals/user/${userId}`);
      return response.data;
    } catch {
      return null;
    }
  },

  // Profile management for professionals
  // Backend: PATCH /professionals/:id
  updateProfile: async (id: string, data: any) => {
    const response = await apiClient.patch(`/professionals/${id}`, data);
    return response.data;
  },

  updateSchedule: async (id: string, schedule: WorkingHour[]) => {
    const response = await apiClient.patch(`/professionals/${id}`, { schedule });
    return response.data;
  },

  // Services — Backend: /services/professional/:professionalId
  getServices: async (professionalId: string) => {
    try {
      const response = await apiClient.get(`/services/professional/${professionalId}`);
      return response.data;
    } catch {
      return [];
    }
  },

  addService: async (professionalId: string, service: ProfessionalServiceDto) => {
    const response = await apiClient.post(`/services/professional/${professionalId}`, service);
    return response.data;
  },

  deleteService: async (_professionalId: string, serviceId: string) => {
    // Backend: DELETE /services/professional-service/:id
    const response = await apiClient.delete(`/services/professional-service/${serviceId}`);
    return response.data;
  },

  updateService: async (_professionalId: string, serviceId: string, data: Partial<ProfessionalServiceDto>) => {
    // Backend: PATCH /services/professional-service/:id
    const response = await apiClient.patch(`/services/professional-service/${serviceId}`, data);
    return response.data;
  },

  // Reviews — Backend: GET /reviews/professional/:professionalId
  getReviews: async (professionalId: string) => {
    try {
      const response = await apiClient.get(`/reviews/professional/${professionalId}`);
      return response.data;
    } catch {
      return [];
    }
  },

  uploadPortfolioImages: async (professionalId: string, files: File[]) => {
    const formData = new FormData();
    files.forEach(file => formData.append('images', file));

    const response = await apiClient.post(`/professionals/${professionalId}/portfolio`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  getDashboardStats: async (professionalId: string) => {
    // No dedicated stats endpoint exists yet — compute from bookings + reviews
    try {
      const [bookingsRes, reviewsRes] = await Promise.all([
        apiClient.get(`/bookings/professional/${professionalId}`).catch(() => ({ data: [] })),
        apiClient.get(`/reviews/professional/${professionalId}`).catch(() => ({ data: [] })),
      ]);
      const bookings = bookingsRes.data || [];
      const reviews = reviewsRes.data || [];
      const totalEarnings = bookings
        .filter((b: any) => b.status === 'completed')
        .reduce((sum: number, b: any) => sum + (b.totalPrice || 0), 0);
      const avgRating = reviews.length > 0
        ? reviews.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / reviews.length
        : 0;
      return {
        totalAppointments: bookings.length,
        completedAppointments: bookings.filter((b: any) => b.status === 'completed').length,
        totalEarnings,
        averageRating: Math.round(avgRating * 10) / 10,
        totalReviews: reviews.length,
      };
    } catch {
      return null;
    }
  },
};
