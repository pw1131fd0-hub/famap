import {
  calculateRatingDistribution,
  calculateAverageRating,
  calculateTrendScore,
  determineVisitSentiment,
  calculateRecommenderScore,
  calculateCommunityEngagement,
  generateAnalyticsInsights,
  analyzeLocationQuality,
  getAnalyticsRecommendationText,
  compareLocations,
  type LocationAnalytics,
  type TrendData,
} from '../utils/analyticsEngine';

describe('Analytics Engine', () => {
  describe('calculateRatingDistribution', () => {
    it('should calculate rating distribution from ratings array', () => {
      const ratings = [5, 5, 4, 4, 4, 3, 2];
      const distribution = calculateRatingDistribution(ratings);

      expect(distribution[5]).toBe(2);
      expect(distribution[4]).toBe(3);
      expect(distribution[3]).toBe(1);
      expect(distribution[2]).toBe(1);
      expect(distribution[1]).toBe(0);
    });

    it('should handle empty array', () => {
      const distribution = calculateRatingDistribution([]);
      expect(Object.values(distribution)).toEqual([0, 0, 0, 0, 0]);
    });

    it('should normalize out-of-range ratings', () => {
      const ratings = [0, 1, 6, 10];
      const distribution = calculateRatingDistribution(ratings);

      expect(distribution[1]).toBe(2); // 0 and 1 normalized to 1
      expect(distribution[5]).toBe(2); // 6 and 10 normalized to 5
    });
  });

  describe('calculateAverageRating', () => {
    it('should calculate correct average rating', () => {
      const ratings = [5, 4, 3, 2, 1];
      const average = calculateAverageRating(ratings);
      expect(average).toBe(3);
    });

    it('should return 0 for empty array', () => {
      const average = calculateAverageRating([]);
      expect(average).toBe(0);
    });

    it('should round to one decimal place', () => {
      const ratings = [5, 5, 4];
      const average = calculateAverageRating(ratings);
      expect(average).toBe(4.7);
    });
  });

  describe('calculateTrendScore', () => {
    it('should identify positive trend', () => {
      const trendData: TrendData[] = [
        { period: '2026-01-01', averageRating: 3.5, reviewCount: 10 },
        { period: '2026-02-01', averageRating: 4.5, reviewCount: 15 },
      ];
      const trend = calculateTrendScore(trendData);
      expect(trend).toBeGreaterThan(0);
    });

    it('should identify negative trend', () => {
      const trendData: TrendData[] = [
        { period: '2026-01-01', averageRating: 4.5, reviewCount: 10 },
        { period: '2026-02-01', averageRating: 3.5, reviewCount: 15 },
      ];
      const trend = calculateTrendScore(trendData);
      expect(trend).toBeLessThan(0);
    });

    it('should return 0 for insufficient data', () => {
      const trendData: TrendData[] = [
        { period: '2026-01-01', averageRating: 4, reviewCount: 10 },
      ];
      const trend = calculateTrendScore(trendData);
      expect(trend).toBe(0);
    });
  });

  describe('determineVisitSentiment', () => {
    it('should determine very positive sentiment', () => {
      expect(determineVisitSentiment(4.8)).toBe('very_positive');
    });

    it('should determine positive sentiment', () => {
      expect(determineVisitSentiment(4.2)).toBe('positive');
    });

    it('should determine neutral sentiment', () => {
      expect(determineVisitSentiment(3.5)).toBe('neutral');
    });

    it('should determine negative sentiment', () => {
      expect(determineVisitSentiment(2.5)).toBe('negative');
    });

    it('should determine very negative sentiment', () => {
      expect(determineVisitSentiment(1.5)).toBe('very_negative');
    });
  });

  describe('calculateRecommenderScore', () => {
    it('should calculate perfect score', () => {
      const score = calculateRecommenderScore(5, 100, 1);
      expect(score).toBe(100);
    });

    it('should calculate zero score', () => {
      const score = calculateRecommenderScore(0, 0, -1);
      expect(score).toBe(0);
    });

    it('should be between 0 and 100', () => {
      const score = calculateRecommenderScore(3.5, 50, 0.2);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });
  });

  describe('calculateCommunityEngagement', () => {
    it('should calculate high engagement for many reviews', () => {
      const engagement = calculateCommunityEngagement(100, { 1: 10, 2: 10, 3: 20, 4: 30, 5: 30 });
      expect(engagement).toBeGreaterThan(50);
    });

    it('should calculate low engagement for few reviews', () => {
      const engagement = calculateCommunityEngagement(1, { 1: 0, 2: 0, 3: 0, 4: 0, 5: 1 });
      expect(engagement).toBeLessThan(50);
    });

    it('should reward rating diversity', () => {
      const diverse = calculateCommunityEngagement(50, { 1: 10, 2: 10, 3: 10, 4: 10, 5: 10 });
      const homogeneous = calculateCommunityEngagement(50, { 1: 0, 2: 0, 3: 0, 4: 0, 5: 50 });
      expect(diverse).toBeGreaterThan(homogeneous);
    });
  });

  describe('generateAnalyticsInsights', () => {
    const mockAnalytics: LocationAnalytics = {
      locationId: 'loc-1',
      totalReviews: 50,
      averageRating: 4.5,
      ratingDistribution: { 1: 0, 2: 0, 3: 5, 4: 25, 5: 20 },
      trendScore: 0.5,
      visitSentiment: 'very_positive',
      recommenderScore: 85,
      communityEngagement: 75,
      lastUpdated: '2026-03-25',
    };

    it('should generate insights for high rated location', () => {
      const insights = generateAnalyticsInsights(mockAnalytics);
      expect(insights.length).toBeGreaterThan(0);
      expect(insights.some((i) => i.title === 'Highly Rated')).toBe(true);
    });

    it('should always include recommendation score insight', () => {
      const insights = generateAnalyticsInsights(mockAnalytics);
      expect(insights.some((i) => i.title === 'Recommendation Score')).toBe(true);
    });
  });

  describe('analyzeLocationQuality', () => {
    it('should identify high quality location', () => {
      const analytics: LocationAnalytics = {
        locationId: 'loc-1',
        totalReviews: 50,
        averageRating: 4.5,
        ratingDistribution: { 1: 0, 2: 0, 3: 5, 4: 25, 5: 20 },
        trendScore: 0.2,
        visitSentiment: 'very_positive',
        recommenderScore: 85,
        communityEngagement: 75,
        lastUpdated: '2026-03-25',
      };

      const quality = analyzeLocationQuality(analytics);
      expect(quality.isHighQuality).toBe(true);
    });

    it('should provide recommendations for low rated locations', () => {
      const analytics: LocationAnalytics = {
        locationId: 'loc-1',
        totalReviews: 2,
        averageRating: 2.5,
        ratingDistribution: { 1: 1, 2: 1, 3: 0, 4: 0, 5: 0 },
        trendScore: -0.3,
        visitSentiment: 'negative',
        recommenderScore: 25,
        communityEngagement: 10,
        lastUpdated: '2026-03-25',
      };

      const quality = analyzeLocationQuality(analytics);
      expect(quality.needsAttention).toBe(true);
      expect(quality.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('getAnalyticsRecommendationText', () => {
    it('should provide highly recommended text', () => {
      const analytics: LocationAnalytics = {
        locationId: 'loc-1',
        totalReviews: 50,
        averageRating: 4.5,
        ratingDistribution: { 1: 0, 2: 0, 3: 5, 4: 25, 5: 20 },
        trendScore: 0.2,
        visitSentiment: 'very_positive',
        recommenderScore: 85,
        communityEngagement: 75,
        lastUpdated: '2026-03-25',
      };

      const text = getAnalyticsRecommendationText(analytics);
      expect(text).toContain('Highly recommended');
    });

    it('should provide exploratory text for low scores', () => {
      const analytics: LocationAnalytics = {
        locationId: 'loc-1',
        totalReviews: 2,
        averageRating: 2.5,
        ratingDistribution: { 1: 1, 2: 1, 3: 0, 4: 0, 5: 0 },
        trendScore: -0.3,
        visitSentiment: 'negative',
        recommenderScore: 25,
        communityEngagement: 10,
        lastUpdated: '2026-03-25',
      };

      const text = getAnalyticsRecommendationText(analytics);
      expect(text).toContain('explore other options');
    });
  });

  describe('compareLocations', () => {
    it('should identify location with higher recommender score', () => {
      const analytics1: LocationAnalytics = {
        locationId: 'loc-1',
        totalReviews: 50,
        averageRating: 4.5,
        ratingDistribution: { 1: 0, 2: 0, 3: 5, 4: 25, 5: 20 },
        trendScore: 0.2,
        visitSentiment: 'very_positive',
        recommenderScore: 85,
        communityEngagement: 75,
        lastUpdated: '2026-03-25',
      };

      const analytics2: LocationAnalytics = {
        locationId: 'loc-2',
        totalReviews: 30,
        averageRating: 3.5,
        ratingDistribution: { 1: 0, 2: 5, 3: 10, 4: 10, 5: 5 },
        trendScore: 0,
        visitSentiment: 'neutral',
        recommenderScore: 55,
        communityEngagement: 50,
        lastUpdated: '2026-03-25',
      };

      const comparison = compareLocations(analytics1, analytics2);
      expect(comparison.winner).toBe('first');
      expect(comparison.advantages.length).toBeGreaterThan(0);
    });
  });
});
