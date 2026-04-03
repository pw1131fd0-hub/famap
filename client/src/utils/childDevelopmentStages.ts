/**
 * Child Development Stages System
 * Provides intelligent recommendations based on child development stages
 * Helps families find venues appropriate for their children's ages
 *
 * Development Stages:
 * - Infants (0-12 months): Nursing, calm environments
 * - Toddlers (1-3 years): Safe play, short visits
 * - Preschool (3-5 years): Interactive play, structured activities
 * - School-age (5-12 years): Adventure, social activities
 * - Teens (12+ years): Social, adventure, independence
 */

export type DevelopmentStage =
  | 'infant'
  | 'toddler'
  | 'preschool'
  | 'school_age'
  | 'teen';

export interface DevelopmentStageInfo {
  stage: DevelopmentStage;
  ageRange: { min: number; max: number };
  label: { zh: string; en: string };
  description: { zh: string; en: string };
  idealFacilities: string[];
  safetyConsiderations: string[];
  typicalVisitDuration: number; // in minutes
  recommendedGroupSize: number;
}

export interface VenueSuitabilityByStage {
  stage: DevelopmentStage;
  suitabilityScore: number; // 0-100
  reasoning: string[];
  idealVisitTime?: string;
  requiredFacilities: string[];
  cautions: string[];
  tips: string[];
}

export interface FamilyStageSuitability {
  overallScore: number; // 0-100
  byStage: VenueSuitabilityByStage[];
  bestForStages: DevelopmentStage[];
  ageApprpriateness: string[];
  recommendedVisitConditions: string[];
}

// Define development stages
const DEVELOPMENT_STAGES: Record<DevelopmentStage, DevelopmentStageInfo> = {
  infant: {
    stage: 'infant',
    ageRange: { min: 0, max: 1 },
    label: { zh: '嬰幼兒', en: 'Infant' },
    description: {
      zh: '0-12個月大，需要靜謐的環境和護理設施',
      en: '0-12 months old, requires quiet environments and nursing facilities'
    },
    idealFacilities: [
      'nursing_room',
      'changing_table',
      'calm_environment',
      'air_quality_control',
      'temperature_control',
      'baby_stroller_parking'
    ],
    safetyConsiderations: [
      'avoid_crowds',
      'avoid_loud_noise',
      'clean_facilities',
      'temperature_stability',
      'air_quality',
      'safe_space_for_stroller'
    ],
    typicalVisitDuration: 60,
    recommendedGroupSize: 1
  },

  toddler: {
    stage: 'toddler',
    ageRange: { min: 1, max: 3 },
    label: { zh: '幼童', en: 'Toddler' },
    description: {
      zh: '1-3歲，開始探索，需要安全且可管理的空間',
      en: '1-3 years old, beginning exploration, needs safe and manageable spaces'
    },
    idealFacilities: [
      'safe_playground',
      'changing_table',
      'nursing_room',
      'restroom',
      'resting_area',
      'shade_areas',
      'water_access'
    ],
    safetyConsiderations: [
      'supervision_areas',
      'safety_barriers',
      'smooth_surfaces',
      'no_sharp_objects',
      'fall_protection',
      'crowd_management'
    ],
    typicalVisitDuration: 90,
    recommendedGroupSize: 2
  },

  preschool: {
    stage: 'preschool',
    ageRange: { min: 3, max: 5 },
    label: { zh: '幼稚園年紀', en: 'Preschool' },
    description: {
      zh: '3-5歲，喜歡互動遊戲和結構化活動',
      en: '3-5 years old, enjoys interactive play and structured activities'
    },
    idealFacilities: [
      'playground',
      'activity_classes',
      'restroom',
      'resting_area',
      'dining_area',
      'water_play_area',
      'climbing_structures'
    ],
    safetyConsiderations: [
      'age_appropriate_equipment',
      'trained_staff',
      'emergency_protocols',
      'allergy_awareness',
      'sun_protection',
      'crowd_management'
    ],
    typicalVisitDuration: 120,
    recommendedGroupSize: 3
  },

  school_age: {
    stage: 'school_age',
    ageRange: { min: 5, max: 12 },
    label: { zh: '學齡兒童', en: 'School-age' },
    description: {
      zh: '5-12歲，喜歡冒險、競爭和社交活動',
      en: '5-12 years old, enjoys adventure, competition, and social activities'
    },
    idealFacilities: [
      'adventure_activities',
      'sports_facilities',
      'climbing_areas',
      'water_activities',
      'educational_programs',
      'restroom',
      'dining_area'
    ],
    safetyConsiderations: [
      'proper_supervision',
      'equipment_maintenance',
      'staff_training',
      'emergency_protocols',
      'activity_restrictions',
      'allergy_management'
    ],
    typicalVisitDuration: 180,
    recommendedGroupSize: 4
  },

  teen: {
    stage: 'teen',
    ageRange: { min: 12, max: 18 },
    label: { zh: '青少年', en: 'Teen' },
    description: {
      zh: '12歲以上，尋求獨立性、挑戰和社交體驗',
      en: '12+ years old, seeks independence, challenges, and social experiences'
    },
    idealFacilities: [
      'advanced_activities',
      'sports_facilities',
      'food_court',
      'social_areas',
      'entertainment',
      'shopping',
      'wifi_internet'
    ],
    safetyConsiderations: [
      'proper_supervision_options',
      'emergency_protocols',
      'staff_training',
      'peer_group_safety',
      'independence_balance'
    ],
    typicalVisitDuration: 240,
    recommendedGroupSize: 5
  }
};

