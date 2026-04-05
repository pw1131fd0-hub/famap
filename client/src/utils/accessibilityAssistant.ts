/**
 * Smart Accessibility & Special Needs Recommender
 * Helps families with special needs children find suitable venues
 * Considers accessibility features, sensory environment, medical facilities, and visit conditions
 */

export interface SpecialNeedsProfile {
  id: string;
  childName: string;
  age: number;
  conditions: SpecialCondition[];
  accessibilityRequirements: AccessibilityRequirement[];
  sensoryPreferences: SensoryProfile;
  medicalNeeds: MedicalProfile;
  communicationStyle: 'verbal' | 'aac' | 'nonverbal' | 'mixed';
  mobilityNeeds: MobilityProfile;
}

export interface SpecialCondition {
  type: 'autism' | 'adhd' | 'cerebral_palsy' | 'downs_syndrome' | 'visual_impairment' | 'hearing_impairment' | 'mobility_impairment' | 'anxiety' | 'allergy' | 'dietary_restriction' | 'other';
  severity: 'mild' | 'moderate' | 'severe';
  notes: string;
}

export interface AccessibilityRequirement {
  type: 'wheelchair_accessible' | 'elevator' | 'accessible_bathroom' | 'changing_table' | 'nursing_room' | 'quiet_space' | 'sensory_friendly' | 'ramp' | 'accessible_parking' | 'accessible_seating';
  priority: 'critical' | 'important' | 'nice_to_have';
}

export interface SensoryProfile {
  soundSensitivity: 'low' | 'normal' | 'high';
  lightSensitivity: 'low' | 'normal' | 'high';
  touchSensitivity: 'low' | 'normal' | 'high';
  crowdTolerance: 'low' | 'normal' | 'high';
  avoidsTriggers: string[];
}

export interface MedicalProfile {
  allergies: string[];
  dietaryRestrictions: string[];
  medicationsNeeded: string[];
  hasAEpinePen: boolean;
  nearbyHospitalRequired: boolean;
  firstAidRequired: boolean;
}

export interface MobilityProfile {
  useWheelchair: boolean;
  usesWalker: boolean;
  usesOtherDevice: string;
  fatigueLevels: 'low' | 'normal' | 'high';
  maxWalkingDistance: number; // in meters
}

export interface VenueAccessibilityAssessment {
  venueId: string;
  venueName: string;
  accessibilityScore: number; // 0-100
  suitabilityScore: number; // 0-100
  matchScore: number; // 0-100, considering child's specific profile
  accessibilityFeatures: AccessibilityFeature[];
  sensoryEnvironment: SensoryEnvironmentAssessment;
  medicalFacilities: MedicalFacility[];
  bestVisitTimes: BestVisitTime[];
  warnings: AccessibilityWarning[];
  recommendations: AccessibilityRecommendation[];
  confidence: number; // 0-100, based on data completeness
}

export interface AccessibilityFeature {
  type: AccessibilityRequirement['type'];
  available: boolean;
  quality: 'poor' | 'fair' | 'good' | 'excellent';
  details: string;
}

export interface SensoryEnvironmentAssessment {
  noiseLevel: 'very_quiet' | 'quiet' | 'moderate' | 'loud' | 'very_loud';
  lightingType: 'natural' | 'artificial' | 'mixed';
  crowdExpectation: 'empty' | 'light' | 'moderate' | 'busy' | 'very_busy';
  hasQuietZone: boolean;
  hasBreakRoom: boolean;
  suitableForAutism: number; // 0-100
  suitableForAdhd: number; // 0-100
  suitableForAnxiety: number; // 0-100
}

export interface MedicalFacility {
  type: 'first_aid' | 'aed' | 'pharmacy' | 'hospital' | 'clinic';
  distance: number; // in meters
  availability: string;
}

export interface BestVisitTime {
  dayOfWeek: string;
  time: string;
  crowdLevel: number; // 0-100
  reasonSuitable: string;
  suitabilityScore: number; // 0-100
}

export interface AccessibilityWarning {
  severity: 'low' | 'medium' | 'high';
  message: string;
  affectingConditions: SpecialCondition['type'][];
}

