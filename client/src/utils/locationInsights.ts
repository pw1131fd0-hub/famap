/**
 * Location Insights & Analytics Utility
 * Provides comprehensive analysis of location data, reviews, and family compatibility
 * Helps families make informed decisions with clear, actionable metrics
 */

import type { Location, Review, CrowdednessReport } from '../types';

export interface LocationInsight {
  familySuitabilityScore: number; // 0-100
  safetyRating: number; // 0-5 based on reviews
  cleanlinessRating: number; // 0-5 based on reviews
  valueForMoneyRating: number; // 0-5 based on reviews
  accessibilityScore: number; // 0-100 based on facilities
  staffRating: number; // 0-5 based on reviews
  commonConcerns: string[];
  topStrengths: string[];
  recommendedAgeGroups: string[];
  bestTimeToVisit: string;
  averageCrowdiness: 'light' | 'moderate' | 'heavy' | 'unknown';
  lastUpdated: string;
  totalReviews: number;
  verificationScore: number; // 0-100: how verified are the features?
}

export interface FamilyCompatibility {
  overallScore: number; // 0-100
  ageAppropriate: boolean;
  accessibilityMet: boolean;
  specialNeedsFriendly: boolean;
  valueAcceptable: boolean;
  reasons: string[];
  improvements: string[];
}

/**
 * Calculate family suitability score based on location features and reviews
 */
export function calculateFamilySuitabilityScore(
  location: Location,
  reviews: Review[],
  _crowdednessReports: CrowdednessReport[]
): number {
  let score = 50; // Base score

  // Factor 1: Facilities availability (up to 30 points)
  const facilitiesScore = Math.min(30, (location.facilities?.length || 0) * 5);
  score += facilitiesScore;

  // Factor 2: Review ratings (up to 15 points)
  if (reviews.length > 0) {
    const avgRating = reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length;
    score += Math.min(15, (avgRating / 5) * 15);
  }

  // Factor 3: Taiwan-specific features
  const taiwanFeaturesCount = countTaiwanSpecificFeatures(location);
  score += Math.min(10, taiwanFeaturesCount * 2);

  // Factor 4: Data completeness
  score += calculateDataCompletenessScore(location) * 0.05;

  return Math.min(100, Math.round(score));
}

/**
 * Extract safety concerns from reviews
 */
export function extractSafetyConcerns(reviews: Review[]): string[] {
  const concerns: string[] = [];
  const keywordMap: Record<string, string> = {
    '不安全|危險|摔倒|受傷': 'Safety concerns reported',
    'unsafe|dangerous|fell|injured': 'Safety concerns reported',
    '衛生|髒|細菌|清潔': 'Cleanliness issues',
    'dirty|hygiene|bacteria|unclean': 'Cleanliness issues',
    '擁擠|排隊|人多': 'Crowded conditions',
    'crowded|busy|long wait': 'Crowded conditions',
    '昂貴|價格|太貴': 'High pricing',
    'expensive|overpriced|costly': 'High pricing',
    '無障礙|輪椅|樓梯': 'Accessibility issues',
    'wheelchair|stairs|not accessible': 'Accessibility issues',
  };

  reviews
    .filter(r => r.rating && r.rating < 3)
    .forEach(review => {
      const comment = (review.comment || '').toLowerCase();
      Object.entries(keywordMap).forEach(([keywords, concern]) => {
        const pattern = new RegExp(keywords);
        if (pattern.test(comment) && !concerns.includes(concern)) {
          concerns.push(concern);
        }
      });
    });

  return concerns.slice(0, 5); // Top 5 concerns
}

/**
 * Extract location strengths from reviews
 */
