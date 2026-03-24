/**
 * Collaborative Venue Insights System
 * Enables parents to share real-time insights, tips, and current venue status
 * Includes trust scoring, moderation, and temporal relevance
 */

export interface VenueInsight {
  id: string;
  locationId: string;
  authorId: string;
  authorName: string;
  type: 'tip' | 'warning' | 'status_update' | 'observation';
  title: string;
  content: string;
  tags: string[]; // e.g., 'crowded', 'clean', 'staff-friendly', 'parking-full'
  trustScore: number; // 0-100, based on author reputation and community votes
  helpfulCount: number;
  notHelpfulCount: number;
  createdAt: Date;
  updatedAt: Date;
  currentChildAge?: number; // Age of child when parent visited
  visitDate?: Date;
  visibility: 'public' | 'friends' | 'private';
}

export interface InsightAuthor {
  id: string;
  name: string;
  verificationStatus: 'verified' | 'unverified' | 'trusted';
  totalInsights: number;
  averageTrustScore: number;
  joinDate: Date;
}

export interface InsightStats {
  locationId: string;
  totalInsights: number;
  averageTrustScore: number;
  mostCommonTags: string[];
  recentInsights: VenueInsight[];
  crowdednessHistory: Array<{
    timestamp: Date;
    level: 'empty' | 'quiet' | 'moderate' | 'busy' | 'very_busy';
    reportCount: number;
  }>;
}

// In-memory storage (would be replaced with API calls in production)
const venueInsights: Map<string, VenueInsight[]> = new Map();
const insightAuthors: Map<string, InsightAuthor> = new Map();
const userHelpfulness: Map<string, Set<string>> = new Map(); // Track which insights user found helpful

/**
 * Clear all stored insights (for testing purposes)
 */
export function clearAllInsights(): void {
  venueInsights.clear();
  insightAuthors.clear();
  userHelpfulness.clear();
}

/**
 * Add a new venue insight
 */
