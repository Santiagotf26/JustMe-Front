import { useState, useEffect } from 'react';
import { apiClient } from '../services/api';

export interface Booking {
  id: string | number;
  status: string;
  professionalName: string;
  professionalAvatar?: string;
  service: string;
  date: string;
  time: string;
  price: number;
  locationType: string;
}

export function useBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBookings() {
      try {
        const response = await apiClient.get('/bookings');
        
        // El endpoint devuelve arreglo o objeto con data.
        const rawData = Array.isArray(response.data) ? response.data : (response.data?.data || []);
        
        const mapped: Booking[] = rawData.map((item: any) => {
          const dateObj = new Date(item.scheduledAt || item.date || new Date());
          return {
            id: item.id,
            status: item.status || 'pending',
            professionalName: item.professional?.user?.name 
                ? `${item.professional.user.name} ${item.professional.user.lastName || ''}`.trim() 
                : 'Profesional',
            professionalAvatar: item.professional?.user?.avatar,
            service: item.service?.name || 'Servicio',
            date: dateObj.toISOString(),
            time: dateObj.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
            price: item.price ? parseFloat(item.price) : 0,
            locationType: 'home' // Default por mock visual
          };
        });
        
        setBookings(mapped);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Error al obtener tus citas.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchBookings();
  }, []);

  return { bookings, loading, error };
}
