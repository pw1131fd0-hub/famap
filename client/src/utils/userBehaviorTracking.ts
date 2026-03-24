/**
 * User Behavior Tracking & Analytics
 * Tracks user interactions for personalized recommendations
 */

export interface UserInteraction {
  timestamp: number;
  type: 'view' | 'click' | 'search' | 'favorite' | 'review' | 'filter';
  target: string; // location ID or category
  metadata?: Record<string, unknown>;
}

export interface UserBehaviorProfile {
  favoriteCategories: Record<string, number>;
  searchPatterns: string[];
  viewedLocations: string[];
  interactionCount: number;
  averageSessionDuration: number;
  lastActiveTime: number;
  preferredSearchRadius: number;
}

const STORAGE_KEY = 'fammap_behavior_profile';
const INTERACTIONS_LOG_KEY = 'fammap_interactions_log';
const MAX_INTERACTIONS_STORED = 100; // Store recent interactions
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

class UserBehaviorTracker {
  private interactions: UserInteraction[] = [];
  private sessionStartTime = Date.now();
  private lastActivityTime = Date.now();

  constructor() {
    this.loadInteractions();
  }

  /**
   * Load previous interactions from localStorage
   */
  private loadInteractions(): void {
    try {
      const saved = localStorage.getItem(INTERACTIONS_LOG_KEY);
      if (saved) {
        this.interactions = JSON.parse(saved);
      }
    } catch {
      // Use empty interactions
      this.interactions = [];
    }
  }

  /**
   * Save interactions to localStorage
   */
  private saveInteractions(): void {
    try {
      // Keep only recent interactions
      const recentInteractions = this.interactions.slice(-MAX_INTERACTIONS_STORED);
      localStorage.setItem(INTERACTIONS_LOG_KEY, JSON.stringify(recentInteractions));
    } catch {
      // Silently fail
    }
  }

  /**
   * Track a user interaction
   */
  trackInteraction(
    type: UserInteraction['type'],
    target: string,
    metadata?: Record<string, unknown>
  ): void {
    this.lastActivityTime = Date.now();

    const interaction: UserInteraction = {
      timestamp: Date.now(),
      type,
      target,
      metadata
    };

    this.interactions.push(interaction);
    this.saveInteractions();
  }

  /**
   * Get user behavior profile
   */
  getBehaviorProfile(): UserBehaviorProfile {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Use default profile
    }

    return this.generateProfile();
  }

  /**
   * Generate behavior profile from interactions
   */
  private generateProfile(): UserBehaviorProfile {
    const favoriteCategories: Record<string, number> = {};
    const viewedLocations = new Set<string>();
    const searches: string[] = [];

    // Analyze recent interactions (last 100)
    const recentInteractions = this.interactions.slice(-100);

    for (const interaction of recentInteractions) {
      switch (interaction.type) {
        case 'view':
          viewedLocations.add(interaction.target);
          // Extract category from metadata if available
          if (interaction.metadata?.category) {
            const cat = interaction.metadata.category as string;
            favoriteCategories[cat] = (favoriteCategories[cat] || 0) + 1;
          }
          break;
        case 'search':
          if (interaction.metadata?.query) {
            searches.push(interaction.metadata.query as string);
          }
          break;
        case 'favorite':
          favoriteCategories['favorite'] = (favoriteCategories['favorite'] || 0) + 1;
          break;
        case 'filter':
          if (interaction.metadata?.category) {
            const cat = interaction.metadata.category as string;
            favoriteCategories[cat] = (favoriteCategories[cat] || 0) + 2; // Weight filters more
          }
          break;
      }
    }

    const sessionDuration = Date.now() - this.sessionStartTime;

    const profile: UserBehaviorProfile = {
      favoriteCategories,
      searchPatterns: [...new Set(searches)], // Unique searches
      viewedLocations: Array.from(viewedLocations),
      interactionCount: this.interactions.length,
      averageSessionDuration: sessionDuration,
      lastActiveTime: this.lastActivityTime,
      preferredSearchRadius: this.getPreferredSearchRadius()
    };

    this.saveProfile(profile);
    return profile;
  }

  /**
   * Infer preferred search radius from user interactions
   */
  private getPreferredSearchRadius(): number {
    const radiusUsages: Record<number, number> = {};

    for (const interaction of this.interactions) {
      if (interaction.type === 'search' && interaction.metadata?.radius) {
        const radius = interaction.metadata.radius as number;
        radiusUsages[radius] = (radiusUsages[radius] || 0) + 1;
      }
    }

    // Return most common radius, or default
    const mostCommon = Object.entries(radiusUsages).sort((a, b) => b[1] - a[1])[0];
    return mostCommon ? parseInt(mostCommon[0], 10) : 2000; // Default 2km
  }

  /**
   * Save profile to localStorage
   */
  private saveProfile(profile: UserBehaviorProfile): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch {
      // Silently fail
    }
  }

  /**
   * Get most viewed categories
   */
  getTopCategories(limit: number = 3): string[] {
    const profile = this.getBehaviorProfile();
    return Object.entries(profile.favoriteCategories)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([cat]) => cat);
  }

  /**
   * Get recommended search terms based on history
   */
  getRecommendedSearchTerms(limit: number = 5): string[] {
    const profile = this.getBehaviorProfile();
    return profile.searchPatterns.slice(0, limit);
  }

  /**
   * Check if user is in an active session
   */
  isActiveSession(): boolean {
    const timeSinceLastActivity = Date.now() - this.lastActivityTime;
    return timeSinceLastActivity < SESSION_TIMEOUT;
  }

  /**
   * Get session duration in minutes
   */
  getSessionDurationMinutes(): number {
    const duration = Date.now() - this.sessionStartTime;
    return Math.round(duration / (1000 * 60));
  }

  /**
   * Reset behavior tracking (for testing or user preference)
   */
  resetBehavior(): void {
    try {
      localStorage.removeItem(INTERACTIONS_LOG_KEY);
      localStorage.removeItem(STORAGE_KEY);
      this.interactions = [];
      this.sessionStartTime = Date.now();
      this.lastActivityTime = Date.now();
    } catch {
      // Silently fail
    }
  }

  /**
   * Get interaction history (for debugging)
   */
  getInteractionHistory(limit: number = 20): UserInteraction[] {
    return this.interactions.slice(-limit);
  }

  /**
   * Export behavior data
   */
  exportBehaviorData(): {
    profile: UserBehaviorProfile;
    interactions: UserInteraction[];
    exportedAt: number;
  } {
    return {
      profile: this.getBehaviorProfile(),
      interactions: this.interactions,
      exportedAt: Date.now()
    };
  }
}

export const userBehaviorTracker = new UserBehaviorTracker();
