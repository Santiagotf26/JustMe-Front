import { useState, useEffect } from 'react';
import { apiClient } from '../services/api';

export interface AdminStatsDto {
  totalUsers: number;
  totalProfessionals: number;
  totalBookings: number;
  totalRevenue: number;
  commissionsCollected: number;
  activeServices: number;
}

interface AdminDashboardData {
  stats: AdminStatsDto | null;
  professionals: any[];
  transactions: any[];
  loading: boolean;
  error: string | null;
}

export function useAdminStats(): AdminDashboardData {
  const [stats, setStats] = useState<AdminStatsDto | null>(null);
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetch() {
      try {
        const [statsRes, prosRes, txRes] = await Promise.all([
          apiClient.get<AdminStatsDto>('/admin/stats'),
          apiClient.get<{ data: any[] } | any[]>('/admin/professionals?limit=4'),
          apiClient.get<{ data: any[] } | any[]>('/admin/transactions?limit=5'),
        ]);
        
        setStats(statsRes.data);
        
        const prosData = prosRes.data as any;
        const txData = txRes.data as any;
        setProfessionals(Array.isArray(prosData) ? prosData : (prosData?.data ?? []));
        setTransactions(Array.isArray(txData) ? txData : (txData?.data ?? []));
      } catch (err: any) {
        setError(err?.response?.data?.message || 'No se pudieron cargar los datos del dashboard.');
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, []);

  return { stats, professionals, transactions, loading, error };
}
