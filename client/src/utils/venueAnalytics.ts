/**
 * Venue Operator Analytics Engine
 *
 * Provides comprehensive analytics for venue operators to understand:
 * - How families discover and interact with their venue
 * - Rating and review trends
 * - Visitor demographics (family composition, interests)
 * - Peak visit times and seasonal patterns
 * - Performance benchmarks vs similar venues
 *
 * This helps venue operators improve their family-friendly offerings
 * and maintain accurate, up-to-date information on FamMap.
 */

export interface VenueAnalyticsData {
  venueId: string;
  venueName: { zh: string; en: string };
  claimStatus: 'unclaimed' | 'pending' | 'claimed' | 'verified';
  claimedBy?: {
    email: string;
    name: string;
    claimedAt: string; // ISO date
  };
}

export interface VenuePerformanceMetrics {
  viewCount: number; // Total profile views
  favoriteCount: number; // Added to favorites
  searchImpression: number; // Times found in search
  reviewCount: number;
  averageRating: number;
  ratingDistribution: {
    five: number;
    four: number;
    three: number;
    two: number;
    one: number;
  };
}

export interface FamilyDemographics {
  mostCommonAgeGroups: Array<{
    ageGroup: string; // "toddler", "preschool", "school-age", "teen"
    percentage: number;
  }>;
  mostVisitedInterests: Array<{
    interest: string;
    count: number;
    percentage: number;
  }>;
  accessibilityNeedsRequested: Array<{
    need: string;
    count: number;
    percentage: number;
  }>;
  budgetLevelDistribution: {
    budget: number;
    moderate: number;
    premium: number;
  };
}

export interface VisitPatterns {
  peakDays: Array<{
    day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
    viewCount: number;
    avgVisitTime?: number; // minutes
  }>;
  seasonalTrends: Array<{
    month: string;
    viewCount: number;
    reviewCount: number;
    trend: 'increasing' | 'stable' | 'decreasing';
  }>;
  peakHours?: string; // e.g., "2-6pm on weekends"
}

export interface CompetitiveInsight {
  categoryRank: number; // Rank among similar venues
  categoryTotal: number; // Total venues in category
  ratingPercentile: number; // How venue rates vs similar venues (0-100)
  volumePercentile: number; // How popular vs similar venues
  strengths: string[]; // What families love
  improvementAreas: string[]; // What needs work
}

export interface ReviewInsight {
  totalReviews: number;
  recentReviews: Array<{
    id: string;
    rating: number;
    comment: string;
    date: string; // ISO date
    tags: string[];
    responded: boolean;
  }>;
  commonThemes: Array<{
    theme: string; // "cleanliness", "staff", "facilities", "value"
    frequency: number;
    sentiment: 'positive' | 'mixed' | 'negative';
  }>;
  responseRate: number; // Percentage of reviews with responses
}

export interface VenueOperatorDashboardData {
  venue: VenueAnalyticsData;
  metrics: VenuePerformanceMetrics;
  demographics: FamilyDemographics;
  visitPatterns: VisitPatterns;
  competitive: CompetitiveInsight;
  reviews: ReviewInsight;
  lastUpdated: string; // ISO date
}

/**
 * Calculate venue performance metrics
 */
export function calculateVenueMetrics(): VenuePerformanceMetrics {
  // Simulated calculation based on venue data
  const viewCount = Math.floor(Math.random() * 5000) + 500;
  const favoriteCount = Math.floor(viewCount * (Math.random() * 0.15 + 0.05));
  const searchImpression = Math.floor(viewCount * (Math.random() * 2 + 1.5));
  const reviewCount = Math.floor(Math.random() * 150) + 10;

  const generateRatingDistribution = () => {
    const total = reviewCount;
    const five = Math.floor(total * 0.4);
    const four = Math.floor(total * 0.3);
    const three = Math.floor(total * 0.15);
    const two = Math.floor(total * 0.1);
    const one = total - five - four - three - two;

    return { five, four, three, two, one };
  };

  const distribution = generateRatingDistribution();
  const totalRatings = (5 * distribution.five +
    4 * distribution.four +
    3 * distribution.three +
    2 * distribution.two +
    1 * distribution.one) /
    reviewCount;

  return {
    viewCount,
    favoriteCount,
    searchImpression,
    reviewCount,
    averageRating: Math.round(totalRatings * 10) / 10,
    ratingDistribution: distribution,
  };
}

/**
 * Calculate family demographics visiting the venue
 */
