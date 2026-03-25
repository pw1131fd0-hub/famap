/**
 * Analytics Engine for FamMap
 * Provides comprehensive analytics and insights for locations
 */

export interface LocationAnalytics {
  locationId: string;
  totalReviews: number;
  averageRating: number;
  ratingDistribution: Record<number, number>;
  trendScore: number; // -1 to 1, where 1 is trending up
  visitSentiment: 'very_positive' | 'positive' | 'neutral' | 'negative' | 'very_negative';
  recommenderScore: number; // 0 to 100
  communityEngagement: number; // 0 to 100
  lastUpdated: string;
}

export interface RatingDistribution {
  [key: number]: number; // rating (1-5) -> count
}

export interface TrendData {
  period: string;
  averageRating: number;
  reviewCount: number;
}

export interface AnalyticsInsight {
  title: string;
  description: string;
  icon: string;
  value: string | number;
  type: 'positive' | 'neutral' | 'insight';
}

/**
 * Calculate rating distribution from reviews
 */
export const calculateRatingDistribution = (ratings: number[]): RatingDistribution => {
  const distribution: RatingDistribution = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };

  ratings.forEach((rating) => {
    const normalizedRating = Math.max(1, Math.min(5, Math.round(rating)));
    distribution[normalizedRating] = (distribution[normalizedRating] || 0) + 1;
  });

  return distribution;
};

/**
 * Calculate average rating from distribution
 */
export const calculateAverageRating = (ratings: number[]): number => {
  if (ratings.length === 0) return 0;
  const sum = ratings.reduce((acc, r) => acc + r, 0);
  return Math.round((sum / ratings.length) * 10) / 10;
};

/**
 * Calculate trend score based on rating changes over time
 * Returns -1 to 1, where 1 is strongly trending up
 */
export const calculateTrendScore = (trendData: TrendData[]): number => {
  if (trendData.length < 2) return 0;

  // Sort by period
  const sorted = [...trendData].sort((a, b) => a.period.localeCompare(b.period));

  // Calculate average rating for first and second half
  const midpoint = Math.floor(sorted.length / 2);
  const firstHalf = sorted.slice(0, midpoint);
  const secondHalf = sorted.slice(midpoint);

  if (firstHalf.length === 0 || secondHalf.length === 0) return 0;

  const firstHalfAvg =
    firstHalf.reduce((sum, d) => sum + d.averageRating, 0) / firstHalf.length;
  const secondHalfAvg =
    secondHalf.reduce((sum, d) => sum + d.averageRating, 0) / secondHalf.length;

  // Normalize to -1 to 1 range
  const diff = secondHalfAvg - firstHalfAvg;
  return Math.max(-1, Math.min(1, diff / 5));
};

/**
 * Determine visit sentiment based on average rating
 */
export const determineVisitSentiment = (
  averageRating: number
): 'very_positive' | 'positive' | 'neutral' | 'negative' | 'very_negative' => {
  if (averageRating >= 4.5) return 'very_positive';
  if (averageRating >= 4) return 'positive';
  if (averageRating >= 3) return 'neutral';
  if (averageRating >= 2) return 'negative';
  return 'very_negative';
};

/**
 * Calculate recommender score based on multiple factors
 * Returns 0-100 score indicating how likely this location is to be recommended
 */
export const calculateRecommenderScore = (
  averageRating: number,
  totalReviews: number,
  trendScore: number
): number => {
  // Rating component (50%)
  const ratingScore = (averageRating / 5) * 50;

  // Review count component (30%) - logarithmic scale to favor locations with some reviews
  const reviewScore = Math.min(30, (Math.log(Math.max(1, totalReviews)) / Math.log(100)) * 30);

  // Trend component (20%) - normalize trend score to 0-20
  const trendComponent = ((trendScore + 1) / 2) * 20;

  return Math.round(ratingScore + reviewScore + trendComponent);
};

/**
 * Calculate community engagement score (0-100)
 * Based on review frequency and diversity
 */