/**
 * Determine child development stage from age
 */
export function getChildDevelopmentStage(ageInYears: number): DevelopmentStage {
  if (ageInYears <= 1) return 'infant';
  if (ageInYears <= 3) return 'toddler';
  if (ageInYears <= 5) return 'preschool';
  if (ageInYears <= 12) return 'school_age';
  return 'teen';
}

/**
 * Get development stage info by stage type
 */
export function getDevelopmentStageInfo(stage: DevelopmentStage): DevelopmentStageInfo {
  return DEVELOPMENT_STAGES[stage];
}

/**
 * Get development stages for a family's children
 */
export function getFamilyDevelopmentStages(childAges: number[]): DevelopmentStage[] {
  const stages = new Set<DevelopmentStage>();
  childAges.forEach(age => {
    stages.add(getChildDevelopmentStage(age));
  });
  return Array.from(stages);
}

/**
 * Calculate venue suitability for a specific development stage
 */
export function calculateVenueSuitabilityForStage(
  stage: DevelopmentStage,
  venueData: {
    category?: string;
    facilities?: string[];
    crowdingLevel?: number;
    ageRange?: { minAge?: number; maxAge?: number };
    accessibility?: {
      stroller?: boolean;
      wheelchair?: boolean;
      nursing?: boolean;
    };
    atmosphere?: {
      noise?: 'quiet' | 'moderate' | 'loud';
      crowds?: 'quiet' | 'moderate' | 'busy';
    };
  }
): VenueSuitabilityByStage {
  const stageInfo = getDevelopmentStageInfo(stage);
  let score = 50; // Start with neutral score
  const reasoning: string[] = [];
  const cautions: string[] = [];
  const tips: string[] = [];

  // Check facilities match
  const matchedFacilities = (venueData.facilities || []).filter(f =>
    stageInfo.idealFacilities.includes(f)
  );
  const facilityScore = (matchedFacilities.length / stageInfo.idealFacilities.length) * 30;
  score += facilityScore;

  if (matchedFacilities.length > 0) {
    reasoning.push(`Has ${matchedFacilities.length} ideal facilities for ${stageInfo.label.en}`);
  } else {
    cautions.push(`Missing some facilities typically needed for ${stageInfo.label.en}`);
  }

  // Check age range match
  if (venueData.ageRange) {
    const stageMin = stageInfo.ageRange.min;
    const stageMax = stageInfo.ageRange.max;
    const venueMin = venueData.ageRange.minAge || 0;
    const venueMax = venueData.ageRange.maxAge || 100;

    // Check overlap
    if (stageMax >= venueMin && stageMin <= venueMax) {
      score += 20;
      reasoning.push('Age range is well-suited');
    } else {
      cautions.push('Age range may not be ideal');
    }
  }

  // Check atmosphere
  if (venueData.atmosphere) {
    if (stage === 'infant' || stage === 'toddler') {
      if (venueData.atmosphere.noise === 'quiet') {
        score += 15;
        reasoning.push('Quiet atmosphere is ideal for infants/toddlers');
      } else if (venueData.atmosphere.noise === 'loud') {
        cautions.push('Loud environment may overwhelm infants/toddlers');
        score -= 15;
      }
    } else if (stage === 'school_age' || stage === 'teen') {
      if (venueData.atmosphere.noise === 'moderate' || venueData.atmosphere.noise === 'loud') {
        score += 10;
        reasoning.push('Activity level matches expectations for school-age children');
      }
    }
  }

  // Check accessibility
  if (stage === 'infant' || stage === 'toddler') {
    if (venueData.accessibility?.stroller) {
      score += 10;
      reasoning.push('Stroller-friendly access');
    } else {
      cautions.push('Limited stroller accessibility');
    }
  }

  // Add stage-specific tips
  switch (stage) {
    case 'infant':
      tips.push('Choose quieter hours for best experience');
      tips.push('Ensure nursing facilities are available');
      tips.push('Check temperature control during visits');
      break;
    case 'toddler':
      tips.push('Schedule visits during quieter times');
      tips.push('Plan for frequent breaks');
      tips.push('Bring comfort items for security');
      break;
    case 'preschool':
      tips.push('Look for structured activities');
      tips.push('Plan 2-hour maximum visit duration');
      tips.push('Check for allergen-friendly food options');
      break;
    case 'school_age':
      tips.push('Advance signups for popular activities');
      tips.push('Allow time for social interaction');
      tips.push('Plan for snack breaks');
      break;
    case 'teen':
      tips.push('Consider peer group dynamics');
      tips.push('Allow for independent exploration');
      tips.push('Plan longer stays for full experience');
      break;
  }

  // Clamp score to 0-100
  score = Math.max(0, Math.min(100, Math.round(score)));

  return {
    stage,
    suitabilityScore: score,
    reasoning,
    requiredFacilities: stageInfo.idealFacilities,
    cautions,
    tips
  };
}

