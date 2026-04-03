/**
 * Family Milestone & Celebration Planner Utility
 * Helps families find perfect venues and plan celebrations for important milestones
 * Supports birthdays, anniversaries, achievements, graduations, and more
 */

export type MilestoneType =
  | 'birthday'
  | 'anniversary'
  | 'graduation'
  | 'achievement'
  | 'holiday'
  | 'school-milestone'
  | 'family-reunion'
  | 'new-baby';

export type VenueStyle =
  | 'casual'
  | 'formal'
  | 'outdoor'
  | 'adventure'
  | 'educational'
  | 'dining'
  | 'entertainment';

export interface FamilyMilestone {
  type: MilestoneType;
  date: Date;
  title: string;
  description: string;
  celebrant: {
    name: string;
    age: number;
  };
  attendees: number;
  budget: number;
  preferredStyle: VenueStyle[];
  specialRequirements?: string[];
}

export interface CelebrationVenueSuggestion {
  venueId: string;
  venueName: string;
  category: string;
  matchScore: number; // 0-100
  celebrationReason: string;
  suggestedActivities: string[];
  estimatedCost: {
    perPerson: number;
    total: number;
    includesFood: boolean;
    includesEntertainment: boolean;
  };
  capacity: {
    minGroup: number;
    maxGroup: number;
    eventSpaceAvailable: boolean;
  };
  besttimes: {
    weekdays: string[];
    weekend: boolean;
    peakTimes: string[];
  };
  advantages: string[];
  considerations: string[];
}

export interface CelebrationPlan {
  milestone: FamilyMilestone;
  suggestedVenues: CelebrationVenueSuggestion[];
  celebrationTips: CelebrationTip[];
  budgetBreakdown: BudgetBreakdown;
  timelineRecommendation: TimelineItem[];
  successScore: number;
}

export interface CelebrationTip {
  category: string;
  tip: string;
  importance: 'critical' | 'recommended' | 'nice-to-have';
  relevantAges?: [number, number];
}

export interface BudgetBreakdown {
  venueRental: number;
  food: number;
  entertainment: number;
  decorations: number;
  gifts: number;
  transportation: number;
  contingency: number;
  total: number;
  savingsOpportunities: string[];
}

export interface TimelineItem {
  daysBeforeEvent: number;
  task: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  estimatedTime: string;
}

export interface MilestonePreferences {
  preferredVenueTypes: string[];
  budgetRange: [number, number];
  groupSize: number;
  dietaryRestrictions: string[];
  accessibilityNeeds: string[];
  weather: 'indoor' | 'outdoor' | 'flexible';
  timePreference: 'morning' | 'afternoon' | 'evening' | 'flexible';
}

/**
 * Analyze a family milestone and determine celebration style
 */
export function analyzeMilestoneContext(milestone: FamilyMilestone): {
  celebrationIntensity: 'intimate' | 'moderate' | 'grand';
  suggestedGroupSize: [number, number];
  timeframe: 'immediate' | 'short-notice' | 'planned';
  budgetGuideline: string;
} {
  const intensity = milestone.attendees > 20 ? 'grand' : milestone.attendees > 8 ? 'moderate' : 'intimate';
  const baseGroupSize = Math.max(5, milestone.attendees);
  const groupSize: [number, number] = [baseGroupSize, baseGroupSize + 5];

  const timeframe = milestone.type === 'achievement' ? 'immediate' : 'planned';
  const budgetGuideline = milestone.budget > 5000 ? 'premium' : milestone.budget > 2000 ? 'mid-range' : 'budget-friendly';

  return {
    celebrationIntensity: intensity,
    suggestedGroupSize: groupSize,
    timeframe,
    budgetGuideline
  };
}

/**
 * Calculate celebration suitability score for a venue
 */