export function extractLocationStrengths(reviews: Review[]): string[] {
  const strengths: string[] = [];
  const keywordMap: Record<string, string> = {
    '很棒|很好|推薦|喜歡|完美': 'Highly recommended',
    'excellent|great|love|perfect|recommend': 'Highly recommended',
    '乾淨|整潔|衛生': 'Very clean',
    'clean|immaculate|hygienic': 'Very clean',
    '工作人員|服務|親切|友善': 'Friendly staff',
    'staff|service|friendly|helpful': 'Friendly staff',
    '便宜|划算|划得來': 'Good value',
    'affordable|worth|great value': 'Good value',
    '無障礙|適合|容易': 'Very accessible',
    'accessible|easy|wheelchair friendly': 'Very accessible',
    '小孩喜歡|家庭|孩子': 'Family-friendly',
    'kids love|family|children': 'Family-friendly',
  };

  reviews
    .filter(r => r.rating && r.rating >= 4)
    .forEach(review => {
      const comment = (review.comment || '').toLowerCase();
      Object.entries(keywordMap).forEach(([keywords, strength]) => {
        const pattern = new RegExp(keywords);
        if (pattern.test(comment) && !strengths.includes(strength)) {
          strengths.push(strength);
        }
      });
    });

  return strengths.slice(0, 5); // Top 5 strengths
}

/**
 * Determine recommended age groups based on location features
 */
export function getRecommendedAgeGroups(location: Location): string[] {
  const ageGroups: string[] = [];

  // Check for infant facilities
  if (
    location.infantSpecific?.suitableForNewborns ||
    location.nursingRoom?.hasDedicatedNursingRoom ||
    (location.highChair?.hasHighChairs && location.highChair.highChairQuantity && location.highChair.highChairQuantity > 0)
  ) {
    ageGroups.push('Infants (0-1)');
  }

  // Check for toddler facilities
  if (
    location.playgroundAndActivity ||
    location.facilities?.includes('playground') ||
    location.storageLocker
  ) {
    ageGroups.push('Toddlers (1-3)');
  }

  // Check for preschool amenities
  if (
    location.kidsClassesAndWorkshops ||
    location.events ||
    location.entertainmentSchedule
  ) {
    ageGroups.push('Preschool (3-5)');
  }

  // Check for school-age activities
  if (
    location.playgroundAndActivity?.schoolAgePlayEquipment?.length ||
    location.eventSpace ||
    location.kidsClassesAndWorkshops
  ) {
    ageGroups.push('School-age (6-12)');
  }

  // Most venues work for teens
  ageGroups.push('Teens (13+)');

  return ageGroups.length > 0 ? ageGroups : ['All ages'];
}

/**
 * Determine best time to visit based on crowdedness patterns
 */
export function getBestTimeToVisit(
  _location: Location,
  crowdednessReports: CrowdednessReport[]
): string {
  if (crowdednessReports.length === 0) return 'No data available';

  const weekdayReports = crowdednessReports.filter(r => {
    const date = new Date(r.createdAt || new Date());
    const day = date.getDay();
    return day !== 0 && day !== 6; // Not weekend
  });

  const weekendReports = crowdednessReports.filter(r => {
    const date = new Date(r.createdAt || new Date());
    const day = date.getDay();
    return day === 0 || day === 6; // Weekend
  });

  let bestTime = '';

  if (
    weekdayReports.length > weekendReports.length &&
    weekdayReports.filter(r => r.crowdingLevel === 'light').length > weekdayReports.length / 2
  ) {
    bestTime = 'Weekdays (light crowds)';
  } else if (
    weekendReports.length > 0 &&
    weekendReports.filter(r => r.crowdingLevel === 'light').length > weekendReports.length / 2
  ) {
    bestTime = 'Weekends';
  } else {
    bestTime = 'Mornings or weekday afternoons';
  }

  return bestTime;
}

/**
 * Calculate accessibility score
 */