/**
 * Calculate overall family suitability for a venue
 */
export function calculateFamilySuitability(
  childAges: number[],
  venueData: Parameters<typeof calculateVenueSuitabilityForStage>[1]
): FamilyStageSuitability {
  const stages = getFamilyDevelopmentStages(childAges);
  const suitabilityByStage = stages.map(stage =>
    calculateVenueSuitabilityForStage(stage, venueData)
  );

  // Calculate overall score (average of all child stages)
  const overallScore =
    suitabilityByStage.length > 0
      ? Math.round(
          suitabilityByStage.reduce((sum, s) => sum + s.suitabilityScore, 0) /
            suitabilityByStage.length
        )
      : 0;

  // Identify best fit stages
  const sortedByScore = [...suitabilityByStage].sort((a, b) =>
    b.suitabilityScore - a.suitabilityScore
  );
  const bestForStages = sortedByScore
    .filter(s => s.suitabilityScore >= 50)
    .map(s => s.stage);

  // Compile age appropriateness notes
  const ageApprpriateness: string[] = [];
  suitabilityByStage.forEach(s => {
    const stageInfo = getDevelopmentStageInfo(s.stage);
    if (s.suitabilityScore >= 70) {
      ageApprpriateness.push(
        `Excellent for ${stageInfo.label.en} (${stageInfo.ageRange.min}-${stageInfo.ageRange.max} years)`
      );
    } else if (s.suitabilityScore >= 50) {
      ageApprpriateness.push(
        `Suitable for ${stageInfo.label.en} with preparation`
      );
    } else {
      ageApprpriateness.push(
        `Less ideal for ${stageInfo.label.en}`
      );
    }
  });

  // Compile recommended visit conditions
  const recommendedVisitConditions: string[] = [];
  if (childAges.some(age => age < 3)) {
    recommendedVisitConditions.push('Visit during quiet hours (weekday mornings)');
  }
  if (childAges.some(age => age >= 5)) {
    recommendedVisitConditions.push('Allow 2-3 hours for full experience');
  }
  if (childAges.some(age => age < 1)) {
    recommendedVisitConditions.push('Ensure nursing room is available and accessible');
  }

  return {
    overallScore,
    byStage: suitabilityByStage,
    bestForStages,
    ageApprpriateness,
    recommendedVisitConditions
  };
}

