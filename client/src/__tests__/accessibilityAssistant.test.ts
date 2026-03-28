import { describe, it, expect } from 'vitest';
import {
  createSpecialNeedsProfile,
  assessVenueAccessibility,
  findBestAccessibleVenues,
  createAccessibilityOutingPlan,
  compareAccessibleVenues,
  recordVisitOutcome,
  type SpecialNeedsProfile,
  type VenueAccessibilityAssessment,
} from '../utils/accessibilityAssistant';

describe('accessibilityAssistant', () => {
  // Profile Creation Tests
  describe('createSpecialNeedsProfile', () => {
    it('should create a profile with basic information', () => {
      const profile = createSpecialNeedsProfile('Alex', 6, [
        { type: 'autism', severity: 'moderate', notes: 'Some sensory issues' },
      ]);

      expect(profile.childName).toBe('Alex');
      expect(profile.age).toBe(6);
      expect(profile.conditions).toHaveLength(1);
      expect(profile.conditions[0].type).toBe('autism');
    });

    it('should create a profile with unique ID', () => {
      const profile1 = createSpecialNeedsProfile('Alex', 6, []);
      const profile2 = createSpecialNeedsProfile('Jordan', 5, []);

      expect(profile1.id).toBeDefined();
      expect(profile2.id).toBeDefined();
      expect(profile1.id).not.toBe(profile2.id);
    });

    it('should initialize with default sensory preferences', () => {
      const profile = createSpecialNeedsProfile('Alex', 6, []);

      expect(profile.sensoryPreferences.soundSensitivity).toBe('normal');
      expect(profile.sensoryPreferences.lightSensitivity).toBe('normal');
      expect(profile.sensoryPreferences.crowdTolerance).toBe('normal');
    });

    it('should support multiple conditions', () => {
      const profile = createSpecialNeedsProfile('Alex', 6, [
        { type: 'autism', severity: 'moderate', notes: '' },
        { type: 'adhd', severity: 'mild', notes: '' },
        { type: 'anxiety', severity: 'moderate', notes: '' },
      ]);

      expect(profile.conditions).toHaveLength(3);
      expect(profile.conditions.map((c) => c.type)).toEqual([
        'autism',
        'adhd',
        'anxiety',
      ]);
    });

    it('should initialize with default mobility settings', () => {
      const profile = createSpecialNeedsProfile('Alex', 6, []);

      expect(profile.mobilityNeeds.useWheelchair).toBe(false);
      expect(profile.mobilityNeeds.maxWalkingDistance).toBe(1000);
    });

    it('should initialize with empty medical needs', () => {
      const profile = createSpecialNeedsProfile('Alex', 6, []);

      expect(profile.medicalNeeds.allergies).toHaveLength(0);
      expect(profile.medicalNeeds.dietaryRestrictions).toHaveLength(0);
    });
  });

  // Venue Assessment Tests
  describe('assessVenueAccessibility', () => {
    let profile: SpecialNeedsProfile;

    beforeEach(() => {
      profile = createSpecialNeedsProfile('Alex', 6, [
        { type: 'autism', severity: 'moderate', notes: '' },
      ]);
      profile.sensoryPreferences.soundSensitivity = 'high';
    });

    it('should assess venue with perfect accessibility', () => {
      const assessment = assessVenueAccessibility(
        'v1',
        'Accessible Park',
        profile,
        {
          accessibilityFeatures: [
            { type: 'wheelchair_accessible', available: true, quality: 'excellent', details: 'Full access' },
            { type: 'quiet_space', available: true, quality: 'excellent', details: 'Quiet zones' },
          ],
          noiseLevel: 'quiet',
          crowdExpectation: 'light',
          hasQuietZone: true,
          hasBreakRoom: true,
        }
      );

      expect(assessment.venueId).toBe('v1');
      expect(assessment.venueName).toBe('Accessible Park');
      expect(assessment.accessibilityScore).toBeGreaterThan(50);
      expect(assessment.matchScore).toBeGreaterThan(60);
    });

    it('should penalize for missing critical features', () => {
      profile.accessibilityRequirements = [
        { type: 'wheelchair_accessible', priority: 'critical' },
        { type: 'quiet_space', priority: 'critical' },
      ];

      const assessment = assessVenueAccessibility(
        'v2',
        'Inaccessible Venue',
        profile,
        {
          accessibilityFeatures: [
            { type: 'elevator', available: true, quality: 'good', details: 'One elevator' },
          ],
          noiseLevel: 'very_loud',
          crowdExpectation: 'very_busy',
          hasQuietZone: false,
          hasBreakRoom: false,
        }
      );

      expect(assessment.accessibilityScore).toBeLessThan(50);
      expect(assessment.warnings.length).toBeGreaterThan(0);
    });

    it('should include warnings for high noise with sound sensitivity', () => {
      const assessment = assessVenueAccessibility(
        'v3',
        'Loud Venue',
        profile,
        {
          accessibilityFeatures: [],
          noiseLevel: 'very_loud',
          crowdExpectation: 'very_busy',
          hasQuietZone: false,
          hasBreakRoom: false,
        }
      );

      const warnings = assessment.warnings.filter((w) =>
        w.affectingConditions.includes('autism')
      );
      expect(warnings.length).toBeGreaterThan(0);
    });

    it('should reward venues with quiet zones', () => {
      const assessmentWithQuietZone = assessVenueAccessibility(
        'v4',
        'Venue with Quiet Zone',
        profile,
        {
          accessibilityFeatures: [],
          noiseLevel: 'loud',
          crowdExpectation: 'busy',
          hasQuietZone: true,
          hasBreakRoom: true,
        }
      );

      const assessmentWithout = assessVenueAccessibility(
        'v5',
        'Venue without Quiet Zone',
        profile,
        {
          accessibilityFeatures: [],
          noiseLevel: 'loud',
          crowdExpectation: 'busy',
          hasQuietZone: false,
          hasBreakRoom: false,
        }
      );

      expect(assessmentWithQuietZone.suitabilityScore).toBeGreaterThan(
        assessmentWithout.suitabilityScore
      );
    });

    it('should assess medical facilities', () => {
      profile.medicalNeeds.firstAidRequired = true;
      profile.medicalNeeds.nearbyHospitalRequired = true;

      const assessment = assessVenueAccessibility(
        'v6',
        'Medical Center',
        profile,
        {
          accessibilityFeatures: [],
          medicalFacilities: [
            { type: 'first_aid', distance: 100, availability: 'always' },
            { type: 'hospital', distance: 1500, availability: 'always' },
          ],
        }
      );

      expect(assessment.medicalFacilities).toHaveLength(2);
    });

    it('should generate recommendations', () => {
      const assessment = assessVenueAccessibility(
        'v7',
        'Test Venue',
        profile,
        {
          accessibilityFeatures: [
            { type: 'quiet_space', available: true, quality: 'good', details: 'Quiet zone' },
          ],
          noiseLevel: 'loud',
          crowdExpectation: 'busy',
          hasQuietZone: true,
        }
      );

      expect(assessment.recommendations.length).toBeGreaterThan(0);
      expect(assessment.recommendations[0].title).toBeDefined();
      expect(assessment.recommendations[0].description).toBeDefined();
      expect(assessment.recommendations[0].actionItems.length).toBeGreaterThan(0);
    });

    it('should calculate confidence score', () => {
      const assessment = assessVenueAccessibility(
        'v8',
        'Test Venue',
        profile,
        {}
      );

      expect(assessment.confidence).toBeGreaterThanOrEqual(0);
      expect(assessment.confidence).toBeLessThanOrEqual(100);
    });
  });

  // Venue Finding Tests
  describe('findBestAccessibleVenues', () => {
    it('should return venues sorted by match score', () => {
      const profile = createSpecialNeedsProfile('Alex', 6, [
        { type: 'autism', severity: 'moderate', notes: '' },
      ]);

      const venues: VenueAccessibilityAssessment[] = [
        {
          venueId: 'v1',
          venueName: 'Venue 1',
          accessibilityScore: 70,
          suitabilityScore: 75,
          matchScore: 80,
          accessibilityFeatures: [],
          sensoryEnvironment: {
            noiseLevel: 'quiet',
            lightingType: 'natural',
            crowdExpectation: 'light',
            hasQuietZone: true,
            hasBreakRoom: true,
            suitableForAutism: 85,
            suitableForAdhd: 80,
            suitableForAnxiety: 90,
          },
          medicalFacilities: [],
          bestVisitTimes: [],
          warnings: [],
          recommendations: [],
          confidence: 85,
        },
        {
          venueId: 'v2',
          venueName: 'Venue 2',
          accessibilityScore: 60,
          suitabilityScore: 65,
          matchScore: 70,
          accessibilityFeatures: [],
          sensoryEnvironment: {
            noiseLevel: 'moderate',
            lightingType: 'artificial',
            crowdExpectation: 'moderate',
            hasQuietZone: false,
            hasBreakRoom: false,
            suitableForAutism: 65,
            suitableForAdhd: 70,
            suitableForAnxiety: 60,
          },
          medicalFacilities: [],
          bestVisitTimes: [],
          warnings: [],
          recommendations: [],
          confidence: 85,
        },
      ];

      const best = findBestAccessibleVenues(profile, venues, 65);

      expect(best.length).toBe(2);
      expect(best[0].matchScore).toBeGreaterThanOrEqual(best[1].matchScore);
    });

    it('should filter venues by minimum match score', () => {
      const profile = createSpecialNeedsProfile('Alex', 6, []);

      const venues: VenueAccessibilityAssessment[] = [
        {
          venueId: 'v1',
          venueName: 'Good Venue',
          accessibilityScore: 75,
          suitabilityScore: 80,
          matchScore: 85,
          accessibilityFeatures: [],
          sensoryEnvironment: {
            noiseLevel: 'quiet',
            lightingType: 'natural',
            crowdExpectation: 'light',
            hasQuietZone: true,
            hasBreakRoom: true,
            suitableForAutism: 85,
            suitableForAdhd: 85,
            suitableForAnxiety: 85,
          },
          medicalFacilities: [],
          bestVisitTimes: [],
          warnings: [],
          recommendations: [],
          confidence: 85,
        },
        {
          venueId: 'v2',
          venueName: 'Poor Venue',
          accessibilityScore: 30,
          suitabilityScore: 35,
          matchScore: 40,
          accessibilityFeatures: [],
          sensoryEnvironment: {
            noiseLevel: 'very_loud',
            lightingType: 'artificial',
            crowdExpectation: 'very_busy',
            hasQuietZone: false,
            hasBreakRoom: false,
            suitableForAutism: 30,
            suitableForAdhd: 40,
            suitableForAnxiety: 25,
          },
          medicalFacilities: [],
          bestVisitTimes: [],
          warnings: [],
          recommendations: [],
          confidence: 85,
        },
      ];

      const best = findBestAccessibleVenues(profile, venues, 75);

      expect(best).toHaveLength(1);
      expect(best[0].venueName).toBe('Good Venue');
    });

    it('should limit results to top 10', () => {
      const profile = createSpecialNeedsProfile('Alex', 6, []);

      const venues: VenueAccessibilityAssessment[] = Array.from({
        length: 20,
      }).map((_, i) => ({
        venueId: `v${i}`,
        venueName: `Venue ${i}`,
        accessibilityScore: 80,
        suitabilityScore: 80,
        matchScore: 85 - i,
        accessibilityFeatures: [],
        sensoryEnvironment: {
          noiseLevel: 'quiet',
          lightingType: 'natural',
          crowdExpectation: 'light',
          hasQuietZone: true,
          hasBreakRoom: true,
          suitableForAutism: 85,
          suitableForAdhd: 85,
          suitableForAnxiety: 85,
        },
        medicalFacilities: [],
        bestVisitTimes: [],
        warnings: [],
        recommendations: [],
        confidence: 85,
      }));

      const best = findBestAccessibleVenues(profile, venues, 50);

      expect(best.length).toBeLessThanOrEqual(10);
    });
  });

  // Outing Plan Tests
  describe('createAccessibilityOutingPlan', () => {
    it('should create a structured outing plan', () => {
      const profile = createSpecialNeedsProfile('Alex', 6, [
        { type: 'autism', severity: 'moderate', notes: '' },
      ]);

      const assessment: VenueAccessibilityAssessment = {
        venueId: 'v1',
        venueName: 'Test Park',
        accessibilityScore: 85,
        suitabilityScore: 80,
        matchScore: 85,
        accessibilityFeatures: [
          { type: 'quiet_space', available: true, quality: 'good', details: 'Quiet zone' },
        ],
        sensoryEnvironment: {
          noiseLevel: 'quiet',
          lightingType: 'natural',
          crowdExpectation: 'light',
          hasQuietZone: true,
          hasBreakRoom: true,
          suitableForAutism: 85,
          suitableForAdhd: 85,
          suitableForAnxiety: 85,
        },
        medicalFacilities: [],
        bestVisitTimes: [],
        warnings: [],
        recommendations: [],
        confidence: 85,
      };

      const plan = createAccessibilityOutingPlan(profile, assessment);

      expect(plan.planId).toBeDefined();
      expect(plan.profile).toBe(profile);
      expect(plan.venue).toBe(assessment);
      expect(plan.schedule).toBeDefined();
      expect(plan.schedule.length).toBeGreaterThan(0);
    });

    it('should include necessary preparation items', () => {
      const profile = createSpecialNeedsProfile('Alex', 6, [
        { type: 'autism', severity: 'moderate', notes: '' },
      ]);

      const assessment: VenueAccessibilityAssessment = {
        venueId: 'v1',
        venueName: 'Test Venue',
        accessibilityScore: 85,
        suitabilityScore: 80,
        matchScore: 85,
        accessibilityFeatures: [],
        sensoryEnvironment: {
          noiseLevel: 'quiet',
          lightingType: 'natural',
          crowdExpectation: 'light',
          hasQuietZone: true,
          hasBreakRoom: true,
          suitableForAutism: 85,
          suitableForAdhd: 85,
          suitableForAnxiety: 85,
        },
        medicalFacilities: [],
        bestVisitTimes: [],
        warnings: [],
        recommendations: [],
        confidence: 85,
      };

      const plan = createAccessibilityOutingPlan(profile, assessment);

      expect(plan.necessaryPreperation.length).toBeGreaterThan(0);
      expect(plan.necessaryPreperation[0]).toContain('sensory');
    });

    it('should include emergency plan', () => {
      const profile = createSpecialNeedsProfile('Alex', 6, []);

      const assessment: VenueAccessibilityAssessment = {
        venueId: 'v1',
        venueName: 'Test Venue',
        accessibilityScore: 85,
        suitabilityScore: 80,
        matchScore: 85,
        accessibilityFeatures: [],
        sensoryEnvironment: {
          noiseLevel: 'quiet',
          lightingType: 'natural',
          crowdExpectation: 'light',
          hasQuietZone: true,
          hasBreakRoom: true,
          suitableForAutism: 85,
          suitableForAdhd: 85,
          suitableForAnxiety: 85,
        },
        medicalFacilities: [],
        bestVisitTimes: [],
        warnings: [],
        recommendations: [],
        confidence: 85,
      };

      const plan = createAccessibilityOutingPlan(profile, assessment);

      expect(plan.emergencyPlan.length).toBeGreaterThan(0);
    });

    it('should structure visit schedule with breaks', () => {
      const profile = createSpecialNeedsProfile('Alex', 6, [
        { type: 'autism', severity: 'moderate', notes: '' },
      ]);

      const assessment: VenueAccessibilityAssessment = {
        venueId: 'v1',
        venueName: 'Test Venue',
        accessibilityScore: 85,
        suitabilityScore: 80,
        matchScore: 85,
        accessibilityFeatures: [],
        sensoryEnvironment: {
          noiseLevel: 'quiet',
          lightingType: 'natural',
          crowdExpectation: 'light',
          hasQuietZone: true,
          hasBreakRoom: true,
          suitableForAutism: 85,
          suitableForAdhd: 85,
          suitableForAnxiety: 85,
        },
        medicalFacilities: [],
        bestVisitTimes: [],
        warnings: [],
        recommendations: [],
        confidence: 85,
      };

      const plan = createAccessibilityOutingPlan(profile, assessment);

      const breakActivities = plan.schedule.filter(
        (s) => s.activity.toLowerCase().includes('break')
      );
      expect(breakActivities.length).toBeGreaterThan(0);
    });
  });

  // Venue Comparison Tests
  describe('compareAccessibleVenues', () => {
    it('should compare multiple venues', () => {
      const profile = createSpecialNeedsProfile('Alex', 6, [
        { type: 'autism', severity: 'moderate', notes: '' },
      ]);

      const venues: VenueAccessibilityAssessment[] = [
        {
          venueId: 'v1',
          venueName: 'Venue 1',
          accessibilityScore: 85,
          suitabilityScore: 80,
          matchScore: 85,
          accessibilityFeatures: [
            { type: 'quiet_space', available: true, quality: 'excellent', details: 'Quiet' },
          ],
          sensoryEnvironment: {
            noiseLevel: 'quiet',
            lightingType: 'natural',
            crowdExpectation: 'light',
            hasQuietZone: true,
            hasBreakRoom: true,
            suitableForAutism: 85,
            suitableForAdhd: 85,
            suitableForAnxiety: 85,
          },
          medicalFacilities: [],
          bestVisitTimes: [],
          warnings: [],
          recommendations: [],
          confidence: 85,
        },
        {
          venueId: 'v2',
          venueName: 'Venue 2',
          accessibilityScore: 60,
          suitabilityScore: 65,
          matchScore: 65,
          accessibilityFeatures: [],
          sensoryEnvironment: {
            noiseLevel: 'moderate',
            lightingType: 'artificial',
            crowdExpectation: 'moderate',
            hasQuietZone: false,
            hasBreakRoom: false,
            suitableForAutism: 65,
            suitableForAdhd: 65,
            suitableForAnxiety: 65,
          },
          medicalFacilities: [],
          bestVisitTimes: [],
          warnings: [],
          recommendations: [],
          confidence: 85,
        },
      ];

      const comparison = compareAccessibleVenues(venues, profile);

      expect(comparison).toHaveLength(2);
      expect(comparison[0].strengths).toBeDefined();
      expect(comparison[0].concerns).toBeDefined();
      expect(comparison[0].recommendation).toBeDefined();
    });

    it('should identify venue strengths', () => {
      const profile = createSpecialNeedsProfile('Alex', 6, []);

      const venues: VenueAccessibilityAssessment[] = [
        {
          venueId: 'v1',
          venueName: 'Excellent Venue',
          accessibilityScore: 90,
          suitabilityScore: 90,
          matchScore: 90,
          accessibilityFeatures: [
            { type: 'wheelchair_accessible', available: true, quality: 'excellent', details: 'Full access' },
            { type: 'quiet_space', available: true, quality: 'excellent', details: 'Quiet' },
          ],
          sensoryEnvironment: {
            noiseLevel: 'quiet',
            lightingType: 'natural',
            crowdExpectation: 'light',
            hasQuietZone: true,
            hasBreakRoom: true,
            suitableForAutism: 90,
            suitableForAdhd: 90,
            suitableForAnxiety: 90,
          },
          medicalFacilities: [
            { type: 'first_aid', distance: 100, availability: 'always' },
          ],
          bestVisitTimes: [],
          warnings: [],
          recommendations: [],
          confidence: 90,
        },
      ];

      const comparison = compareAccessibleVenues(venues, profile);

      expect(comparison[0].strengths.length).toBeGreaterThan(0);
    });
  });

  // Visit Outcome Tests
  describe('recordVisitOutcome', () => {
    it('should record a visit outcome', () => {
      const outcome = recordVisitOutcome(
        'v1',
        'profile1',
        5,
        'Great experience!'
      );

      expect(outcome.venueId).toBe('v1');
      expect(outcome.profileId).toBe('profile1');
      expect(outcome.successRating).toBe(5);
      expect(outcome.notes).toBe('Great experience!');
      expect(outcome.visitDate).toBeDefined();
    });

    it('should set wouldReturnSoon based on rating', () => {
      const goodOutcome = recordVisitOutcome('v1', 'p1', 5, 'Great');
      const poorOutcome = recordVisitOutcome('v2', 'p1', 2, 'Not good');

      expect(goodOutcome.wouldReturnSoon).toBe(true);
      expect(poorOutcome.wouldReturnSoon).toBe(false);
    });

    it('should track challenges and highlights', () => {
      const outcome = recordVisitOutcome(
        'v1',
        'profile1',
        4,
        'Good experience',
        ['Parking difficult', 'Long queue'],
        ['Great quiet zone', 'Helpful staff']
      );

      expect(outcome.challenges).toHaveLength(2);
      expect(outcome.highlights).toHaveLength(2);
    });

    it('should record ISO timestamp', () => {
      const outcome = recordVisitOutcome('v1', 'p1', 5, 'Great');
      const date = new Date(outcome.visitDate);

      expect(date instanceof Date).toBe(true);
      expect(date.getTime()).toBeGreaterThan(0);
    });
  });

  // Edge Cases and Integration Tests
  describe('Edge cases and integration', () => {
    it('should handle child with multiple conditions', () => {
      const profile = createSpecialNeedsProfile('Alex', 6, [
        { type: 'autism', severity: 'moderate', notes: '' },
        { type: 'adhd', severity: 'mild', notes: '' },
        { type: 'anxiety', severity: 'moderate', notes: '' },
      ]);

      const assessment = assessVenueAccessibility(
        'v1',
        'Test Venue',
        profile,
        {
          accessibilityFeatures: [
            { type: 'quiet_space', available: true, quality: 'good', details: 'Quiet' },
          ],
          noiseLevel: 'moderate',
          crowdExpectation: 'moderate',
          hasQuietZone: true,
          hasBreakRoom: true,
        }
      );

      expect(assessment.warnings.length).toBeGreaterThanOrEqual(0);
      expect(assessment.suitabilityScore).toBeGreaterThanOrEqual(0);
    });

    it('should handle child with medical needs', () => {
      const profile = createSpecialNeedsProfile('Alex', 6, []);
      profile.medicalNeeds.allergies = ['peanuts', 'shellfish'];
      profile.medicalNeeds.dietaryRestrictions = ['gluten-free'];
      profile.medicalNeeds.hasAEpinePen = true;

      const assessment = assessVenueAccessibility('v1', 'Test Venue', profile, {});

      expect(assessment.recommendations.length).toBeGreaterThan(0);
    });

    it('should handle child with mobility needs', () => {
      const profile = createSpecialNeedsProfile('Alex', 6, []);
      profile.mobilityNeeds.useWheelchair = true;
      profile.mobilityNeeds.maxWalkingDistance = 500;
      profile.accessibilityRequirements = [
        { type: 'wheelchair_accessible', priority: 'critical' },
        { type: 'elevator', priority: 'critical' },
      ];

      const assessment = assessVenueAccessibility(
        'v1',
        'Test Venue',
        profile,
        {
          accessibilityFeatures: [
            { type: 'wheelchair_accessible', available: true, quality: 'good', details: 'Accessible' },
            { type: 'elevator', available: true, quality: 'good', details: 'Available' },
          ],
        }
      );

      expect(assessment.accessibilityScore).toBeGreaterThan(50);
    });

    it('should handle venue without sensory information', () => {
      const profile = createSpecialNeedsProfile('Alex', 6, [
        { type: 'autism', severity: 'moderate', notes: '' },
      ]);

      const assessment = assessVenueAccessibility('v1', 'Unknown Venue', profile, {});

      expect(assessment.sensoryEnvironment).toBeDefined();
      expect(assessment.confidence).toBeLessThanOrEqual(100);
    });

    it('should integrate profile, assessment, and planning', () => {
      // Create profile
      const profile = createSpecialNeedsProfile('Alex', 6, [
        { type: 'autism', severity: 'moderate', notes: '' },
      ]);

      // Assess venue
      const assessment = assessVenueAccessibility(
        'v1',
        'Test Venue',
        profile,
        {
          accessibilityFeatures: [
            { type: 'quiet_space', available: true, quality: 'good', details: 'Quiet' },
          ],
          noiseLevel: 'quiet',
          crowdExpectation: 'light',
          hasQuietZone: true,
          hasBreakRoom: true,
        }
      );

      // Create outing plan
      const plan = createAccessibilityOutingPlan(profile, assessment);

      // Record outcome
      const outcome = recordVisitOutcome('v1', profile.id, 5, 'Great visit');

      expect(plan.profile.childName).toBe('Alex');
      expect(outcome.profileId).toBe(profile.id);
    });
  });

  // Performance Tests
  describe('Performance', () => {
    it('should assess venue quickly', () => {
      const profile = createSpecialNeedsProfile('Alex', 6, [
        { type: 'autism', severity: 'moderate', notes: '' },
      ]);

      const start = performance.now();
      assessVenueAccessibility('v1', 'Test Venue', profile, {});
      const end = performance.now();

      expect(end - start).toBeLessThan(100); // Should complete in under 100ms
    });

    it('should find best venues quickly from large list', () => {
      const profile = createSpecialNeedsProfile('Alex', 6, []);

      const venues: VenueAccessibilityAssessment[] = Array.from({
        length: 100,
      }).map((_, i) => ({
        venueId: `v${i}`,
        venueName: `Venue ${i}`,
        accessibilityScore: Math.random() * 100,
        suitabilityScore: Math.random() * 100,
        matchScore: Math.random() * 100,
        accessibilityFeatures: [],
        sensoryEnvironment: {
          noiseLevel: 'moderate',
          lightingType: 'mixed',
          crowdExpectation: 'moderate',
          hasQuietZone: false,
          hasBreakRoom: false,
          suitableForAutism: 50,
          suitableForAdhd: 50,
          suitableForAnxiety: 50,
        },
        medicalFacilities: [],
        bestVisitTimes: [],
        warnings: [],
        recommendations: [],
        confidence: 85,
      }));

      const start = performance.now();
      findBestAccessibleVenues(profile, venues, 50);
      const end = performance.now();

      expect(end - start).toBeLessThan(500); // Should complete in under 500ms
    });
  });
});
