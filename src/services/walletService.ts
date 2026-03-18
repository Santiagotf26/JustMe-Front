import { apiClient } from './api';

export interface RechargeDto {
  amount: number;
  currency: 'USD' | 'COP';
}

// Approximate conversion rate (simulated)
export const COP_TO_USD_RATE = 0.00024;
export const USD_TO_COP_RATE = 4150;

export const walletService = {
  // Backend: GET /wallet/:professionalId (returns balance + transactions)
  getBalance: async (professionalId: string) => {
    try {
      const response = await apiClient.get(`/wallet/${professionalId}`);
      return response.data; // { balance, transactions }
    } catch {
      return { balance: 0, transactions: [] };
    }
  },

  getTransactions: async (professionalId: string) => {
    try {
      const response = await apiClient.get(`/wallet/${professionalId}`);
      return response.data?.transactions || [];
    } catch {
      return [];
    }
  },

  // Backend: POST /wallet/:professionalId/recharge  body: { amount }
  recharge: async (professionalId: string, data: RechargeDto) => {
    // Convert COP to USD for backend if needed
    const amountUSD = data.currency === 'COP'
      ? data.amount * COP_TO_USD_RATE
      : data.amount;
    const response = await apiClient.post(`/wallet/${professionalId}/recharge`, {
      amount: amountUSD,
    });
    return response.data;
  },
};
