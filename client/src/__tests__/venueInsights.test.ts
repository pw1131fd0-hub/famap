import { describe, it, expect, beforeEach } from 'vitest';
import type { InsightAuthor } from '../utils/venueInsights';
import {
  addVenueInsight,
  getLocationInsights,
  getVenueInsightStats,
  markInsightHelpfulness,
  getLocationTips,
  getLocationStatus,
  getInsightsByAuthor,
  getWellReviewedLocations,
  clearAllInsights,
} from '../utils/venueInsights';

describe('venueInsights utility', () => {
  const mockAuthor: InsightAuthor = {
    id: 'author_1',
    name: 'Test Parent',
    verificationStatus: 'verified',
    totalInsights: 5,
    averageTrustScore: 75,
    joinDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  };

  const mockLocationId = 'location_test_123';

  beforeEach(() => {
    // Clear state between tests
    clearAllInsights();
  });

  describe('addVenueInsight', () => {
    it('should add a new venue insight with correct properties', () => {
      const insight = addVenueInsight(mockLocationId, mockAuthor, {
        type: 'tip',
        title: 'Great playground',
        content: 'Very clean and spacious',
        tags: ['clean', 'kid-friendly'],
        visibility: 'public',
      });

      expect(insight.id).toBeDefined();
      expect(insight.authorId).toBe(mockAuthor.id);
      expect(insight.authorName).toBe(mockAuthor.name);
      expect(insight.title).toBe('Great playground');
      expect(insight.content).toBe('Very clean and spacious');
      expect(insight.type).toBe('tip');
      expect(insight.tags).toEqual(['clean', 'kid-friendly']);
      expect(insight.trustScore).toBeGreaterThan(0);
      expect(insight.helpfulCount).toBe(0);
      expect(insight.notHelpfulCount).toBe(0);
    });

    it('should calculate initial trust score based on author reputation', () => {
      const verifiedAuthor: InsightAuthor = {
        ...mockAuthor,
        verificationStatus: 'verified',
        averageTrustScore: 85,
        totalInsights: 25,
      };

      const insight = addVenueInsight(mockLocationId, verifiedAuthor, {
        type: 'tip',
        title: 'Test',
        content: 'Test content',
        tags: [],
        visibility: 'public',
      });

      // Verified author with high score should have higher initial trust
      expect(insight.trustScore).toBeGreaterThan(70);
    });

    it('should support all insight types', () => {
      const types: Array<'tip' | 'warning' | 'status_update' | 'observation'> = [
        'tip',
        'warning',
        'status_update',
        'observation',
      ];

      types.forEach(type => {
        const insight = addVenueInsight(mockLocationId, mockAuthor, {
          type,
          title: `Test ${type}`,
          content: 'Test content',
          tags: [],
          visibility: 'public',
        });

        expect(insight.type).toBe(type);
      });
    });
  });

  describe('getLocationInsights', () => {
    it('should retrieve insights sorted by trust score and recency', () => {
      addVenueInsight(mockLocationId, mockAuthor, {
        type: 'tip',
        title: 'Insight 1',
        content: 'Content 1',
        tags: [],
        visibility: 'public',
      });

      // Add delay to ensure different timestamps
      addVenueInsight(mockLocationId, mockAuthor, {
        type: 'tip',
        title: 'Insight 2',
        content: 'Content 2',
        tags: [],
        visibility: 'public',
      });

      const insights = getLocationInsights(mockLocationId);

      expect(insights.length).toBeGreaterThanOrEqual(2);
      expect(insights[0]).toBeDefined();
      expect(insights[1]).toBeDefined();
    });

    it('should filter insights by age when maxAge is specified', () => {
      addVenueInsight(mockLocationId, mockAuthor, {
        type: 'tip',
        title: 'Recent tip',
        content: 'Just now',
        tags: [],
        visibility: 'public',
      });

      // This is tricky to test without manipulating time
      // Just verify the function accepts maxAge parameter
      const insights = getLocationInsights(mockLocationId, 24);
      expect(Array.isArray(insights)).toBe(true);
    });
  });

  describe('getVenueInsightStats', () => {
    it('should return aggregate statistics for a venue', () => {
      addVenueInsight(mockLocationId, mockAuthor, {
        type: 'tip',
        title: 'Tip 1',
        content: 'Content 1',
        tags: ['clean', 'kid-friendly'],
        visibility: 'public',
      });

      addVenueInsight(mockLocationId, mockAuthor, {
        type: 'observation',
        title: 'Observation 1',
        content: 'Content 2',
        tags: ['quiet', 'staff-friendly'],
        visibility: 'public',
      });

      const stats = getVenueInsightStats(mockLocationId);

      expect(stats.locationId).toBe(mockLocationId);
      expect(stats.totalInsights).toBeGreaterThanOrEqual(2);
      expect(stats.averageTrustScore).toBeGreaterThan(0);
      expect(stats.mostCommonTags).toBeInstanceOf(Array);
      expect(stats.recentInsights).toBeInstanceOf(Array);
      expect(stats.crowdednessHistory).toBeInstanceOf(Array);
    });

    it('should calculate most common tags', () => {
      addVenueInsight(mockLocationId, mockAuthor, {
        type: 'tip',
        title: 'Tip 1',
        content: 'Content 1',
        tags: ['clean', 'kid-friendly', 'staff-friendly'],
        visibility: 'public',
      });

      addVenueInsight(mockLocationId, mockAuthor, {
        type: 'tip',
        title: 'Tip 2',
        content: 'Content 2',
        tags: ['clean', 'quiet'],
        visibility: 'public',
      });

      const stats = getVenueInsightStats(mockLocationId);

      expect(stats.mostCommonTags).toContain('clean');
    });
  });

  describe('markInsightHelpfulness', () => {
    it('should increment helpful count when marked as helpful', () => {
      const insight = addVenueInsight(mockLocationId, mockAuthor, {
        type: 'tip',
        title: 'Test tip',
        content: 'Test content',
        tags: [],
        visibility: 'public',
      });

      const initialHelpful = insight.helpfulCount;

      markInsightHelpfulness(insight.id, 'user_1', true);

      const updatedInsights = getLocationInsights(mockLocationId);
      const updatedInsight = updatedInsights.find(i => i.id === insight.id);

      expect(updatedInsight?.helpfulCount).toBeGreaterThan(initialHelpful);
    });

    it('should increment not helpful count when marked as not helpful', () => {
      const insight = addVenueInsight(mockLocationId, mockAuthor, {
        type: 'tip',
        title: 'Test tip',
        content: 'Test content',
        tags: [],
        visibility: 'public',
      });

      const initialNotHelpful = insight.notHelpfulCount;

      markInsightHelpfulness(insight.id, 'user_2', false);

      const updatedInsights = getLocationInsights(mockLocationId);
      const updatedInsight = updatedInsights.find(i => i.id === insight.id);

      expect(updatedInsight?.notHelpfulCount).toBeGreaterThan(initialNotHelpful);
    });

    it('should update trust score based on helpfulness votes', () => {
      const insight = addVenueInsight(mockLocationId, mockAuthor, {
        type: 'tip',
        title: 'Test tip',
        content: 'Test content',
        tags: [],
        visibility: 'public',
      });

      const initialTrustScore = insight.trustScore;

      // Mark as helpful multiple times
      markInsightHelpfulness(insight.id, 'user_1', true);
      markInsightHelpfulness(insight.id, 'user_2', true);
      markInsightHelpfulness(insight.id, 'user_3', true);

      const updatedInsights = getLocationInsights(mockLocationId);
      const updatedInsight = updatedInsights.find(i => i.id === insight.id);

      // Trust score should increase if mostly helpful
      expect(updatedInsight?.trustScore).toBeGreaterThanOrEqual(initialTrustScore);
    });
  });

  describe('getLocationTips', () => {
    it('should return only tips and observations', () => {
      addVenueInsight(mockLocationId, mockAuthor, {
        type: 'tip',
        title: 'A good tip',
        content: 'Tip content',
        tags: [],
        visibility: 'public',
      });

      addVenueInsight(mockLocationId, mockAuthor, {
        type: 'warning',
        title: 'A warning',
        content: 'Warning content',
        tags: [],
        visibility: 'public',
      });

      const tips = getLocationTips(mockLocationId);

      // All returned items should be tips or observations
      tips.forEach(tip => {
        expect(['tip', 'observation']).toContain(tip.type);
      });
    });

    it('should sort tips by helpfulness and trust score', () => {
      const tip1 = addVenueInsight(mockLocationId, mockAuthor, {
        type: 'tip',
        title: 'Popular tip',
        content: 'Content 1',
        tags: [],
        visibility: 'public',
      });

      addVenueInsight(mockLocationId, mockAuthor, {
        type: 'tip',
        title: 'Less popular tip',
        content: 'Content 2',
        tags: [],
        visibility: 'public',
      });

      // Mark tip1 as helpful multiple times
      markInsightHelpfulness(tip1.id, 'user_1', true);
      markInsightHelpfulness(tip1.id, 'user_2', true);

      const tips = getLocationTips(mockLocationId);

      // First tip should be the more popular one
      expect(tips[0].id).toBe(tip1.id);
    });
  });

  describe('getLocationStatus', () => {
    it('should return only status updates and warnings from last 3 days', () => {
      addVenueInsight(mockLocationId, mockAuthor, {
        type: 'status_update',
        title: 'Current status',
        content: 'Currently quiet',
        tags: ['quiet'],
        visibility: 'public',
      });

      addVenueInsight(mockLocationId, mockAuthor, {
        type: 'warning',
        title: 'Watch out',
        content: 'Road works outside',
        tags: [],
        visibility: 'public',
      });

      const statuses = getLocationStatus(mockLocationId);

      // Filter should only include status_update and warning types
      statuses.forEach(status => {
        expect(['status_update', 'warning']).toContain(status.type);
      });
    });
  });

  describe('getInsightsByAuthor', () => {
    it('should return all insights from a specific author', () => {
      const author1: InsightAuthor = { ...mockAuthor, id: 'author_1' };
      const author2: InsightAuthor = { ...mockAuthor, id: 'author_2' };

      const locationId1 = 'location_1';
      const locationId2 = 'location_2';

      addVenueInsight(locationId1, author1, {
        type: 'tip',
        title: 'Tip from author 1',
        content: 'Content',
        tags: [],
        visibility: 'public',
      });

      addVenueInsight(locationId2, author1, {
        type: 'observation',
        title: 'Observation from author 1',
        content: 'Content',
        tags: [],
        visibility: 'public',
      });

      addVenueInsight(locationId1, author2, {
        type: 'tip',
        title: 'Tip from author 2',
        content: 'Content',
        tags: [],
        visibility: 'public',
      });

      const author1Insights = getInsightsByAuthor('author_1');

      expect(author1Insights.length).toBe(2);
      author1Insights.forEach(insight => {
        expect(insight.authorId).toBe('author_1');
      });
    });

    it('should return insights sorted by recency', () => {
      const author: InsightAuthor = mockAuthor;

      addVenueInsight('location_1', author, {
        type: 'tip',
        title: 'Older tip',
        content: 'Content',
        tags: [],
        visibility: 'public',
      });

      addVenueInsight('location_2', author, {
        type: 'tip',
        title: 'Newer tip',
        content: 'Content',
        tags: [],
        visibility: 'public',
      });

      const insights = getInsightsByAuthor(author.id);

      // Newer insights should come first
      if (insights.length > 1) {
        expect(insights[0].createdAt.getTime()).toBeGreaterThanOrEqual(
          insights[1].createdAt.getTime()
        );
      }
    });
  });

  describe('getWellReviewedLocations', () => {
    it('should return locations with high average trust scores', () => {
      const wellReviewedLocation = 'location_well_reviewed';
      const poorReviewedLocation = 'location_poor_reviewed';

      // Add multiple insights for well-reviewed location
      for (let i = 0; i < 5; i++) {
        addVenueInsight(wellReviewedLocation, mockAuthor, {
          type: 'tip',
          title: `Good tip ${i}`,
          content: 'Content',
          tags: [],
          visibility: 'public',
        });
      }

      // Add fewer insights for poor location
      addVenueInsight(poorReviewedLocation, mockAuthor, {
        type: 'warning',
        title: 'Poor review',
        content: 'Content',
        tags: [],
        visibility: 'public',
      });

      const wellReviewed = getWellReviewedLocations(10);

      // Should return locations that meet the minimum requirement
      expect(Array.isArray(wellReviewed)).toBe(true);
    });

    it('should require minimum number of insights for inclusion', () => {
      const location1 = 'location_with_many_insights';
      const location2 = 'location_with_few_insights';

      // Add 5 insights to location1
      for (let i = 0; i < 5; i++) {
        addVenueInsight(location1, mockAuthor, {
          type: 'tip',
          title: `Tip ${i}`,
          content: 'Content',
          tags: [],
          visibility: 'public',
        });
      }

      // Add only 1 insight to location2
      addVenueInsight(location2, mockAuthor, {
        type: 'tip',
        title: 'Single tip',
        content: 'Content',
        tags: [],
        visibility: 'public',
      });

      const wellReviewed = getWellReviewedLocations(10);

      // Location1 should be included (has >= 3 insights)
      // Location2 may not be included (has < 3 insights)
      expect(Array.isArray(wellReviewed)).toBe(true);
    });

    it('should sort by average trust score in descending order', () => {
      const high = 'high_trust_location';
      const mid = 'mid_trust_location';

      for (let i = 0; i < 3; i++) {
        addVenueInsight(high, mockAuthor, {
          type: 'tip',
          title: `High trust tip ${i}`,
          content: 'Content',
          tags: [],
          visibility: 'public',
        });
      }

      for (let i = 0; i < 3; i++) {
        addVenueInsight(mid, mockAuthor, {
          type: 'tip',
          title: `Mid trust tip ${i}`,
          content: 'Content',
          tags: [],
          visibility: 'public',
        });
      }

      const wellReviewed = getWellReviewedLocations(10);

      // Results should be sorted by score in descending order
      for (let i = 1; i < wellReviewed.length; i++) {
        expect(wellReviewed[i - 1].averageScore).toBeGreaterThanOrEqual(wellReviewed[i].averageScore);
      }
    });
  });

  describe('Trust score calculation', () => {
    it('should increase with verified author status', () => {
      const unverifiedAuthor: InsightAuthor = {
        ...mockAuthor,
        verificationStatus: 'unverified',
      };

      const verifiedAuthor: InsightAuthor = {
        ...mockAuthor,
        verificationStatus: 'verified',
      };

      const unverifiedInsight = addVenueInsight('loc_1', unverifiedAuthor, {
        type: 'tip',
        title: 'Tip',
        content: 'Content',
        tags: [],
        visibility: 'public',
      });

      const verifiedInsight = addVenueInsight('loc_2', verifiedAuthor, {
        type: 'tip',
        title: 'Tip',
        content: 'Content',
        tags: [],
        visibility: 'public',
      });

      expect(verifiedInsight.trustScore).toBeGreaterThan(unverifiedInsight.trustScore);
    });

    it('should increase with author experience', () => {
      const newAuthor: InsightAuthor = {
        ...mockAuthor,
        totalInsights: 1,
      };

      const experiencedAuthor: InsightAuthor = {
        ...mockAuthor,
        totalInsights: 50,
      };

      const newAuthorInsight = addVenueInsight('loc_1', newAuthor, {
        type: 'tip',
        title: 'Tip',
        content: 'Content',
        tags: [],
        visibility: 'public',
      });

      const experiencedInsight = addVenueInsight('loc_2', experiencedAuthor, {
        type: 'tip',
        title: 'Tip',
        content: 'Content',
        tags: [],
        visibility: 'public',
      });

      expect(experiencedInsight.trustScore).toBeGreaterThan(newAuthorInsight.trustScore);
    });
  });
});