export const calculateCommunityEngagement = (
  totalReviews: number,
  ratingDistribution: RatingDistribution
): number => {
  // Review volume component (50%)
  const volumeScore = Math.min(50, Math.log(Math.max(1, totalReviews)) * 10);

  // Rating diversity component (50%) - higher diversity = more balanced engagement
  const hasMultipleRatings = Object.values(ratingDistribution).filter((v) => v > 0).length;
  const diversityScore = (hasMultipleRatings / 5) * 50;

  return Math.round(volumeScore + diversityScore);
};

/**
 * Generate analytics insights for a location
 */
export const generateAnalyticsInsights = (analytics: LocationAnalytics): AnalyticsInsight[] => {
  const insights: AnalyticsInsight[] = [];

  // Rating insight
  if (analytics.averageRating >= 4.5) {
    insights.push({
      title: 'Highly Rated',
      description: 'Families love this location',
      icon: '⭐',
      value: `${analytics.averageRating}/5`,
      type: 'positive',
    });
  } else if (analytics.averageRating < 3) {
    insights.push({
      title: 'Needs Improvement',
      description: 'Consider reading reviews for feedback',
      icon: '⚠️',
      value: `${analytics.averageRating}/5`,
      type: 'neutral',
    });
  }

  // Trend insight
  if (analytics.trendScore > 0.3) {
    insights.push({
      title: 'Rising Star',
      description: 'Ratings improving over time',
      icon: '📈',
      value: `+${(analytics.trendScore * 100).toFixed(0)}%`,
      type: 'positive',
    });
  } else if (analytics.trendScore < -0.3) {
    insights.push({
      title: 'Declining Interest',
      description: 'Ratings trending downward',
      icon: '📉',
      value: `${(analytics.trendScore * 100).toFixed(0)}%`,
      type: 'neutral',
    });
  }

  // Engagement insight
  if (analytics.communityEngagement > 70) {
    insights.push({
      title: 'Very Active Community',
      description: 'Lots of family reviews and feedback',
      icon: '👥',
      value: `${analytics.communityEngagement}%`,
      type: 'positive',
    });
  }

  // Recommendation insight
  insights.push({
    title: 'Recommendation Score',
    description: 'Based on ratings, reviews, and trends',
    icon: '🎯',
    value: `${analytics.recommenderScore}/100`,
    type: 'insight',
  });

  return insights;
};

/**
 * Analyze location quality for venue operators
 */
export const analyzeLocationQuality = (analytics: LocationAnalytics) => {
  const quality = {
    isHighQuality: analytics.averageRating >= 4,
    needsAttention: analytics.averageRating < 3.5 || analytics.totalReviews < 5,
    recommendations: [] as string[],
  };

  if (analytics.averageRating < 3.5) {
    quality.recommendations.push('Consider addressing family feedback from reviews');
  }

  if (analytics.totalReviews < 5) {
    quality.recommendations.push('Encourage more families to leave reviews');
  }

  if (analytics.trendScore < -0.2) {
    quality.recommendations.push('Analyze recent changes that may have affected ratings');
  }

  if (analytics.communityEngagement < 30) {
    quality.recommendations.push('Increase community engagement through social media');
  }

  return quality;
};

/**
 * Get location analytics recommendation text
 */
export const getAnalyticsRecommendationText = (analytics: LocationAnalytics): string => {
  if (analytics.recommenderScore >= 80) {
    return 'Highly recommended - excellent family destination';
  }
  if (analytics.recommenderScore >= 60) {
    return 'Good choice - families generally enjoy this location';
  }
  if (analytics.recommenderScore >= 40) {
    return 'Decent option - check reviews for your specific needs';
  }
  return 'May want to explore other options - consider reading reviews';
};

/**
 * Compare multiple locations analytically
 */
export const compareLocations = (
  analytics1: LocationAnalytics,
  analytics2: LocationAnalytics
): { winner: string; advantages: string[] } => {
  const advantages: string[] = [];

  if (analytics1.averageRating > analytics2.averageRating) {
    advantages.push(`Better average rating: ${analytics1.averageRating} vs ${analytics2.averageRating}`);
  }

  if (analytics1.trendScore > analytics2.trendScore) {
    advantages.push('Stronger positive trend');
  }

  if (analytics1.communityEngagement > analytics2.communityEngagement) {
    advantages.push('More active community engagement');
  }

  const winner =
    analytics1.recommenderScore > analytics2.recommenderScore ? 'first' : 'second';

  return { winner, advantages };
};
