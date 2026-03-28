/**
 * Tests for Child Development Stages System
 * Comprehensive tests for venue suitability scoring by child development stage
 */

import { describe, it, expect } from 'vitest';
import {
  getChildDevelopmentStage,
  getDevelopmentStageInfo,
  getFamilyDevelopmentStages,
  calculateVenueSuitabilityForStage,
  calculateFamilySuitability,
  getStageTips,
  formatDevelopmentStage,
  getAgeRangeForStage
} from '../utils/childDevelopmentStages';
import type { DevelopmentStage } from '../utils/childDevelopmentStages';

describe('getChildDevelopmentStage', () => {
  it('should classify infant (0-1 years)', () => {
    expect(getChildDevelopmentStage(0.5)).toBe('infant');
    expect(getChildDevelopmentStage(1)).toBe('infant');
  });

  it('should classify toddler (1-3 years)', () => {
    expect(getChildDevelopmentStage(1.5)).toBe('toddler');
    expect(getChildDevelopmentStage(2)).toBe('toddler');
    expect(getChildDevelopmentStage(3)).toBe('toddler');
  });

  it('should classify preschool (3-5 years)', () => {
    expect(getChildDevelopmentStage(3.5)).toBe('preschool');
    expect(getChildDevelopmentStage(4)).toBe('preschool');
    expect(getChildDevelopmentStage(5)).toBe('preschool');
  });

  it('should classify school-age (5-12 years)', () => {
    expect(getChildDevelopmentStage(6)).toBe('school_age');
    expect(getChildDevelopmentStage(9)).toBe('school_age');
    expect(getChildDevelopmentStage(12)).toBe('school_age');
  });

  it('should classify teen (12+ years)', () => {
    expect(getChildDevelopmentStage(13)).toBe('teen');
    expect(getChildDevelopmentStage(16)).toBe('teen');
    expect(getChildDevelopmentStage(18)).toBe('teen');
  });
});

describe('getDevelopmentStageInfo', () => {
  it('should return complete info for infant stage', () => {
    const info = getDevelopmentStageInfo('infant');
    expect(info.stage).toBe('infant');
    expect(info.ageRange.min).toBe(0);
    expect(info.ageRange.max).toBe(1);
    expect(info.label.en).toBe('Infant');
    expect(info.label.zh).toBeDefined();
    expect(info.idealFacilities.length).toBeGreaterThan(0);
  });

  it('should return complete info for toddler stage', () => {
    const info = getDevelopmentStageInfo('toddler');
    expect(info.stage).toBe('toddler');
    expect(info.ageRange.min).toBe(1);
    expect(info.ageRange.max).toBe(3);
  });

  it('should have descriptions in both languages', () => {
    const stages: DevelopmentStage[] = [
      'infant',
      'toddler',
      'preschool',
      'school_age',
      'teen'
    ];

    stages.forEach(stage => {
      const info = getDevelopmentStageInfo(stage);
      expect(info.description.en).toBeDefined();
      expect(info.description.zh).toBeDefined();
      expect(info.description.en.length).toBeGreaterThan(0);
      expect(info.description.zh.length).toBeGreaterThan(0);
    });
  });

  it('should include safety considerations for all stages', () => {
    const stages: DevelopmentStage[] = [
      'infant',
      'toddler',
      'preschool',
      'school_age',
      'teen'
    ];

    stages.forEach(stage => {
      const info = getDevelopmentStageInfo(stage);
      expect(info.safetyConsiderations.length).toBeGreaterThan(0);
    });
  });
});

describe('getFamilyDevelopmentStages', () => {
  it('should return single stage for single age child', () => {
    const stages = getFamilyDevelopmentStages([2]);
    expect(stages).toHaveLength(1);
    expect(stages[0]).toBe('toddler');
  });

  it('should return multiple stages for multi-age family', () => {
    const stages = getFamilyDevelopmentStages([0.5, 3, 8]);
    expect(stages).toHaveLength(3);
    expect(stages).toContain('infant');
    expect(stages).toContain('preschool');
    expect(stages).toContain('school_age');
  });

  it('should handle empty array', () => {
    const stages = getFamilyDevelopmentStages([]);
    expect(stages).toHaveLength(0);
  });

  it('should not duplicate stages for same category', () => {
    const stages = getFamilyDevelopmentStages([2, 2.5, 3]); // All toddlers
    expect(stages).toHaveLength(1);
    expect(stages[0]).toBe('toddler');
  });

  it('should handle wide age ranges', () => {
    const stages = getFamilyDevelopmentStages([0.5, 6, 14]);
    expect(stages.length).toBeGreaterThanOrEqual(3);
  });
});

