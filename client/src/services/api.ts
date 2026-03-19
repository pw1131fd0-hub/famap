import axios from 'axios';
import type { Location, SearchParams, Review, ReviewCreateDTO, LocationCreateDTO } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const locationApi = {
  getNearby: async (params: SearchParams): Promise<Location[]> => {
    const response = await api.get<Location[]>('/locations/', { params });
    return response.data;
  },
  getById: async (id: string): Promise<Location> => {
    const response = await api.get<Location>(`/locations/${id}/`);
    return response.data;
  },
  create: async (location: LocationCreateDTO): Promise<Location> => {
    const response = await api.post<Location>('/locations/', location);
    return response.data;
  },
};

export const reviewApi = {
  getByLocationId: async (locationId: string): Promise<Review[]> => {
    const response = await api.get<Review[]>(`/locations/${locationId}/reviews`);
    return response.data;
  },
  create: async (locationId: string, review: ReviewCreateDTO): Promise<Review> => {
    const response = await api.post<Review>(`/locations/${locationId}/reviews`, review);
    return response.data;
  },
};

export const favoriteApi = {
  getFavorites: async (userId: string): Promise<Location[]> => {
    const response = await api.get<Location[]>('/favorites', { params: { userId } });
    return response.data;
  },
  add: async (userId: string, locationId: string): Promise<any> => {
    const response = await api.post('/favorites', { userId, locationId });
    return response.data;
  },
  remove: async (userId: string, locationId: string): Promise<void> => {
    await api.delete('/favorites', { data: { userId, locationId } });
  },
  check: async (userId: string, locationId: string): Promise<boolean> => {
    const response = await api.get<{ isFavorited: boolean }>('/favorites/check', { params: { userId, locationId } });
    return response.data.isFavorited;
  },
};