export interface AccessibilityRecommendation {
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  actionItems: string[];
}

/**
 * Create a special needs profile for tracking accessibility requirements
 */
export function createSpecialNeedsProfile(
  childName: string,
  age: number,
  conditions: SpecialCondition[],
  accessibilityRequirements: AccessibilityRequirement[] = []
): SpecialNeedsProfile {
  return {
    id: `profile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    childName,
    age,
    conditions,
    accessibilityRequirements,
    sensoryPreferences: {
      soundSensitivity: 'normal',
      lightSensitivity: 'normal',
      touchSensitivity: 'normal',
      crowdTolerance: 'normal',
      avoidsTriggers: [],
    },
    medicalNeeds: {
      allergies: [],
      dietaryRestrictions: [],
      medicationsNeeded: [],
      hasAEpinePen: false,
      nearbyHospitalRequired: false,
      firstAidRequired: false,
    },
    communicationStyle: 'verbal',
    mobilityNeeds: {
      useWheelchair: false,
      usesWalker: false,
      usesOtherDevice: '',
      fatigueLevels: 'normal',
      maxWalkingDistance: 1000,
    },
  };
}

/**
 * Assess venue accessibility for a specific special needs profile
 */
export function assessVenueAccessibility(
  venueId: string,
  venueName: string,
  profile: SpecialNeedsProfile,
  venueData: {
    accessibilityFeatures?: AccessibilityFeature[];
    noiseLevel?: SensoryEnvironmentAssessment['noiseLevel'];
    crowdExpectation?: SensoryEnvironmentAssessment['crowdExpectation'];
    hasQuietZone?: boolean;
    hasBreakRoom?: boolean;
    medicalFacilities?: MedicalFacility[];
    bestVisitTimes?: BestVisitTime[];
  }
): VenueAccessibilityAssessment {
  const {
    accessibilityFeatures = [],
    noiseLevel = 'moderate',
    crowdExpectation = 'moderate',
    hasQuietZone = false,
    hasBreakRoom = false,
    medicalFacilities = [],
    bestVisitTimes = [],
  } = venueData;

  // Calculate accessibility score based on critical features
  const criticalRequirements = profile.accessibilityRequirements.filter(
    (r) => r.priority === 'critical'
  );
  const criticalMet = criticalRequirements.filter((req) =>
    accessibilityFeatures.some((f) => f.type === req.type && f.available)
  ).length;
  const accessibilityScore =
    criticalRequirements.length > 0
      ? (criticalMet / criticalRequirements.length) * 100
      : 75;

  // Assess sensory environment
  const sensoryEnvironment = assessSensoryEnvironment(
    noiseLevel,
    crowdExpectation,
    hasQuietZone,
    hasBreakRoom,
    profile.sensoryPreferences,
    profile.conditions
  );

  // Check medical facilities
  const medicalFacilitiesScore = calculateMedicalFacilitiesScore(
    medicalFacilities,
    profile.medicalNeeds
  );

  // Generate warnings based on profile
  const warnings = generateAccessibilityWarnings(profile, {
    noiseLevel,
    crowdExpectation,
    accessibilityFeatures,
    medicalFacilities,
  });

  // Calculate match score (considering child's specific needs)
  const matchScore = calculateMatchScore(
    accessibilityScore,
    sensoryEnvironment,
    medicalFacilitiesScore,
    warnings
  );

  // Generate recommendations
  const recommendations = generateRecommendations(
    profile,
    accessibilityFeatures,
    sensoryEnvironment,
    medicalFacilities,
    warnings
  );

  const suitabilityScore = Math.round(
    (accessibilityScore + sensoryEnvironment.suitableForAutism) / 2
  );

  return {
    venueId,
    venueName,
    accessibilityScore: Math.round(accessibilityScore),
    suitabilityScore,
    matchScore: Math.round(matchScore),
    accessibilityFeatures,
    sensoryEnvironment,
    medicalFacilities,
    bestVisitTimes: bestVisitTimes.slice(0, 3),
    warnings,
    recommendations,
    confidence: 85, // Default confidence based on available data
  };
}

/**
 * Assess sensory environment suitability
 */
function assessSensoryEnvironment(
  noiseLevel: string,
  crowdExpectation: string,
  hasQuietZone: boolean,
  hasBreakRoom: boolean,
  sensorySensitivities: SensoryProfile,
  conditions: SpecialCondition[]
): SensoryEnvironmentAssessment {
  const _autismCondition = conditions.find((c) => c.type === 'autism');
  const _adhdCondition = conditions.find((c) => c.type === 'adhd');
  const _anxietyCondition = conditions.find((c) => c.type === 'anxiety');

  // Calculate suitability for different conditions
  const suitableForAutism = calculateAutismSuitability(
    noiseLevel,
    crowdExpectation,
    hasQuietZone,
    hasBreakRoom,
    sensorySensitivities
  );

  const suitableForAdhd = calculateAdhdSuitability(
    noiseLevel,
    crowdExpectation,
    hasQuietZone
  );

  const suitableForAnxiety = calculateAnxietySuitability(
    crowdExpectation,
    hasQuietZone,
    hasBreakRoom
  );

  return {
    noiseLevel: (noiseLevel as any) || 'moderate',
    lightingType: 'mixed',
    crowdExpectation: (crowdExpectation as any) || 'moderate',
    hasQuietZone,
    hasBreakRoom,
    suitableForAutism,
    suitableForAdhd,
    suitableForAnxiety,
  };
}

function calculateAutismSuitability(
  noiseLevel: string,
  crowdExpectation: string,
  hasQuietZone: boolean,
  hasBreakRoom: boolean,
  sensorySensitivities: SensoryProfile
): number {
  let score = 100;

  // Penalize for noise if sensitive
  if (sensorySensitivities.soundSensitivity === 'high') {
    if (noiseLevel === 'very_loud') score -= 40;
    else if (noiseLevel === 'loud') score -= 25;
    else if (noiseLevel === 'moderate') score -= 10;
  }

  // Penalize for crowding
  if (crowdExpectation === 'very_busy') score -= 30;
  else if (crowdExpectation === 'busy') score -= 20;

  // Reward for quiet zones and break rooms
  if (hasQuietZone) score += 15;
  if (hasBreakRoom) score += 10;

  return Math.min(100, Math.max(0, score));
}

function calculateAdhdSuitability(
  noiseLevel: string,
  crowdExpectation: string,
  hasQuietZone: boolean
): number {
  let score = 100;

  // ADHD kids often need stimulation, so loud is not necessarily bad
  // But very busy is challenging
  if (crowdExpectation === 'very_busy') score -= 25;
  else if (crowdExpectation === 'busy') score -= 10;

  // Quiet zone helps for breaks
  if (hasQuietZone) score += 10;

  return Math.min(100, Math.max(0, score));
}

function calculateAnxietySuitability(
  crowdExpectation: string,
  hasQuietZone: boolean,
  hasBreakRoom: boolean
): number {
  let score = 100;

  // Anxiety is exacerbated by crowds
  if (crowdExpectation === 'very_busy') score -= 35;
  else if (crowdExpectation === 'busy') score -= 20;
  else if (crowdExpectation === 'moderate') score -= 5;

  // Quiet zones and break rooms are critical
  if (hasQuietZone) score += 20;
  if (hasBreakRoom) score += 20;

  return Math.min(100, Math.max(0, score));
}

/**
 * Calculate medical facilities score
 */
function calculateMedicalFacilitiesScore(
  medicalFacilities: MedicalFacility[],
  medicalNeeds: MedicalProfile
): number {
  if (!medicalNeeds.firstAidRequired && medicalFacilities.length === 0)
    return 80;

  let score = 60;

  // Check for required facilities
  if (medicalNeeds.firstAidRequired) {
    const hasFirstAid = medicalFacilities.some((f) => f.type === 'first_aid');
    if (hasFirstAid) score += 20;
  }

  if (medicalNeeds.nearbyHospitalRequired) {
    const hasHospital = medicalFacilities.some(
      (f) => f.type === 'hospital' && f.distance < 2000
    );
    if (hasHospital) score += 15;
  }

  // Reward for proximity
  const avgDistance =
    medicalFacilities.length > 0
      ? medicalFacilities.reduce((sum, f) => sum + f.distance, 0) /
        medicalFacilities.length
      : 0;

  if (avgDistance > 0 && avgDistance < 500) score += 10;
  if (avgDistance > 500 && avgDistance < 1000) score += 5;

  return Math.min(100, Math.max(0, score));
}

/**
 * Generate warnings based on profile and venue data
 */
function generateAccessibilityWarnings(
  profile: SpecialNeedsProfile,
  venueData: {
    noiseLevel?: string;
    crowdExpectation?: string;
    accessibilityFeatures?: AccessibilityFeature[];
    medicalFacilities?: MedicalFacility[];
  }
): AccessibilityWarning[] {
  const warnings: AccessibilityWarning[] = [];

  // Check critical accessibility features
  const missingCritical = profile.accessibilityRequirements
    .filter((r) => r.priority === 'critical')
    .filter(
      (req) =>
        !(venueData.accessibilityFeatures || []).some(
          (f) => f.type === req.type && f.available
        )
    );

  if (missingCritical.length > 0) {
    warnings.push({
      severity: 'high',
      message: `Missing critical accessibility features: ${missingCritical
        .map((f) => f.type)
        .join(', ')}`,
      affectingConditions: profile.conditions.map((c) => c.type),
    });
  }

  // Check for autism-specific concerns
  if (profile.conditions.some((c) => c.type === 'autism')) {
    if (venueData.noiseLevel === 'very_loud') {
      warnings.push({
        severity: 'high',
        message:
          'Venue is very loud - may be overwhelming for child with autism',
        affectingConditions: ['autism'],
      });
    }
    if (venueData.crowdExpectation === 'very_busy' && !venueData.accessibilityFeatures?.some(f => f.type === 'quiet_space')) {
      warnings.push({
        severity: 'medium',
        message: 'Venue is very busy with no quiet space available',
        affectingConditions: ['autism'],
      });
    }
  }

  // Check medical needs
  if (profile.medicalNeeds.nearbyHospitalRequired) {
    const hasNearbyHospital = (venueData.medicalFacilities || []).some(
      (f) => f.type === 'hospital' && f.distance < 2000
    );
    if (!hasNearbyHospital) {
      warnings.push({
        severity: 'high',
        message:
          'No nearby hospital - critical for medical needs',
        affectingConditions: profile.conditions.map((c) => c.type),
      });
    }
  }

  return warnings;
}

/**
 * Calculate overall match score
 */
function calculateMatchScore(
  accessibilityScore: number,
  sensoryEnvironment: SensoryEnvironmentAssessment,
  medicalFacilitiesScore: number,
  warnings: AccessibilityWarning[]
): number {
  const highSeverityWarnings = warnings.filter((w) => w.severity === 'high')
    .length;
  const mediumSeverityWarnings = warnings.filter((w) => w.severity === 'medium')
    .length;

  let score =
    (accessibilityScore * 0.4 +
      sensoryEnvironment.suitableForAutism * 0.3 +
      medicalFacilitiesScore * 0.3) /
    1;

  // Reduce score based on warnings
  score -= highSeverityWarnings * 15;
  score -= mediumSeverityWarnings * 5;

  return Math.min(100, Math.max(0, score));
}

/**
 * Generate actionable recommendations
 */
function generateRecommendations(
  profile: SpecialNeedsProfile,
  accessibilityFeatures: AccessibilityFeature[],
  sensoryEnvironment: SensoryEnvironmentAssessment,
  _medicalFacilities: MedicalFacility[],
  _warnings: AccessibilityWarning[]
): AccessibilityRecommendation[] {
  const recommendations: AccessibilityRecommendation[] = [];

  // Recommendation based on accessibility
  if (!accessibilityFeatures.some((f) => f.type === 'wheelchair_accessible')) {
    recommendations.push({
      title: 'Check accessibility in advance',
      description: 'Contact venue before visiting to confirm wheelchair access',
      impact: 'high',
      actionItems: [
        'Call venue to confirm accessible entrances',
        'Ask about accessible restrooms',
        'Inquire about parking options',
      ],
    });
  }

  // Recommendation for sensory sensitivities
  if (
    profile.conditions.some((c) => c.type === 'autism') &&
    sensoryEnvironment.crowdExpectation === 'busy'
  ) {
    recommendations.push({
      title: 'Visit during off-peak hours',
      description: 'The venue is typically busy; consider quieter times',
      impact: 'high',
      actionItems: [
        'Visit early morning (8-10am) for quieter experience',
        'Avoid weekends and holidays',
        'Check for sensory-friendly hours if available',
      ],
    });
  }

  // Recommendation for medical preparedness
  if (profile.medicalNeeds.allergies.length > 0) {
    recommendations.push({
      title: 'Prepare for allergies',
      description: `Child has allergies to: ${profile.medicalNeeds.allergies.join(
        ', '
      )}`,
      impact: 'high',
      actionItems: [
        'Bring allergy-friendly snacks',
        'Confirm food handling practices with venue',
        'Have epinephrine auto-injector if needed',
        'Inform staff of allergies upon arrival',
      ],
    });
  }

  // General preparedness
  recommendations.push({
    title: 'Prepare visit schedule',
    description: 'Plan the visit structure to ensure comfort',
    impact: 'medium',
    actionItems: [
      `Plan for ${
        profile.mobilityNeeds.maxWalkingDistance / 1000
      }km maximum walking`,
      'Schedule breaks at quiet zones',
      'Bring comfort items and sensory tools',
      'Have emergency contact information ready',
    ],
  });

  return recommendations;
}

/**
 * Find best venues for a special needs profile
 */
export function findBestAccessibleVenues(
  profile: SpecialNeedsProfile,
  venues: VenueAccessibilityAssessment[],
  minMatchScore: number = 60
): VenueAccessibilityAssessment[] {
  return venues
    .filter((v) => v.matchScore >= minMatchScore)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 10);
}

/**
 * Generate accessibility-focused outing plan
 */
export interface AccessibilityOutingPlan {
  planId: string;
  venue: VenueAccessibilityAssessment;
  profile: SpecialNeedsProfile;
  estimatedDuration: number; // in minutes
  schedule: ActivitySegment[];
  necessaryPreperation: string[];
  emergencyPlan: string[];
  successMetrics: string[];
}

export interface ActivitySegment {
  time: string;
  activity: string;
  duration: number; // in minutes
  location: string;
  notes: string;
}

export function createAccessibilityOutingPlan(
  profile: SpecialNeedsProfile,
  assessment: VenueAccessibilityAssessment,
  estimatedDuration: number = 120
): AccessibilityOutingPlan {
  const schedule: ActivitySegment[] = [
    {
      time: '09:00',
      activity: 'Arrival and orientation',
      duration: 15,
      location: 'Entrance/Reception',
      notes: 'Let child adjust to environment',
    },
    {
      time: '09:15',
      activity: 'Main activity',
      duration: 60,
      location: 'Main venue area',
      notes: 'Engage with activities at comfortable pace',
    },
    {
      time: '10:15',
      activity: 'Break time',
      duration: 15,
      location: assessment.sensoryEnvironment.hasBreakRoom
        ? 'Break room'
        : 'Quiet area',
      notes: 'Rest and recharge',
    },
    {
      time: '10:30',
      activity: 'Secondary activity/exploration',
      duration: 30,
      location: 'Venue areas',
      notes: 'Light activity or exploration',
    },
    {
      time: '11:00',
      activity: 'Wrap-up and departure',
      duration: 15,
      location: 'Entrance/Exit',
      notes: 'Gradual transition to leaving',
    },
  ];

  return {
    planId: `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    venue: assessment,
    profile,
    estimatedDuration,
    schedule,
    necessaryPreperation: [
      'Bring sensory tools (fidgets, headphones, comfort items)',
      'Pack allergy-friendly snacks',
      'Prepare emergency medications',
      'Print or download venue information',
      'Take photos of exits and facilities for familiarity',
    ],
    emergencyPlan: [
      'Identify quiet/safe spaces in venue',
      'Know location of first aid and medical facilities',
      'Have emergency contact numbers ready',
      'Prepare exit strategy if child becomes overwhelmed',
      'Know venue staff and their contact information',
    ],
    successMetrics: [
      'Child remained calm and engaged',
      'No major sensory overload incidents',
      'Successfully managed dietary restrictions',
      'Positive interactions with environment',
      'Family enjoyed the experience',
    ],
  };
}