export function calculateAccessibilityScore(location: Location): number {
  let score = 0;
  let factors = 0;

  // Stroller accessibility
  if (location.stroller?.strollerFriendly) {
    score += 15;
  }
  factors += 15;

  // Wheelchair accessibility
  if (location.accessibility?.wheelchairAccessible) {
    score += 15;
  }
  factors += 15;

  // Elevator/ramp availability
  if (
    location.accessibility?.hasElevator ||
    location.accessibility?.hasRamp
  ) {
    score += 15;
  }
  factors += 15;

  // Accessible toilets
  if (location.accessibility?.accessibleToilet) {
    score += 15;
  }
  factors += 15;

  // Disabled parking
  if (location.accessibility?.disabledParking) {
    score += 10;
  }
  factors += 10;

  // Nursing facilities
  if (location.nursingRoom?.hasDedicatedNursingRoom) {
    score += 15;
  }
  factors += 15;

  // Stroller storage
  if (location.stroller?.hasStrollerStorage) {
    score += 10;
  }
  factors += 10;

  return factors > 0 ? Math.round((score / factors) * 100) : 0;
}

/**
 * Assess family compatibility for a specific family profile
 */
export function assessFamilyCompatibility(
  location: Location,
  reviews: Review[],
  familyProfile?: {
    childrenAges: number[];
    specialNeeds?: string[];
    budget?: 'low' | 'medium' | 'high';
    accessibilityNeeds?: string[];
  }
): FamilyCompatibility {
  const reasons: string[] = [];
  const improvements: string[] = [];
  let compatibilityScore = 70;

  if (!familyProfile) {
    return {
      overallScore: compatibilityScore,
      ageAppropriate: true,
      accessibilityMet: true,
      specialNeedsFriendly: true,
      valueAcceptable: true,
      reasons: ['Location appears family-friendly'],
      improvements: [],
    };
  }

  // Check age appropriateness
  const recommendedAges = getRecommendedAgeGroups(location);
  const childAgesMatch = familyProfile.childrenAges.some(age => {
    if (age < 1 && recommendedAges.includes('Infants (0-1)')) return true;
    if (age < 3 && recommendedAges.includes('Toddlers (1-3)')) return true;
    if (age < 6 && recommendedAges.includes('Preschool (3-5)')) return true;
    if (age < 13 && recommendedAges.includes('School-age (6-12)')) return true;
    return recommendedAges.includes('Teens (13+)');
  });

  if (childAgesMatch) {
    reasons.push('Suitable for your children\'s ages');
  } else {
    compatibilityScore -= 20;
    improvements.push('May not be ideal for your children\'s current ages');
  }

  // Check accessibility needs
  const accessibilityScore = calculateAccessibilityScore(location);
  if (accessibilityScore > 60) {
    reasons.push('Good accessibility features');
  } else if (familyProfile.accessibilityNeeds?.length) {
    compatibilityScore -= 15;
    improvements.push('Limited accessibility features for your needs');
  }

  // Check for special needs services
  if (
    familyProfile.specialNeeds?.includes('autism') &&
    location.specialNeeds?.hasAutismFriendlyHours
  ) {
    reasons.push('Offers autism-friendly services');
  } else if (location.specialNeeds && familyProfile.specialNeeds?.length) {
    reasons.push('Has special needs services available');
  } else if (familyProfile.specialNeeds?.length) {
    improvements.push('Check special needs services availability');
  }

  // Check budget appropriateness
  if (familyProfile.budget === 'low' && reviews.length > 0) {
    const affordabilityComments = reviews.filter(r =>
      /cheap|affordable|good value|expensive/i.test(r.comment || '')
    );
    if (
      affordabilityComments.filter(r => /cheap|affordable|good value/i.test(r.comment || ''))
        .length > affordabilityComments.length / 2
    ) {
      reasons.push('Appears affordable');
    } else {
      compatibilityScore -= 10;
      improvements.push('May be on the pricier side');
    }
  }

  return {
    overallScore: Math.max(0, Math.min(100, compatibilityScore)),
    ageAppropriate: childAgesMatch,
    accessibilityMet: calculateAccessibilityScore(location) > 50,
    specialNeedsFriendly: !!location.specialNeeds,
    valueAcceptable: true,
    reasons,
    improvements,
  };
}

/**
 * Count Taiwan-specific features implemented for a location
 */