export function calculateCelebrationScore(
  venue: {
    category: string;
    facilities?: string[];
    capacity?: number;
    priceRange?: string;
    reviews?: number;
  },
  milestone: FamilyMilestone
): number {
  let score = 50;

  // Category match
  const categoryMatches: Record<MilestoneType, string[]> = {
    birthday: ['restaurant', 'park', 'attraction', 'museum'],
    anniversary: ['restaurant', 'attraction', 'park'],
    graduation: ['restaurant', 'event-space', 'attraction'],
    achievement: ['restaurant', 'park', 'attraction'],
    holiday: ['park', 'attraction', 'restaurant'],
    'school-milestone': ['museum', 'attraction', 'park'],
    'family-reunion': ['park', 'restaurant', 'event-space'],
    'new-baby': ['restaurant', 'park', 'attraction']
  };

  if (categoryMatches[milestone.type]?.includes(venue.category)) {
    score += 15;
  }

  // Capacity match
  if (venue.capacity && venue.capacity >= milestone.attendees) {
    score += 15;
  }

  // Facilities match
  if (venue.facilities) {
    const desiredFacilities = ['high-chair', 'changing-table', 'restroom', 'parking'];
    const matchedFacilities = desiredFacilities.filter(f =>
      venue.facilities?.some(vf => vf.toLowerCase().includes(f))
    );
    score += matchedFacilities.length * 5;
  }

  // Rating consideration
  if (venue.reviews && venue.reviews >= 4.5) {
    score += 10;
  }

  // Age-appropriateness
  if (milestone.celebrant.age < 5 && categoryMatches[milestone.type]?.includes('park')) {
    score += 5;
  } else if (milestone.celebrant.age >= 10 && categoryMatches[milestone.type]?.includes('attraction')) {
    score += 5;
  }

  return Math.min(100, Math.max(0, score));
}

/**
 * Generate celebration tips based on milestone type and family profile
 */
export function generateCelebrationTips(
  milestone: FamilyMilestone,
  attendeeAges: number[]
): CelebrationTip[] {
  const tips: CelebrationTip[] = [];

  // Universal tips
  tips.push({
    category: 'Planning',
    tip: 'Book venue and activities at least 2 weeks in advance',
    importance: 'critical'
  });

  tips.push({
    category: 'Capacity',
    tip: 'Confirm headcount 3 days before celebration',
    importance: 'recommended'
  });

  // Type-specific tips
  switch (milestone.type) {
    case 'birthday':
      tips.push({
        category: 'Activities',
        tip: 'Plan age-appropriate entertainment and activities',
        importance: 'critical',
        relevantAges: [0, 18]
      });
      tips.push({
        category: 'Timing',
        tip: 'Schedule events around meal times for convenience',
        importance: 'recommended'
      });
      if (attendeeAges.some(age => age < 3)) {
        tips.push({
          category: 'Accessibility',
          tip: 'Ensure changing tables and quiet areas available for infants',
          importance: 'critical',
          relevantAges: [0, 3]
        });
      }
      break;

    case 'anniversary':
      tips.push({
        category: 'Ambiance',
        tip: 'Choose a romantic or peaceful setting',
        importance: 'recommended'
      });
      tips.push({
        category: 'Timing',
        tip: 'Consider evening or sunset timing for romantic atmosphere',
        importance: 'nice-to-have'
      });
      break;

    case 'family-reunion':
      tips.push({
        category: 'Space',
        tip: 'Choose a venue with flexible layouts for group activities',
        importance: 'critical'
      });
      tips.push({
        category: 'Accessibility',
        tip: 'Consider accessibility for elderly and young children',
        importance: 'recommended'
      });
      break;

    case 'graduation':
      tips.push({
        category: 'Photos',
        tip: 'Ensure good photo opportunities for memories',
        importance: 'recommended'
      });
      tips.push({
        category: 'Timing',
        tip: 'Schedule celebrations after official graduation events',
        importance: 'recommended'
      });
      break;
  }

  // Family-specific considerations
  if (milestone.specialRequirements?.includes('dietary-restrictions')) {
    tips.push({
      category: 'Food',
      tip: 'Confirm all dietary requirements with venue in advance',
      importance: 'critical'
    });
  }

  if (milestone.specialRequirements?.includes('sensory-friendly')) {
    tips.push({
      category: 'Environment',
      tip: 'Request quiet times and low-stimulation areas if available',
      importance: 'recommended'
    });
  }

  return tips;
}

/**
 * Create a detailed celebration budget breakdown
 */