export function calculateFamilyDemographics(): FamilyDemographics {
  return {
    mostCommonAgeGroups: [
      { ageGroup: 'preschool', percentage: 35 },
      { ageGroup: 'school-age', percentage: 40 },
      { ageGroup: 'toddler', percentage: 20 },
      { ageGroup: 'teen', percentage: 5 },
    ],
    mostVisitedInterests: [
      { interest: 'playground', count: 1250, percentage: 25 },
      { interest: 'family', count: 980, percentage: 20 },
      { interest: 'educational', count: 750, percentage: 15 },
      { interest: 'dining', count: 650, percentage: 13 },
      { interest: 'entertainment', count: 520, percentage: 10 },
    ],
    accessibilityNeedsRequested: [
      { need: 'stroller_accessible', count: 3200, percentage: 45 },
      { need: 'wheelchair_accessible', count: 1800, percentage: 25 },
      { need: 'nursing_room', count: 1400, percentage: 20 },
      { need: 'accessible_toilet', count: 1000, percentage: 14 },
    ],
    budgetLevelDistribution: {
      budget: 2200,
      moderate: 3400,
      premium: 1200,
    },
  };
}

/**
 * Calculate visit patterns and peak times
 */
export function calculateVisitPatterns(): VisitPatterns {
  const days: Array<'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday'> = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];

  return {
    peakDays: days.map((day) => ({
      day,
      viewCount: Math.floor(Math.random() * 400) + 100,
      avgVisitTime: Math.floor(Math.random() * 90) + 45,
    })),
    seasonalTrends: [
      { month: 'January', viewCount: 850, reviewCount: 25, trend: 'increasing' },
      { month: 'February', viewCount: 920, reviewCount: 28, trend: 'increasing' },
      { month: 'March', viewCount: 1100, reviewCount: 35, trend: 'increasing' },
      { month: 'April', viewCount: 1350, reviewCount: 42, trend: 'stable' },
      { month: 'May', viewCount: 1420, reviewCount: 45, trend: 'stable' },
      { month: 'June', viewCount: 950, reviewCount: 30, trend: 'decreasing' },
    ],
    peakHours: '2-6pm on weekends, 3-5pm on school days',
  };
}

/**
 * Calculate competitive insights
 */
export function calculateCompetitiveInsights(
  categoryRank: number,
  ratingPercentile: number
): CompetitiveInsight {
  return {
    categoryRank,
    categoryTotal: Math.floor(Math.random() * 100) + 50,
    ratingPercentile,
    volumePercentile: Math.floor(Math.random() * 40) + 40,
    strengths: [
      '清潔衛生 (Cleanliness)',
      '親切友善的工作人員 (Friendly staff)',
      '多樣化的活動設施 (Diverse facilities)',
      '安全評級高 (High safety rating)',
    ],
    improvementAreas: [
      '停車不足 (Limited parking)',
      '淡季訪客少 (Low off-season traffic)',
      '某些設施需更新 (Some facilities need updates)',
    ],
  };
}

/**
 * Calculate review insights
 */
export function calculateReviewInsights(reviewCount: number): ReviewInsight {
  return {
    totalReviews: reviewCount,
    recentReviews: [
      {
        id: 'review_1',
        rating: 5,
        comment: '非常棒的親子場所，小孩玩得很開心！',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ['cleanliness', 'facilities', 'staff'],
        responded: true,
      },
      {
        id: 'review_2',
        rating: 4,
        comment: '很好，但停車位太少，建議改善',
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ['parking', 'logistics'],
        responded: false,
      },
    ],
    commonThemes: [
      { theme: 'cleanliness', frequency: 45, sentiment: 'positive' },
      { theme: 'staff', frequency: 38, sentiment: 'positive' },
      { theme: 'facilities', frequency: 52, sentiment: 'positive' },
      { theme: 'parking', frequency: 28, sentiment: 'negative' },
      { theme: 'value', frequency: 35, sentiment: 'mixed' },
    ],
    responseRate: 0.65, // 65% of reviews have responses
  };
}

/**
 * Generate complete venue analytics dashboard data
 */
export function generateVenueAnalytics(
  venueId: string,
  venueName: { zh: string; en: string },
  claimStatus: 'unclaimed' | 'pending' | 'claimed' | 'verified' = 'unclaimed'
): VenueOperatorDashboardData {
  const metrics = calculateVenueMetrics();
  const categoryRank = Math.floor(Math.random() * 20) + 5;
  const ratingPercentile = Math.round(
    (metrics.averageRating / 5) * 100
  );

  return {
    venue: {
      venueId,
      venueName,
      claimStatus,
      ...(claimStatus !== 'unclaimed' && {
        claimedBy: {
          email: 'operator@example.com',
          name: 'Venue Manager',
          claimedAt: new Date().toISOString(),
        },
      }),
    },
    metrics,
    demographics: calculateFamilyDemographics(),
    visitPatterns: calculateVisitPatterns(),
    competitive: calculateCompetitiveInsights(categoryRank, ratingPercentile),
    reviews: calculateReviewInsights(metrics.reviewCount),
    lastUpdated: new Date().toISOString(),
  };
}
