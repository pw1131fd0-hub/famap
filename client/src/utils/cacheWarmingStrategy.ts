/**
 * Cache Warming Strategy
 * Implements predictive caching for common locations and patterns
 */

export interface CacheWarmingConfig {
  enabled: boolean;
  warmOnLoad: boolean;
  popularLocationsEnabled: boolean;
  nearbyLocationsEnabled: boolean;
  categoryPreloadEnabled: boolean;
}

export interface CacheStrategy {
  name: string;
  priority: number; // Higher = more important
  predicate: () => boolean; // When should we warm?
  queries: Array<{ endpoint: string; params: Record<string, unknown> }>;
}

const DEFAULT_CONFIG: CacheWarmingConfig = {
  enabled: true,
  warmOnLoad: true,
  popularLocationsEnabled: true,
  nearbyLocationsEnabled: true,
  categoryPreloadEnabled: true
};

class CacheWarmingManager {
  private config: CacheWarmingConfig = DEFAULT_CONFIG;
  private warmingInProgress = false;
  private lastWarmTime = 0;
  private warmingInterval = 5 * 60 * 1000; // 5 minutes between warming

  constructor() {
    this.loadConfig();
  }

  /**
   * Load configuration from localStorage
   */
  private loadConfig(): void {
    try {
      const saved = localStorage.getItem('cacheWarmingConfig');
      if (saved) {
        this.config = { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
      }
    } catch {
      // Use default config
    }
  }

  /**
   * Save configuration to localStorage
   */
  private saveConfig(): void {
    try {
      localStorage.setItem('cacheWarmingConfig', JSON.stringify(this.config));
    } catch {
      // Silently fail
    }
  }

  /**
   * Set configuration
   */
  setConfig(config: Partial<CacheWarmingConfig>): void {
    this.config = { ...this.config, ...config };
    this.saveConfig();
  }

  /**
   * Get current configuration
   */
  getConfig(): CacheWarmingConfig {
    return { ...this.config };
  }

  /**
   * Check if warming should occur
   */
  shouldWarm(): boolean {
    if (!this.config.enabled) return false;
    if (this.warmingInProgress) return false;

    const timeSinceLastWarm = Date.now() - this.lastWarmTime;
    return timeSinceLastWarm >= this.warmingInterval;
  }

  /**
   * Generate cache warming strategies based on user behavior
   */
  generateStrategies(userLocation?: { lat: number; lng: number }): CacheStrategy[] {
    const strategies: CacheStrategy[] = [];

    // Popular locations strategy
    if (this.config.popularLocationsEnabled) {
      strategies.push({
        name: 'Popular Locations',
        priority: 1,
        predicate: () => true,
        queries: [
          {
            endpoint: '/api/locations',
            params: { sort_by: 'rating', limit: 20 }
          }
        ]
      });
    }

    // Nearby locations strategy
    if (this.config.nearbyLocationsEnabled && userLocation) {
      strategies.push({
        name: 'Nearby Locations',
        priority: 2,
        predicate: () => !!userLocation,
        queries: [
          {
            endpoint: '/api/locations',
            params: {
              lat: userLocation.lat,
              lng: userLocation.lng,
              radius: 2000,
              limit: 50
            }
          }
        ]
      });
    }

    // Category preload strategy
    if (this.config.categoryPreloadEnabled) {
      const categories = ['park', 'nursing_room', 'restaurant', 'medical'];
      strategies.push({
        name: 'Category Preload',
        priority: 3,
        predicate: () => true,
        queries: categories.map(cat => ({
          endpoint: '/api/locations',
          params: { category: cat, limit: 10 }
        }))
      });
    }

    // Sort by priority
    return strategies.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Mark warming as in progress
   */
  markWarmingInProgress(): void {
    this.warmingInProgress = true;
  }

  /**
   * Mark warming as complete
   */
  markWarmingComplete(): void {
    this.warmingInProgress = false;
    this.lastWarmTime = Date.now();
  }

  /**
   * Get remaining time until next warming
   */
  getTimeUntilNextWarm(): number {
    const timeSinceLastWarm = Date.now() - this.lastWarmTime;
    const remaining = Math.max(0, this.warmingInterval - timeSinceLastWarm);
    return remaining;
  }
}

export const cacheWarmingManager = new CacheWarmingManager();

/**
 * Hook to enable cache warming (use in App component)
 */
export async function initializeCacheWarming(
  fetcher: (endpoint: string, params: Record<string, unknown>) => Promise<void>,
  userLocation?: { lat: number; lng: number }
): Promise<void> {
  if (!cacheWarmingManager.shouldWarm()) {
    return;
  }

  cacheWarmingManager.markWarmingInProgress();

  try {
    const strategies = cacheWarmingManager.generateStrategies(userLocation);

    for (const strategy of strategies) {
      if (!strategy.predicate()) continue;

      for (const query of strategy.queries) {
        try {
          await fetcher(query.endpoint, query.params);
          // Add small delay between requests to avoid overwhelming the server
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch {
          // Silently fail for individual cache warming requests
        }
      }
    }
  } finally {
    cacheWarmingManager.markWarmingComplete();
  }
}