export function createBudgetBreakdown(
  milestone: FamilyMilestone,
  venue: CelebrationVenueSuggestion
): BudgetBreakdown {
  const totalCost = venue.estimatedCost.total;
  const totalBudget = milestone.budget;

  const breakdown: BudgetBreakdown = {
    venueRental: totalCost * 0.3,
    food: venue.estimatedCost.includesFood ? totalCost * 0.4 : totalCost * 0.5,
    entertainment: venue.estimatedCost.includesEntertainment ? totalCost * 0.1 : totalCost * 0.2,
    decorations: totalCost * 0.1,
    gifts: Math.max(0, totalBudget - totalCost) * 0.5,
    transportation: totalCost * 0.05,
    contingency: totalCost * 0.1,
    total: totalBudget,
    savingsOpportunities: []
  };

  // Identify savings opportunities
  if (milestone.attendees > 10) {
    breakdown.savingsOpportunities.push('Group discounts available - confirm with venue');
  }

  if (milestone.type === 'birthday' && milestone.celebrant.age < 5) {
    breakdown.savingsOpportunities.push('Simple decoration scheme can reduce costs significantly');
  }

  if (venue.estimatedCost.includesFood && venue.estimatedCost.includesEntertainment) {
    breakdown.savingsOpportunities.push('Bundled packages offer better value than separate services');
  }

  if (milestone.preferredStyle.includes('outdoor')) {
    breakdown.savingsOpportunities.push('Outdoor venues typically offer lower rental costs');
  }

  return breakdown;
}

/**
 * Generate a celebration timeline with tasks
 */
