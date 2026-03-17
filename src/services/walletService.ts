import { apiClient } from './api';

export const walletService = {
  getBalance: async () => {
    const response = await apiClient.get('/wallet/balance');
    return response.data; // Expected { balance: number }
  },

  getTransactions: async () => {
    const response = await apiClient.get('/wallet/transactions');
    return response.data; // Expected array of transactions
  }
};
