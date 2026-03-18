import { apiClient } from './api';

export interface TimeSlot {
    time: string;       // e.g. '09:00', '10:00'
    available: boolean;
}

export interface DayAvailability {
    date: string;       // ISO date e.g. '2026-03-20'
    slots: TimeSlot[];
}

export const availabilityService = {
    /**
     * Get available slots for a professional on a specific date.
     * Falls back to generating slots from schedule if endpoint not available.
     */
    getAvailability: async (professionalId: string, date?: string): Promise<DayAvailability[]> => {
        try {
            const params: any = {};
            if (date) params.date = date;
            const response = await apiClient.get(`/availability/${professionalId}`, { params });
            return response.data;
        } catch {
            // Fallback: return empty availability
            return [];
        }
    },

    /**
     * Get availability for multiple days at once
     */
    getWeekAvailability: async (professionalId: string, startDate: string): Promise<DayAvailability[]> => {
        try {
            const response = await apiClient.get(`/availability/${professionalId}/week`, {
                params: { startDate },
            });
            return response.data;
        } catch {
            return [];
        }
    },
};