export function addVenueInsight(
  locationId: string,
  author: InsightAuthor,
  insight: Omit<VenueInsight, 'id' | 'locationId' | 'trustScore' | 'helpfulCount' | 'notHelpfulCount' | 'createdAt' | 'updatedAt' | 'authorId' | 'authorName'>
): VenueInsight {
  const newInsight: VenueInsight = {
    ...insight,
    id: `insight_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    locationId,
    authorId: author.id,
    authorName: author.name,
    trustScore: calculateInitialTrustScore(author),
    helpfulCount: 0,
    notHelpfulCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  if (!venueInsights.has(locationId)) {
    venueInsights.set(locationId, []);
  }
  venueInsights.get(locationId)!.push(newInsight);

  // Update author stats
  if (!insightAuthors.has(author.id)) {
    insightAuthors.set(author.id, author);
  }
  const authorData = insightAuthors.get(author.id)!;
  authorData.totalInsights += 1;
  authorData.averageTrustScore = (authorData.averageTrustScore * (authorData.totalInsights - 1) + newInsight.trustScore) / authorData.totalInsights;

  return newInsight;
}

/**
 * Get insights for a location, sorted by relevance and trust
 */
export function getLocationInsights(locationId: string, maxAge?: number): VenueInsight[] {
  const insights = venueInsights.get(locationId) || [];
  const now = new Date();

  return insights
    .filter(insight => {
      if (maxAge) {
        const ageInHours = (now.getTime() - insight.createdAt.getTime()) / (1000 * 60 * 60);
        return ageInHours <= maxAge;
      }
      return true;
    })
    .sort((a, b) => {
      // Sort by trust score (descending), then by recency
      if (b.trustScore !== a.trustScore) {
        return b.trustScore - a.trustScore;
      }
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
}

/**
 * Mark an insight as helpful/not helpful
 */
export function markInsightHelpfulness(insightId: string, userId: string, helpful: boolean): void {
  const key = `${userId}:${insightId}`;

  for (const locationInsights of venueInsights.values()) {
    const insight = locationInsights.find(i => i.id === insightId);
    if (insight) {
      if (!userHelpfulness.has(userId)) {
        userHelpfulness.set(userId, new Set());
      }

      // Update counts based on whether they previously marked it
      const userSet = userHelpfulness.get(userId)!;
      const wasMarked = userSet.has(key);

      if (helpful) {
        if (!wasMarked || key.includes(':not_helpful')) {
          insight.helpfulCount += 1;
          if (key.includes(':not_helpful')) {
            insight.notHelpfulCount = Math.max(0, insight.notHelpfulCount - 1);
          }
        }
        userSet.add(key);
        // Update trust score based on helpfulness
        updateInsightTrustScore(insight);
      } else {
        if (!wasMarked || key.includes(':helpful')) {
          insight.notHelpfulCount += 1;
          if (key.includes(':helpful')) {
            insight.helpfulCount = Math.max(0, insight.helpfulCount - 1);
          }
        }
        userSet.add(key);
        // Update trust score based on feedback
        updateInsightTrustScore(insight);
      }
      break;
    }
  }
}

/**
 * Get aggregate insights and statistics for a venue
 */
export function getVenueInsightStats(locationId: string): InsightStats {
  const insights = venueInsights.get(locationId) || [];
  const now = new Date();

  // Filter recent insights (last 7 days)
  const recentInsights = insights.filter(i => {
    const ageInDays = (now.getTime() - i.createdAt.getTime()) / (1000 * 60 * 60 * 24);
    return ageInDays <= 7;
  });

  // Calculate statistics
  const crowdednessHistory = extractCrowdednessHistory(recentInsights);
  const mostCommonTags = extractMostCommonTags(recentInsights, 5);
  const averageTrustScore = recentInsights.length > 0
    ? recentInsights.reduce((sum, i) => sum + i.trustScore, 0) / recentInsights.length
    : 0;

  return {
    locationId,
    totalInsights: insights.length,
    averageTrustScore: Math.round(averageTrustScore),
    mostCommonTags,
    recentInsights: recentInsights.slice(0, 5),
    crowdednessHistory,
  };
}

/**
 * Get top tips for a location
 */
export function getLocationTips(locationId: string, limit: number = 3): VenueInsight[] {
  return getLocationInsights(locationId, 24 * 30) // Last 30 days
    .filter(i => i.type === 'tip' || i.type === 'observation')
    .sort((a, b) => (b.helpfulCount + b.trustScore) - (a.helpfulCount + a.trustScore))
    .slice(0, limit);
}

/**
 * Get current status/warnings for a location
 */
export function getLocationStatus(locationId: string): VenueInsight[] {
  const now = new Date();
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

  return getLocationInsights(locationId)
    .filter(i => (i.type === 'status_update' || i.type === 'warning') && i.createdAt >= threeDaysAgo)
    .slice(0, 5);
}

/**
 * Calculate initial trust score for an insight based on author reputation
 */
function calculateInitialTrustScore(author: InsightAuthor): number {
  let score = 50; // Base score

  if (author.verificationStatus === 'verified') {
    score += 20;
  } else if (author.verificationStatus === 'trusted') {
    score += 10;
  }

  // Boost based on author's average trust score
  if (author.averageTrustScore > 80) {
    score += 15;
  } else if (author.averageTrustScore > 60) {
    score += 5;
  }

  // Slight boost for experienced contributors
  if (author.totalInsights > 20) {
    score += 10;
  } else if (author.totalInsights > 10) {
    score += 5;
  }

  return Math.min(100, score);
}

/**
 * Update insight trust score based on community feedback
 */
function updateInsightTrustScore(insight: VenueInsight): void {
  const totalVotes = insight.helpfulCount + insight.notHelpfulCount;

  if (totalVotes === 0) return;

  const helpfulRatio = insight.helpfulCount / totalVotes;
  const trustAdjustment = (helpfulRatio - 0.5) * 20; // Range: -10 to +10

  insight.trustScore = Math.max(20, Math.min(100, insight.trustScore + trustAdjustment));
}

/**
 * Extract crowdedness history from insights
 */
function extractCrowdednessHistory(
  insights: VenueInsight[]
): Array<{
  timestamp: Date;
  level: 'empty' | 'quiet' | 'moderate' | 'busy' | 'very_busy';
  reportCount: number;
}> {
  const crowdnessMap = new Map<string, Array<VenueInsight>>();

  insights
    .filter(i => i.tags.includes('crowded') || i.tags.includes('empty') || i.tags.includes('quiet'))
    .forEach(insight => {
      const dateKey = insight.createdAt.toISOString().split('T')[0];
      if (!crowdnessMap.has(dateKey)) {
        crowdnessMap.set(dateKey, []);
      }
      crowdnessMap.get(dateKey)!.push(insight);
    });

  return Array.from(crowdnessMap.entries())
    .map(([dateKey, insightsList]) => {
      // Determine crowdedness level from tags
      let level: 'empty' | 'quiet' | 'moderate' | 'busy' | 'very_busy' = 'moderate';
      const tags = insightsList.flatMap(i => i.tags);

      if (tags.includes('very_busy')) level = 'very_busy';
      else if (tags.includes('busy')) level = 'busy';
      else if (tags.includes('quiet')) level = 'quiet';
      else if (tags.includes('empty')) level = 'empty';

      return {
        timestamp: new Date(dateKey),
        level,
        reportCount: insightsList.length,
      };
    });
}

/**
 * Extract most common tags from insights
 */
function extractMostCommonTags(insights: VenueInsight[], limit: number): string[] {
  const tagCounts = new Map<string, number>();

  insights.forEach(insight => {
    insight.tags.forEach(tag => {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    });
  });

  return Array.from(tagCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([tag]) => tag);
}

/**
 * Get insights for a specific parent profile
 */
export function getInsightsByAuthor(authorId: string): VenueInsight[] {
  const allInsights: VenueInsight[] = [];
  for (const locationInsights of venueInsights.values()) {
    allInsights.push(...locationInsights.filter(i => i.authorId === authorId));
  }
  return allInsights.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

/**
 * Get recommended locations based on insight quality and recency
 */
export function getWellReviewedLocations(limit: number = 10): Array<{
  locationId: string;
  averageScore: number;
  trustLevel: 'low' | 'medium' | 'high' | 'very_high';
  insightCount: number;
}> {
  const results = Array.from(venueInsights.entries())
    .map(([locationId, insights]) => {
      const avgScore = insights.length > 0
        ? insights.reduce((sum, i) => sum + i.trustScore, 0) / insights.length
        : 0;

      let trustLevel: 'low' | 'medium' | 'high' | 'very_high' = 'low';
      if (avgScore > 80) trustLevel = 'very_high';
      else if (avgScore > 65) trustLevel = 'high';
      else if (avgScore > 50) trustLevel = 'medium';

      return {
        locationId,
        averageScore: Math.round(avgScore),
        trustLevel,
        insightCount: insights.length,
      };
    })
    .filter(r => r.insightCount >= 3) // At least 3 insights for credibility
    .sort((a, b) => b.averageScore - a.averageScore)
    .slice(0, limit);

  return results;
}
