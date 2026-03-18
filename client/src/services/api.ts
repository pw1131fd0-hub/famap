import axios from 'axios';
import type { Location, SearchParams, Review, ReviewCreateDTO } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const locationApi = {
  getNearby: async (params: SearchParams): Promise<Location[]> => {
    const response = await api.get<Location[]>('/locations', { params });
    return response.data;
  },
  getById: async (id: string): Promise<Location> => {
    const response = await api.get<Location>(`/locations/${id}`);
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