describe('calculateVenueSuitabilityForStage', () => {
  it('should score 50 for empty venue data', () => {
    const result = calculateVenueSuitabilityForStage('infant', {});
    expect(result.suitabilityScore).toBe(50);
    expect(result.stage).toBe('infant');
  });

  it('should boost score for matching facilities', () => {
    const result = calculateVenueSuitabilityForStage('infant', {
      facilities: ['nursing_room', 'changing_table', 'calm_environment']
    });
    expect(result.suitabilityScore).toBeGreaterThan(60);
  });

  it('should include reasoning for suitability', () => {
    const result = calculateVenueSuitabilityForStage('infant', {
      facilities: ['nursing_room', 'changing_table']
    });
    expect(result.reasoning.length).toBeGreaterThan(0);
  });

  it('should include cautions for missing facilities', () => {
    const result = calculateVenueSuitabilityForStage('infant', {});
    expect(result.cautions.length).toBeGreaterThan(0);
  });

  it('should include tips for each stage', () => {
    const result = calculateVenueSuitabilityForStage('infant', {});
    expect(result.tips.length).toBeGreaterThan(0);
  });

  it('should consider atmosphere for infants', () => {
    const quietResult = calculateVenueSuitabilityForStage('infant', {
      atmosphere: { noise: 'quiet', crowds: 'quiet' }
    });
    const loudResult = calculateVenueSuitabilityForStage('infant', {
      atmosphere: { noise: 'loud', crowds: 'busy' }
    });
    expect(quietResult.suitabilityScore).toBeGreaterThan(loudResult.suitabilityScore);
  });

  it('should score stroller accessibility for toddlers', () => {
    const withStroller = calculateVenueSuitabilityForStage('toddler', {
      accessibility: { stroller: true }
    });
    const withoutStroller = calculateVenueSuitabilityForStage('toddler', {
      accessibility: { stroller: false }
    });
    expect(withStroller.suitabilityScore).toBeGreaterThan(withoutStroller.suitabilityScore);
  });

  it('should cap score at 100', () => {
    const result = calculateVenueSuitabilityForStage('school_age', {
      facilities: Array(20).fill('safe_playground'),
      atmosphere: { noise: 'moderate', crowds: 'moderate' },
      ageRange: { minAge: 5, maxAge: 12 }
    });
    expect(result.suitabilityScore).toBeLessThanOrEqual(100);
  });

  it('should keep score above 0', () => {
    const result = calculateVenueSuitabilityForStage('infant', {
      atmosphere: { noise: 'loud', crowds: 'busy' },
      facilities: []
    });
    expect(result.suitabilityScore).toBeGreaterThanOrEqual(0);
  });
});

describe('calculateFamilySuitability', () => {
  it('should calculate overall family suitability', () => {
    const result = calculateFamilySuitability(
      [1, 5],
      {
        facilities: ['playground', 'changing_table', 'restroom'],
        atmosphere: { noise: 'moderate', crowds: 'moderate' }
      }
    );

    expect(result.overallScore).toBeGreaterThanOrEqual(0);
    expect(result.overallScore).toBeLessThanOrEqual(100);
    expect(result.byStage.length).toBe(2);
  });

  it('should identify best-fit stages', () => {
    const result = calculateFamilySuitability(
      [0.5, 4],
      {
        facilities: ['nursing_room', 'changing_table', 'playground']
      }
    );

    expect(result.bestForStages.length).toBeGreaterThan(0);
    expect(result.bestForStages[0]).toBeDefined();
  });

  it('should provide age appropriateness notes', () => {
    const result = calculateFamilySuitability([2, 7], {});
    expect(result.ageApprpriateness.length).toBeGreaterThanOrEqual(2);
  });

  it('should provide visit conditions for young children', () => {
    const result = calculateFamilySuitability([0.5], {});
    expect(result.recommendedVisitConditions.length).toBeGreaterThan(0);
  });

  it('should provide longer visit suggestions for older children', () => {
    const result = calculateFamilySuitability([10], {});
    const hasLongerVisitSuggestion = result.recommendedVisitConditions.some(
      c => c.toLowerCase().includes('hour')
    );
    expect(hasLongerVisitSuggestion).toBe(true);
  });

  it('should handle multi-age families', () => {
    const result = calculateFamilySuitability([0.5, 2, 5, 10, 14], {});
    expect(result.byStage.length).toBe(5);
  });

  it('should handle single child families', () => {
    const result = calculateFamilySuitability([5], {});
    expect(result.overallScore).toBeGreaterThanOrEqual(0);
    expect(result.byStage.length).toBe(1);
  });
});