/**
 * Compare multiple venues for accessibility
 */
export function compareAccessibleVenues(
  venues: VenueAccessibilityAssessment[],
  profile: SpecialNeedsProfile,
  _compareBy: ('accessibility' | 'sensory' | 'medical' | 'overall')[] = [
    'overall',
  ]
): VenueComparison[] {
  return venues.map((venue) => ({
    venueId: venue.venueId,
    venueName: venue.venueName,
    accessibilityScore: venue.accessibilityScore,
    suitabilityScore: venue.suitabilityScore,
    matchScore: venue.matchScore,
    strengths: identifyStrengths(venue, profile),
    concerns: identifyVenueQuestions(venue, profile),
    recommendation: generateVenueRecommendation(venue, profile),
  }));
}

export interface VenueComparison {
  venueId: string;
  venueName: string;
  accessibilityScore: number;
  suitabilityScore: number;
  matchScore: number;
  strengths: string[];
  concerns: string[];
  recommendation: string;
}

function identifyStrengths(
  venue: VenueAccessibilityAssessment,
  _profile: SpecialNeedsProfile
): string[] {
  const strengths: string[] = [];

  if (venue.accessibilityScore > 80) {
    strengths.push('Excellent accessibility features');
  }
  if (venue.sensoryEnvironment.hasQuietZone) {
    strengths.push('Has designated quiet zone for breaks');
  }
  if (venue.sensoryEnvironment.hasBreakRoom) {
    strengths.push('Has comfortable break room');
  }
  if (venue.medicalFacilities.length > 0) {
    strengths.push('Medical facilities nearby');
  }

  return strengths;
}

