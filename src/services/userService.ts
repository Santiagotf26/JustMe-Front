import { apiClient } from './api';

export interface UpdateUserProfileDto {
  name?: string;
  phone?: string;
  photoUrl?: string;
}

export const userService = {
  updateProfile: async (id: string, data: UpdateUserProfileDto) => {
    const response = await apiClient.patch(`/users/${id}`, data);
    return response.data;
  },

  getProfile: async (id: string) => {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  }
};
