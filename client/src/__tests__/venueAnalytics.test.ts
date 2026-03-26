import {
  calculateVenueMetrics,
  calculateFamilyDemographics,
  calculateVisitPatterns,
  calculateCompetitiveInsights,
  calculateReviewInsights,
  generateVenueAnalytics,
  type VenuePerformanceMetrics,
  type FamilyDemographics,
  type VisitPatterns,
  type CompetitiveInsight,
  type ReviewInsight,
  type VenueOperatorDashboardData,
} from '../utils/venueAnalytics';

describe('venueAnalytics', () => {
  describe('calculateVenueMetrics', () => {
    it('should calculate venue performance metrics', () => {
      const metrics = calculateVenueMetrics();

      expect(metrics).toBeDefined();
      expect(metrics.viewCount).toBeGreaterThan(0);
      expect(metrics.favoriteCount).toBeLessThanOrEqual(metrics.viewCount);
      expect(metrics.searchImpression).toBeGreaterThan(0);
      expect(metrics.reviewCount).toBeGreaterThan(0);
      expect(metrics.averageRating).toBeGreaterThanOrEqual(0);
      expect(metrics.averageRating).toBeLessThanOrEqual(5);
    });

    it('should have rating distribution that matches review count', () => {
      const metrics = calculateVenueMetrics();
      const totalRatings =
        metrics.ratingDistribution.five +
        metrics.ratingDistribution.four +
        metrics.ratingDistribution.three +
        metrics.ratingDistribution.two +
        metrics.ratingDistribution.one;

      expect(totalRatings).toBe(metrics.reviewCount);
    });

    it('should have valid rating distribution', () => {
      const metrics = calculateVenueMetrics();

      expect(metrics.ratingDistribution.five).toBeGreaterThanOrEqual(0);
      expect(metrics.ratingDistribution.four).toBeGreaterThanOrEqual(0);
      expect(metrics.ratingDistribution.three).toBeGreaterThanOrEqual(0);
      expect(metrics.ratingDistribution.two).toBeGreaterThanOrEqual(0);
      expect(metrics.ratingDistribution.one).toBeGreaterThanOrEqual(0);
    });
  });

  describe('calculateFamilyDemographics', () => {
    it('should calculate family demographics', () => {
      const demographics = calculateFamilyDemographics();

      expect(demographics).toBeDefined();
      expect(demographics.mostCommonAgeGroups).toHaveLength(4);
      expect(demographics.mostVisitedInterests.length).toBeGreaterThan(0);
      expect(demographics.accessibilityNeedsRequested.length).toBeGreaterThan(0);
    });

    it('should have valid age group percentages', () => {
      const demographics = calculateFamilyDemographics();
      const totalPercentage = demographics.mostCommonAgeGroups.reduce(
        (sum, group) => sum + group.percentage,
        0
      );

      expect(totalPercentage).toBe(100);
    });

    it('should have age groups with correct names', () => {
      const demographics = calculateFamilyDemographics();
      const ageGroups = demographics.mostCommonAgeGroups.map(g => g.ageGroup);

      expect(ageGroups).toContain('toddler');
      expect(ageGroups).toContain('preschool');
      expect(ageGroups).toContain('school-age');
      expect(ageGroups).toContain('teen');
    });

    it('should have valid budget distribution', () => {
      const demographics = calculateFamilyDemographics();
      const total =
        demographics.budgetLevelDistribution.budget +
        demographics.budgetLevelDistribution.moderate +
        demographics.budgetLevelDistribution.premium;

      expect(total).toBeGreaterThan(0);
    });
  });

  describe('calculateVisitPatterns', () => {
    it('should calculate visit patterns', () => {
      const patterns = calculateVisitPatterns();

      expect(patterns).toBeDefined();
      expect(patterns.peakDays).toHaveLength(7);
      expect(patterns.seasonalTrends.length).toBeGreaterThan(0);
      expect(patterns.peakHours).toBeDefined();
    });

    it('should have all days of week', () => {
      const patterns = calculateVisitPatterns();
      const days = patterns.peakDays.map(p => p.day);

      expect(days).toContain('Monday');
      expect(days).toContain('Tuesday');
      expect(days).toContain('Wednesday');
      expect(days).toContain('Thursday');
      expect(days).toContain('Friday');
      expect(days).toContain('Saturday');
      expect(days).toContain('Sunday');
    });

    it('should have valid view counts for each day', () => {
      const patterns = calculateVisitPatterns();

      patterns.peakDays.forEach(day => {
        expect(day.viewCount).toBeGreaterThan(0);
        if (day.avgVisitTime !== undefined) {
          expect(day.avgVisitTime).toBeGreaterThan(0);
        }
      });
    });

    it('should have valid seasonal trend data', () => {
      const patterns = calculateVisitPatterns();

      patterns.seasonalTrends.forEach(trend => {
        expect(['increasing', 'stable', 'decreasing']).toContain(trend.trend);
        expect(trend.viewCount).toBeGreaterThan(0);
        expect(trend.reviewCount).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('calculateCompetitiveInsights', () => {
    it('should calculate competitive insights', () => {
      const insights = calculateCompetitiveInsights(5, 75);

      expect(insights).toBeDefined();
      expect(insights.categoryRank).toBe(5);
      expect(insights.ratingPercentile).toBe(75);
      expect(insights.categoryTotal).toBeGreaterThan(0);
      expect(insights.volumePercentile).toBeGreaterThanOrEqual(0);
      expect(insights.volumePercentile).toBeLessThanOrEqual(100);
    });

    it('should have strengths and improvement areas', () => {
      const insights = calculateCompetitiveInsights(5, 75);

      expect(insights.strengths.length).toBeGreaterThan(0);
      expect(insights.improvementAreas.length).toBeGreaterThan(0);
    });

    it('should have valid percentile values', () => {
      const insights = calculateCompetitiveInsights(5, 75);

      expect(insights.ratingPercentile).toBeGreaterThanOrEqual(0);
      expect(insights.ratingPercentile).toBeLessThanOrEqual(100);
      expect(insights.volumePercentile).toBeGreaterThanOrEqual(0);
      expect(insights.volumePercentile).toBeLessThanOrEqual(100);
    });
  });

  describe('calculateReviewInsights', () => {
    it('should calculate review insights', () => {
      const insights = calculateReviewInsights(50);

      expect(insights).toBeDefined();
      expect(insights.totalReviews).toBe(50);
      expect(insights.recentReviews.length).toBeGreaterThan(0);
      expect(insights.commonThemes.length).toBeGreaterThan(0);
      expect(insights.responseRate).toBeGreaterThanOrEqual(0);
      expect(insights.responseRate).toBeLessThanOrEqual(1);
    });

    it('should have valid review data', () => {
      const insights = calculateReviewInsights(50);

      insights.recentReviews.forEach(review => {
        expect(review.id).toBeDefined();
        expect(review.rating).toBeGreaterThanOrEqual(1);
        expect(review.rating).toBeLessThanOrEqual(5);
        expect(review.comment).toBeDefined();
        expect(review.date).toBeDefined();
        expect(review.tags).toBeDefined();
        expect(review.responded).toBeDefined();
      });
    });

    it('should have valid theme data', () => {
      const insights = calculateReviewInsights(50);

      insights.commonThemes.forEach(theme => {
        expect(theme.theme).toBeDefined();
        expect(theme.frequency).toBeGreaterThanOrEqual(0);
        expect(['positive', 'mixed', 'negative']).toContain(theme.sentiment);
      });
    });
  });

  describe('generateVenueAnalytics', () => {
    it('should generate complete analytics dashboard data', () => {
      const analytics = generateVenueAnalytics(
        'venue_1',
        { zh: '公園', en: 'Park' },
        'claimed'
      );

      expect(analytics).toBeDefined();
      expect(analytics.venue.venueId).toBe('venue_1');
      expect(analytics.metrics).toBeDefined();
      expect(analytics.demographics).toBeDefined();
      expect(analytics.visitPatterns).toBeDefined();
      expect(analytics.competitive).toBeDefined();
      expect(analytics.reviews).toBeDefined();
    });

    it('should have valid venue data', () => {
      const analytics = generateVenueAnalytics(
        'venue_1',
        { zh: '公園', en: 'Park' },
        'claimed'
      );

      expect(analytics.venue.venueName.zh).toBe('公園');
      expect(analytics.venue.venueName.en).toBe('Park');
      expect(analytics.venue.claimStatus).toBe('claimed');
      expect(analytics.venue.claimedBy).toBeDefined();
    });

    it('should generate unclaimed venue correctly', () => {
      const analytics = generateVenueAnalytics(
        'venue_1',
        { zh: '公園', en: 'Park' },
        'unclaimed'
      );

      expect(analytics.venue.claimStatus).toBe('unclaimed');
      expect(analytics.venue.claimedBy).toBeUndefined();
    });

    it('should have consistent data across all sections', () => {
      const analytics = generateVenueAnalytics(
        'venue_1',
        { zh: '公園', en: 'Park' }
      );

      expect(analytics.lastUpdated).toBeDefined();
      expect(new Date(analytics.lastUpdated)).toBeInstanceOf(Date);
      expect(analytics.metrics.reviewCount).toBeGreaterThan(0);
      expect(analytics.reviews.totalReviews).toBe(analytics.metrics.reviewCount);
    });

    it('should calculate correct rating percentile', () => {
      const analytics = generateVenueAnalytics(
        'venue_1',
        { zh: '公園', en: 'Park' }
      );

      const expectedPercentile = Math.round(
        (analytics.metrics.averageRating / 5) * 100
      );
      expect(analytics.competitive.ratingPercentile).toBe(expectedPercentile);
    });
  });

  describe('Type correctness', () => {
    it('should return properly typed metrics', () => {
      const metrics = calculateVenueMetrics();
      const typedMetrics: VenuePerformanceMetrics = metrics;

      expect(typedMetrics.viewCount).toBeGreaterThan(0);
    });

    it('should return properly typed demographics', () => {
      const demographics = calculateFamilyDemographics();
      const typedDemographics: FamilyDemographics = demographics;

      expect(typedDemographics.mostCommonAgeGroups).toBeDefined();
    });

    it('should return properly typed patterns', () => {
      const patterns = calculateVisitPatterns();
      const typedPatterns: VisitPatterns = patterns;

      expect(typedPatterns.peakDays).toHaveLength(7);
    });

    it('should return properly typed insights', () => {
      const insights = calculateCompetitiveInsights(5, 75);
      const typedInsights: CompetitiveInsight = insights;

      expect(typedInsights.categoryRank).toBe(5);
    });

    it('should return properly typed review insights', () => {
      const insights = calculateReviewInsights(50);
      const typedInsights: ReviewInsight = insights;

      expect(typedInsights.totalReviews).toBe(50);
    });

    it('should return properly typed complete analytics', () => {
      const analytics = generateVenueAnalytics(
        'venue_1',
        { zh: '公園', en: 'Park' }
      );
      const typedAnalytics: VenueOperatorDashboardData = analytics;

      expect(typedAnalytics.venue).toBeDefined();
      expect(typedAnalytics.metrics).toBeDefined();
    });
  });

  describe('Edge cases', () => {
    it('should handle zero reviews gracefully', () => {
      const insights = calculateReviewInsights(0);

      expect(insights.totalReviews).toBe(0);
      expect(insights.responseRate).toBeGreaterThanOrEqual(0);
    });

    it('should handle edge case percentiles', () => {
      const insights1 = calculateCompetitiveInsights(1, 0);
      expect(insights1.ratingPercentile).toBe(0);

      const insights100 = calculateCompetitiveInsights(1, 100);
      expect(insights100.ratingPercentile).toBe(100);
    });

    it('should generate stable analytics for same venue', () => {
      const analytics1 = generateVenueAnalytics(
        'venue_1',
        { zh: '公園', en: 'Park' }
      );
      const analytics2 = generateVenueAnalytics(
        'venue_1',
        { zh: '公園', en: 'Park' }
      );

      // Different instances should have different random data
      // but same venue ID should be used
      expect(analytics1.venue.venueId).toBe(analytics2.venue.venueId);
      expect(analytics1.venue.venueName).toEqual(analytics2.venue.venueName);
    });
  });
});