/**
 * Get tips for visiting with children in a specific stage
 */
export function getStageTips(stage: DevelopmentStage, lang: 'zh' | 'en' = 'en'): string[] {
  const stageTips: Record<DevelopmentStage, { zh: string[]; en: string[] }> = {
    infant: {
      zh: [
        '選擇靜謐的時段和地點',
        '確保哺乳室設施完善',
        '帶齊所有嬰幼兒用品',
        '檢查空氣質量和溫度',
        '避開人多時段'
      ],
      en: [
        'Choose quiet times and peaceful venues',
        'Ensure proper nursing facilities',
        'Bring all necessary infant supplies',
        'Check air quality and temperature',
        'Avoid peak hours'
      ]
    },
    toddler: {
      zh: [
        '計劃短時間訪問（60-90分鐘）',
        '選擇低噪音環境',
        '帶上舒適物品和零食',
        '確保安全遊樂設施',
        '有充足的監督空間'
      ],
      en: [
        'Plan short visits (60-90 minutes)',
        'Choose low-noise environments',
        'Bring comfort items and snacks',
        'Ensure safe play equipment',
        'Have adequate supervision areas'
      ]
    },
    preschool: {
      zh: [
        '尋找結構化活動',
        '計劃2小時的訪問時間',
        '檢查過敏友善食物選項',
        '帶上備用衣物',
        '選擇上午或下午的較靜時段'
      ],
      en: [
        'Look for structured activities',
        'Plan 2-hour visits',
        'Check for allergy-friendly options',
        'Bring change of clothes',
        'Choose morning or mid-afternoon visits'
      ]
    },
    school_age: {
      zh: [
        '提前報名受歡迎的活動',
        '允許與朋友社交互動',
        '計劃包括零食時間',
        '帶上防曬和水',
        '考慮孩子的興趣和技能'
      ],
      en: [
        'Pre-register for popular activities',
        'Allow time for social interaction',
        'Plan for snack breaks',
        'Bring sunscreen and water',
        'Consider child\'s interests and skill level'
      ]
    },
    teen: {
      zh: [
        '允許獨立探索',
        '考慮同齡人群動態',
        '規劃更長的訪問時間',
        '確保有適合年齡的活動',
        '尊重隱私和獨立性需求'
      ],
      en: [
        'Allow for independent exploration',
        'Consider peer group dynamics',
        'Plan longer visit durations',
        'Ensure age-appropriate activities',
        'Respect need for privacy and independence'
      ]
    }
  };

  return stageTips[stage][lang];
}

/**
 * Format development stage for display
 */
export function formatDevelopmentStage(
  stage: DevelopmentStage,
  lang: 'zh' | 'en' = 'en'
): string {
  const stageInfo = getDevelopmentStageInfo(stage);
  return stageInfo.label[lang];
}

/**
 * Get age range for a development stage
 */
export function getAgeRangeForStage(stage: DevelopmentStage): string {
  const stageInfo = getDevelopmentStageInfo(stage);
  return `${stageInfo.ageRange.min}-${stageInfo.ageRange.max} years`;
}