function identifyVenueQuestions(
  venue: VenueAccessibilityAssessment,
  profile: SpecialNeedsProfile
): string[] {
  const concerns: string[] = [];

  if (
    profile.accessibilityRequirements.filter((r) => r.priority === 'critical')
      .length > 0
  ) {
    const missingCritical = profile.accessibilityRequirements
      .filter((r) => r.priority === 'critical')
      .filter(
        (req) =>
          !venue.accessibilityFeatures.some(
            (f) => f.type === req.type && f.available
          )
      );
    if (missingCritical.length > 0) {
      concerns.push(`Missing features: ${missingCritical.map((f) => f.type).join(', ')}`);
    }
  }

  if (venue.warnings.length > 0) {
    concerns.push(`${venue.warnings.length} warning(s) to review`);
  }

  return concerns;
}

function generateVenueRecommendation(
  venue: VenueAccessibilityAssessment,
  _profile: SpecialNeedsProfile
): string {
  if (venue.matchScore < 60) {
    return 'Not recommended - accessibility concerns for this profile';
  } else if (venue.matchScore < 75) {
    return 'Possible with preparation - review recommendations carefully';
  } else if (venue.matchScore < 90) {
    return 'Good choice - most needs can be accommodated';
  } else {
    return 'Excellent choice - very suitable for this profile';
  }
}

/**
 * Track accessibility visit outcomes
 */
export interface VisitOutcome {
  venueId: string;
  profileId: string;
  visitDate: string;
  duration: number; // in minutes
  successRating: number; // 1-5
  notes: string;
  challenges: string[];
  highlights: string[];
  wouldReturnSoon: boolean;
}

export function recordVisitOutcome(
  venueId: string,
  profileId: string,
  successRating: number,
  notes: string,
  challenges: string[] = [],
  highlights: string[] = []
): VisitOutcome {
  return {
    venueId,
    profileId,
    visitDate: new Date().toISOString(),
    duration: 0,
    successRating,
    notes,
    challenges,
    highlights,
    wouldReturnSoon: successRating >= 4,
  };
}
