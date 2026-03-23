import axios from 'axios';
import type { Location, SearchParams, Review, ReviewCreateDTO, LocationCreateDTO, Favorite, CrowdednessReport, CrowdednessReportCreateDTO, Event } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
const REQUEST_TIMEOUT = 10000; // 10 seconds
const MAX_RETRIES = 2;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Cache for GET requests
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  pending?: Promise<T>;
}

const requestCache = new Map<string, CacheEntry<any>>();
const pendingRequests = new Map<string, Promise<any>>();

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT,
});

// Add request/response interceptors for better error handling
api.interceptors.response.use(
  response => response,
  error => {
    const message = error.response?.data?.detail || error.message || 'Request failed';
    const newError = new Error(message);
    (newError as any).originalError = error;
    return Promise.reject(newError);
  }
);

// Utility to generate cache key
function getCacheKey(method: string, url: string, params?: any): string {
  const paramStr = params ? JSON.stringify(params) : '';
  return `${method}:${url}:${paramStr}`;
}

// Utility to check if cache is still valid
function isCacheValid(entry: CacheEntry<any>): boolean {
  return Date.now() - entry.timestamp < CACHE_DURATION;
}

// Utility for retryable requests
async function retryableGet<T>(url: string, config?: any): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await api.get<T>(url, config);
      return response.data;
    } catch (error) {
      lastError = error as Error;
      if (attempt < MAX_RETRIES) {
        // Exponential backoff: 100ms, 200ms, 400ms
        await new Promise(resolve => setTimeout(resolve, 100 * Math.pow(2, attempt)));
      }
    }
  }

  throw lastError;
}

// Utility for cached GET requests with deduplication
async function cachedGet<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  // Check cache first
  const cached = requestCache.get(key);
  if (cached && isCacheValid(cached)) {
    return cached.data as T;
  }

  // Check if request is already in flight (deduplication)
  if (pendingRequests.has(key)) {
    return pendingRequests.get(key)!;
  }

  // Make the request
  const promise = fetcher();
  pendingRequests.set(key, promise);

  try {
    const data = await promise;
    requestCache.set(key, {
      data,
      timestamp: Date.now(),
    });
    return data;
  } finally {
    pendingRequests.delete(key);
  }
}

export const locationApi = {
  getNearby: async (params: SearchParams): Promise<Location[]> => {
    const cacheKey = getCacheKey('GET', '/locations/', params);
    return cachedGet(cacheKey, () => retryableGet<Location[]>('/locations/', { params }));
  },
  getById: async (id: string): Promise<Location> => {
    const cacheKey = getCacheKey('GET', `/locations/${id}/`, undefined);
    return cachedGet(cacheKey, () => retryableGet<Location>(`/locations/${id}/`));
  },
  create: async (location: LocationCreateDTO): Promise<Location> => {
    // Invalidate nearby locations cache on create
    requestCache.clear();
    const response = await api.post<Location>('/locations/', location);
    return response.data;
  },
};

export const reviewApi = {
  getByLocationId: async (locationId: string): Promise<Review[]> => {
    const cacheKey = getCacheKey('GET', `/locations/${locationId}/reviews`, undefined);
    return cachedGet(cacheKey, () => retryableGet<Review[]>(`/locations/${locationId}/reviews`));
  },
  create: async (locationId: string, review: ReviewCreateDTO): Promise<Review> => {
    // Invalidate reviews cache for this location
    const reviewCacheKey = getCacheKey('GET', `/locations/${locationId}/reviews`, undefined);
    requestCache.delete(reviewCacheKey);
    const response = await api.post<Review>(`/locations/${locationId}/reviews`, review);
    return response.data;
  },
};

export const favoriteApi = {
  getFavorites: async (userId: string): Promise<Location[]> => {
    const cacheKey = getCacheKey('GET', '/favorites', { userId });
    return cachedGet(cacheKey, () => retryableGet<Location[]>('/favorites', { params: { userId } }));
  },
  add: async (userId: string, locationId: string): Promise<Favorite> => {
    // Invalidate favorites cache
    const cacheKey = getCacheKey('GET', '/favorites', { userId });
    requestCache.delete(cacheKey);
    const response = await api.post<Favorite>('/favorites', { userId, locationId });
    return response.data;
  },
  remove: async (userId: string, locationId: string): Promise<void> => {
    // Invalidate favorites cache
    const cacheKey = getCacheKey('GET', '/favorites', { userId });
    requestCache.delete(cacheKey);
    await api.delete('/favorites', { data: { userId, locationId } });
  },
  check: async (userId: string, locationId: string): Promise<boolean> => {
    const cacheKey = getCacheKey('GET', '/favorites/check', { userId, locationId });
    const data = await cachedGet(cacheKey, () =>
      retryableGet<{ isFavorited: boolean }>('/favorites/check', { params: { userId, locationId } })
    );
    return data.isFavorited;
  },
};

export const crowdinessApi = {
  getByLocationId: async (locationId: string): Promise<CrowdednessReport[]> => {
    const cacheKey = getCacheKey('GET', `/locations/${locationId}/crowdedness`, undefined);
    return cachedGet(cacheKey, () => retryableGet<CrowdednessReport[]>(`/locations/${locationId}/crowdedness`));
  },
  create: async (locationId: string, report: CrowdednessReportCreateDTO): Promise<CrowdednessReport> => {
    // Invalidate crowdedness cache for this location
    const cacheKey = getCacheKey('GET', `/locations/${locationId}/crowdedness`, undefined);
    requestCache.delete(cacheKey);
    const response = await api.post<CrowdednessReport>(`/locations/${locationId}/crowdedness`, report);
    return response.data;
  },
};

export const eventsApi = {
  getByLocationId: async (locationId: string): Promise<Event[]> => {
    const cacheKey = getCacheKey('GET', `/locations/${locationId}/events`, undefined);
    return cachedGet(cacheKey, () => retryableGet<Event[]>(`/locations/${locationId}/events`));
  },
  create: async (locationId: string, event: any): Promise<Event> => {
    // Invalidate events cache for this location
    const cacheKey = getCacheKey('GET', `/locations/${locationId}/events`, undefined);
    requestCache.delete(cacheKey);
    const response = await api.post<Event>(`/locations/${locationId}/events`, event);
    return response.data;
  },
};

// Export cache utilities for testing and debugging
export const cacheUtils = {
  clear: () => requestCache.clear(),
  getSize: () => requestCache.size,
  getCacheEntry: (key: string) => requestCache.get(key),
};