export function generateCelebrationTimeline(milestone: FamilyMilestone): TimelineItem[] {
  const timeline: TimelineItem[] = [];
  const daysUntilEvent = Math.ceil((milestone.date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  if (daysUntilEvent >= 60) {
    timeline.push({
      daysBeforeEvent: 60,
      task: 'Start planning celebration theme and style',
      priority: 'high',
      estimatedTime: '2 hours'
    });
    timeline.push({
      daysBeforeEvent: 50,
      task: 'Research and shortlist venues',
      priority: 'high',
      estimatedTime: '3 hours'
    });
  }

  if (daysUntilEvent >= 30) {
    timeline.push({
      daysBeforeEvent: 30,
      task: 'Book venue and confirm availability',
      priority: 'critical',
      estimatedTime: '1 hour'
    });
    timeline.push({
      daysBeforeEvent: 28,
      task: 'Send invitations to guests',
      priority: 'high',
      estimatedTime: '2 hours'
    });
  }

  if (daysUntilEvent >= 14) {
    timeline.push({
      daysBeforeEvent: 14,
      task: 'Confirm catering and menu options',
      priority: 'high',
      estimatedTime: '1 hour'
    });
    timeline.push({
      daysBeforeEvent: 10,
      task: 'Plan decorations and party supplies',
      priority: 'medium',
      estimatedTime: '2 hours'
    });
  }

  timeline.push({
    daysBeforeEvent: 7,
    task: 'Purchase decorations and party supplies',
    priority: 'high',
    estimatedTime: '3 hours'
  });

  timeline.push({
    daysBeforeEvent: 3,
    task: 'Confirm final headcount with venue',
    priority: 'critical',
    estimatedTime: '30 minutes'
  });

  timeline.push({
    daysBeforeEvent: 1,
    task: 'Prepare decorations and finalize arrangements',
    priority: 'high',
    estimatedTime: '2 hours'
  });

  timeline.push({
    daysBeforeEvent: 0,
    task: 'Arrive early to set up and prepare',
    priority: 'high',
    estimatedTime: '1 hour'
  });

  return timeline;
}

/**
 * Calculate overall celebration success score
 */
export function calculateCelebrationSuccessScore(
  plan: Omit<CelebrationPlan, 'successScore'>
): number {
  let score = 60;

  // Venue quality contribution
  if (plan.suggestedVenues.length > 0) {
    const avgVenueScore = plan.suggestedVenues.reduce((sum, v) => sum + v.matchScore, 0) / plan.suggestedVenues.length;
    score += avgVenueScore * 0.25;
  }

  // Budget fit contribution
  const totalCost = plan.budgetBreakdown.total;
  const budgetUtilization = Math.min(100, (totalCost / plan.milestone.budget) * 100);
  if (budgetUtilization >= 80 && budgetUtilization <= 100) {
    score += 15;
  } else if (budgetUtilization > 100) {
    score -= 5;
  }

  // Planning completeness
  if (plan.timelineRecommendation.length >= 8) {
    score += 10;
  }

  // Celebration tips coverage
  if (plan.celebrationTips.length > 3) {
    score += 10;
  }

  // Special requirements handling
  if (plan.milestone.specialRequirements && plan.milestone.specialRequirements.length > 0) {
    const coveredRequirements = plan.celebrationTips.filter(tip =>
      plan.milestone.specialRequirements?.some(req => tip.category.toLowerCase().includes(req.split('-')[0]))
    ).length;
    score += Math.min(5, coveredRequirements * 2);
  }

  return Math.min(100, score);
}

/**
 * Create a complete celebration plan for a family milestone
 */
export function createCelebrationPlan(
  milestone: FamilyMilestone,
  suggestedVenues: CelebrationVenueSuggestion[]
): CelebrationPlan {
  const celebrationTips = generateCelebrationTips(milestone, [milestone.celebrant.age]);
  const budgetBreakdown = createBudgetBreakdown(milestone, suggestedVenues[0] || {
    venueId: '',
    venueName: '',
    category: '',
    matchScore: 0,
    celebrationReason: '',
    suggestedActivities: [],
    estimatedCost: { perPerson: 0, total: milestone.budget, includesFood: false, includesEntertainment: false },
    capacity: { minGroup: 0, maxGroup: 0, eventSpaceAvailable: false },
    besttimes: { weekdays: [], weekend: false, peakTimes: [] },
    advantages: [],
    considerations: []
  });
  const timelineRecommendation = generateCelebrationTimeline(milestone);

  const plan: Omit<CelebrationPlan, 'successScore'> = {
    milestone,
    suggestedVenues,
    celebrationTips,
    budgetBreakdown,
    timelineRecommendation
  };

  return {
    ...plan,
    successScore: calculateCelebrationSuccessScore(plan)
  };
}

/**
 * Get celebration style recommendations based on age and preference
 */
export function getStyleRecommendations(
  age: number,
  preferredStyles: VenueStyle[]
): { recommendedStyle: VenueStyle; reasons: string[] } {
  let recommendedStyle: VenueStyle = 'casual';
  const reasons: string[] = [];

  if (age <= 5) {
    recommendedStyle = 'outdoor';
    reasons.push('Outdoor venues provide space and freedom for young children');
    reasons.push('Parks and playgrounds are stimulating for toddlers');
  } else if (age < 10) {
    recommendedStyle = 'adventure';
    reasons.push('Adventure activities appeal to school-age children');
    reasons.push('Interactive experiences create memorable celebrations');
  } else if (age < 16) {
    recommendedStyle = 'entertainment';
    reasons.push('Entertainment venues match teen interests');
    reasons.push('Variety of activities keeps teens engaged');
  } else {
    recommendedStyle = 'dining';
    reasons.push('Upscale dining creates a mature celebration atmosphere');
    reasons.push('Restaurant venues support social gathering and conversation');
  }

  if (preferredStyles.includes(recommendedStyle)) {
    reasons.push(`Aligns with stated preference for ${recommendedStyle} experiences`);
  }

  return { recommendedStyle, reasons };
}

/**
 * Check if a milestone date is approaching and needs immediate planning
 */
export function checkMilestoneUrgency(milestone: FamilyMilestone): {
  isUrgent: boolean;
  daysRemaining: number;
  recommendedAction: string;
} {
  const today = new Date();
  const daysRemaining = Math.ceil((milestone.date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  let isUrgent = false;
  let recommendedAction = '';

  if (daysRemaining <= 7) {
    isUrgent = true;
    recommendedAction = 'URGENT: Book venue immediately or consider nearby alternatives';
  } else if (daysRemaining <= 14) {
    isUrgent = true;
    recommendedAction = 'Quick booking recommended - secure venue within 2-3 days';
  } else if (daysRemaining <= 30) {
    recommendedAction = 'Begin venue search and initial planning this week';
  } else if (daysRemaining <= 60) {
    recommendedAction = 'Start research and planning process soon';
  } else {
    recommendedAction = 'You have plenty of time for detailed planning and preparation';
  }

  return { isUrgent, daysRemaining, recommendedAction };
}
