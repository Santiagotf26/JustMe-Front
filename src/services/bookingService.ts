import { apiClient } from './api';

export interface CreateBookingDto {
  professionalId: string;
  serviceName: string;
  date: string;
  time: string;
  price: number;
}

export const bookingService = {
  createBooking: async (data: CreateBookingDto) => {
    const response = await apiClient.post('/bookings', data);
    return response.data;
  },

  getUserBookings: async () => {
    const response = await apiClient.get('/bookings/user');
    return response.data;
  },

  getProfessionalBookings: async () => {
    const response = await apiClient.get('/bookings/professional');
    return response.data;
  },

  updateBookingStatus: async (id: string, status: string) => {
    const response = await apiClient.patch(`/bookings/${id}/status`, { status });
    return response.data;
  }
};