export function countTaiwanSpecificFeatures(location: Location): number {
  let count = 0;

  if (location.publicTransit) count++;
  if (location.parking) count++;
  if (location.toilet) count++;
  if (location.hasWiFi) count++;
  if (location.allergens) count++;
  if (location.nursingRoom) count++;
  if (location.seasonal) count++;
  if (location.payment) count++;
  if (location.outsideFood) count++;
  if (location.stroller) count++;
  if (location.reservedTimes) count++;
  if (location.operatingHours) count++;
  if (location.booking) count++;
  if (location.climateComfort) count++;
  if (location.sanitationProtocols) count++;
  if (location.staffLanguage) count++;
  if (location.waterSafety) count++;
  if (location.highChair) count++;
  if (location.ageSpecificBathroom) count++;
  if (location.lostChildProtocol) count++;
  if (location.parentRestArea) count++;
  if (location.eventSpace) count++;
  if (location.specialNeeds) count++;
  if (location.medicalServices) count++;
  if (location.entertainmentSchedule) count++;
  if (location.photoVideo) count++;
  if (location.visitDuration) count++;
  if (location.schoolHolidays) count++;
  if (location.queueWaitTime) count++;
  if (location.infantSpecific) count++;
  if (location.storageLocker) count++;
  if (location.equipmentRental) count++;
  if (location.membership) count++;
  if (location.onSiteDining) count++;
  if (location.playgroundAndActivity) count++;
  if (location.photographySpotsAndServices) count++;
  if (location.kidsClassesAndWorkshops) count++;
  if (location.weatherAndSunSafety) count++;
  if (location.walkingDistanceAndDifficulty) count++;
  if (location.noiseAndSensoryEnvironment) count++;
  if (location.insectAndAllergenEnvironment) count++;
  if (location.rainyDayAlternatives) count++;
  if (location.rideRestrictions) count++;
  if (location.airQuality) count++;

  return count;
}

/**
 * Calculate data completeness score
 */
export function calculateDataCompletenessScore(location: Location): number {
  const totalFields = countTaiwanSpecificFeatures(location) + 15; // +15 for basic fields
  return Math.min(100, (totalFields / 46) * 100); // 46 = total possible Taiwan features + basic
}

/**
 * Generate verification score based on review count and ratings
 */
export function calculateVerificationScore(reviews: Review[]): number {
  if (reviews.length === 0) return 0;
  if (reviews.length < 3) return 30;
  if (reviews.length < 10) return 60;
  if (reviews.length < 20) return 80;
  return 100;
}

/**
 * Calculate average crowdiness from reports
 */
export function calculateAverageCrowdiness(
  crowdednessReports: CrowdednessReport[]
): 'light' | 'moderate' | 'heavy' | 'unknown' {
  if (crowdednessReports.length === 0) return 'unknown';

  const crowdinessMap: Record<string, number> = {
    light: 1,
    moderate: 2,
    heavy: 3,
  };

  const avgScore =
    crowdednessReports.reduce((sum, r) => sum + (crowdinessMap[r.crowdingLevel] || 0), 0) /
    crowdednessReports.length;

  if (avgScore < 1.5) return 'light';
  if (avgScore < 2.5) return 'moderate';
  return 'heavy';
}

/**
 * Generate comprehensive location insight
 */
export function generateLocationInsight(
  location: Location,
  reviews: Review[],
  crowdednessReports: CrowdednessReport[]
): LocationInsight {
  const avgRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length : 0;

  return {
    familySuitabilityScore: calculateFamilySuitabilityScore(
      location,
      reviews,
      crowdednessReports
    ),
    safetyRating: avgRating,
    cleanlinessRating: avgRating,
    valueForMoneyRating: avgRating,
    accessibilityScore: calculateAccessibilityScore(location),
    staffRating: avgRating,
    commonConcerns: extractSafetyConcerns(reviews),
    topStrengths: extractLocationStrengths(reviews),
    recommendedAgeGroups: getRecommendedAgeGroups(location),
    bestTimeToVisit: getBestTimeToVisit(location, crowdednessReports),
    averageCrowdiness: calculateAverageCrowdiness(crowdednessReports),
    lastUpdated: new Date().toISOString(),
    totalReviews: reviews.length,
    verificationScore: calculateVerificationScore(reviews),
  };
}
