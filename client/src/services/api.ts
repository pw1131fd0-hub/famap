import axios from 'axios';
import type { Location, SearchParams, Review, ReviewCreateDTO, LocationCreateDTO, Favorite, CrowdednessReport, CrowdednessReportCreateDTO, Event, EventCreateDTO, PaginatedLocationsResponse } from '../types';
import { saveLocations, loadLocations, clearOfflineDb } from './offlineDb';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
const REQUEST_TIMEOUT = 10000; // 10 seconds
const MAX_RETRIES = 2;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Cache for GET requests
interface CacheEntry<T = unknown> {
  data: T;
  timestamp: number;
  pending?: Promise<T>;
}

interface AxiosConfig {
  params?: unknown;
  timeout?: number;
}

const requestCache = new Map<string, CacheEntry<unknown>>();
const pendingRequests = new Map<string, Promise<unknown>>();

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT,
});

// Add request/response interceptors for better error handling
api.interceptors.response.use(
  response => response,
  error => {
    const message = (error.response?.data as { detail?: string })?.detail || error.message || 'Request failed';
    const newError = new Error(message);
    Object.assign(newError, { originalError: error });
    return Promise.reject(newError);
  }
);

// Utility to generate cache key
function getCacheKey(method: string, url: string, params?: unknown): string {
  const paramStr = params ? JSON.stringify(params) : '';
  return `${method}:${url}:${paramStr}`;
}

// Utility to check if cache is still valid
function isCacheValid(entry: CacheEntry): boolean {
  return Date.now() - entry.timestamp < CACHE_DURATION;
}

// Circuit breaker for tracking failed endpoints
const circuitBreaker = new Map<string, { failureCount: number; lastFailureTime: number }>();
const CIRCUIT_BREAKER_THRESHOLD = 3;
const CIRCUIT_BREAKER_RESET_TIME = 60000; // 1 minute

function isCircuitBreakerOpen(endpoint: string): boolean {
  const state = circuitBreaker.get(endpoint);
  if (!state) return false;

  // Reset circuit breaker after timeout
  if (Date.now() - state.lastFailureTime > CIRCUIT_BREAKER_RESET_TIME) {
    circuitBreaker.delete(endpoint);
    return false;
  }

  return state.failureCount >= CIRCUIT_BREAKER_THRESHOLD;
}

function recordFailure(endpoint: string): void {
  const state = circuitBreaker.get(endpoint) || { failureCount: 0, lastFailureTime: Date.now() };
  state.failureCount += 1;
  state.lastFailureTime = Date.now();
  circuitBreaker.set(endpoint, state);
}

function recordSuccess(endpoint: string): void {
  circuitBreaker.delete(endpoint);
}

// Utility for retryable requests with circuit breaker
async function retryableGet<T>(url: string, config?: AxiosConfig): Promise<T> {
  let lastError: Error | null = null;

  // Check circuit breaker first
  if (isCircuitBreakerOpen(url)) {
    const error = new Error(`Service temporarily unavailable (circuit breaker active for ${url})`);
    throw error;
  }

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await api.get<T>(url, config);
      recordSuccess(url);
      return response.data;
    } catch (error) {
      lastError = error as Error;
      recordFailure(url);
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
    return pendingRequests.get(key)! as Promise<T>;
  }

  // Make the request
  const promise = fetcher();
  pendingRequests.set(key, promise as Promise<unknown>);

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
    // Check in-memory cache first (L1)
    const cached = requestCache.get(cacheKey);
    if (cached && isCacheValid(cached)) {
      return cached.data as Location[];
    }
    // Check IndexedDB (L2 offline cache)
    const offlineData = await loadLocations(cacheKey);
    if (offlineData && offlineData.length > 0 && !navigator.onLine) {
      requestCache.set(cacheKey, { data: offlineData, timestamp: Date.now() });
      return offlineData;
    }
    // Fetch from network, persist to IndexedDB
    const result = await cachedGet(cacheKey, () => retryableGet<Location[]>('/locations/', { params }));
    saveLocations(cacheKey, result).catch(() => {});
    return result;
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
  getFeatured: async (limit = 10): Promise<Location[]> => {
    const cacheKey = getCacheKey('GET', '/locations/featured', { limit });
    return cachedGet(cacheKey, () =>
      retryableGet<Location[]>('/locations/featured', { params: { limit } })
    );
  },
  search: async (params: {
    q: string;
    category?: string;
    page?: number;
    page_size?: number;
  }): Promise<PaginatedLocationsResponse> => {
    const cacheKey = getCacheKey('GET', '/locations/search', params);
    return cachedGet(cacheKey, () =>
      retryableGet<PaginatedLocationsResponse>('/locations/search', { params })
    );
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
  create: async (locationId: string, event: EventCreateDTO): Promise<Event> => {
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
  clearAllCaches: async () => {
    requestCache.clear();
    await clearOfflineDb();
  },
};

// Export circuit breaker utilities for monitoring and testing
export const circuitBreakerUtils = {
  getState: (endpoint: string) => circuitBreaker.get(endpoint),
  getAllStates: () => Array.from(circuitBreaker.entries()),
  reset: (endpoint?: string) => {
    if (endpoint) {
      circuitBreaker.delete(endpoint);
    } else {
      circuitBreaker.clear();
    }
  },
  isOpen: (endpoint: string) => isCircuitBreakerOpen(endpoint),
};