describe('getStageTips', () => {
  it('should return English tips for infant stage', () => {
    const tips = getStageTips('infant', 'en');
    expect(tips.length).toBeGreaterThan(0);
    expect(tips[0]).toBeDefined();
  });

  it('should return Chinese tips for infant stage', () => {
    const tips = getStageTips('infant', 'zh');
    expect(tips.length).toBeGreaterThan(0);
    expect(tips[0]).toBeDefined();
  });

  it('should have different tips for each stage', () => {
    const infantTips = getStageTips('infant', 'en');
    const teenTips = getStageTips('teen', 'en');
    expect(infantTips.length).toBeGreaterThan(0);
    expect(teenTips.length).toBeGreaterThan(0);
  });

  it('should return appropriate number of tips', () => {
    const stages: DevelopmentStage[] = [
      'infant',
      'toddler',
      'preschool',
      'school_age',
      'teen'
    ];
    stages.forEach(stage => {
      const tips = getStageTips(stage, 'en');
      expect(tips.length).toBeGreaterThanOrEqual(3);
    });
  });
});

describe('formatDevelopmentStage', () => {
  it('should format stage in English', () => {
    const formatted = formatDevelopmentStage('infant', 'en');
    expect(formatted).toBe('Infant');
  });

  it('should format stage in Chinese', () => {
    const formatted = formatDevelopmentStage('infant', 'zh');
    expect(formatted).toBeDefined();
    expect(formatted.length).toBeGreaterThan(0);
  });

  it('should handle all stages', () => {
    const stages: DevelopmentStage[] = [
      'infant',
      'toddler',
      'preschool',
      'school_age',
      'teen'
    ];
    stages.forEach(stage => {
      const formatted = formatDevelopmentStage(stage, 'en');
      expect(formatted.length).toBeGreaterThan(0);
    });
  });
});

describe('getAgeRangeForStage', () => {
  it('should return age range for infant', () => {
    const range = getAgeRangeForStage('infant');
    expect(range).toContain('0');
    expect(range).toContain('1');
  });

  it('should return age range for toddler', () => {
    const range = getAgeRangeForStage('toddler');
    expect(range).toContain('1');
    expect(range).toContain('3');
  });

  it('should return formatted string for all stages', () => {
    const stages: DevelopmentStage[] = [
      'infant',
      'toddler',
      'preschool',
      'school_age',
      'teen'
    ];
    stages.forEach(stage => {
      const range = getAgeRangeForStage(stage);
      expect(range).toMatch(/\d+-\d+\s+years/);
    });
  });
});

describe('Integration tests', () => {
  it('should handle real-world family scenario', () => {
    // Family with infant and school-age child visiting a park
    const childAges = [0.5, 7];
    const venueData = {
      category: 'park',
      facilities: [
        'playground',
        'restroom',
        'changing_table',
        'nursing_room',
        'shade_areas',
        'water_access'
      ],
      atmosphere: { noise: 'moderate', crowds: 'moderate' },
      accessibility: { stroller: true }
    };

    const result = calculateFamilySuitability(childAges, venueData);

    expect(result.overallScore).toBeGreaterThan(60);
    expect(result.byStage.length).toBe(2);
    expect(result.ageApprpriateness.length).toBe(2);
  });

  it('should provide lower score for poor venue match', () => {
    // Infant trying loud venue with no nursing
    const infantScore = calculateVenueSuitabilityForStage('infant', {
      atmosphere: { noise: 'loud', crowds: 'busy' },
      facilities: []
    });

    expect(infantScore.suitabilityScore).toBeLessThan(50);
  });

  it('should provide high score for perfect venue match', () => {
    // Toddler at ideal playground
    const toddlerScore = calculateVenueSuitabilityForStage('toddler', {
      category: 'park',
      facilities: [
        'safe_playground',
        'changing_table',
        'restroom',
        'shade_areas',
        'water_access'
      ],
      accessibility: { stroller: true },
      atmosphere: { noise: 'moderate', crowds: 'quiet' }
    });

    expect(toddlerScore.suitabilityScore).toBeGreaterThan(70);
  });

  it('should handle edge case of very young family', () => {
    const result = calculateFamilySuitability([0.2], {
      facilities: ['nursing_room', 'changing_table']
    });

    expect(result.overallScore).toBeGreaterThan(0);
    expect(result.byStage[0].stage).toBe('infant');
  });
});
