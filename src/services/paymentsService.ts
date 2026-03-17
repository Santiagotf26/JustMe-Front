import { apiClient } from './api';

export interface CreatePaymentDto {
  bookingId: string;
  amount: number;
}

export const paymentsService = {
  createPayment: async (data: CreatePaymentDto) => {
    const response = await apiClient.post('/payments/create', data);
    return response.data; // Expected { url: string } for MercadoPago redirection
  }
};
