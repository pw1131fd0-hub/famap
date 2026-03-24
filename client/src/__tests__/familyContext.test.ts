import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  vi,
} from 'vitest';
import {
  createFamilyProfile,
  calculateFamilySuitabilityScore,
  saveFamilyProfiles,
  loadFamilyProfiles,
  getCurrentFamilyProfile,
  setCurrentFamilyProfile,
  getFamilyTypeRecommendations,
} from '../utils/familyContext';

describe('familyContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('createFamilyProfile', () => {
    it('should create a single child family profile', () => {
      const profile = createFamilyProfile(1, [
        { age: 5, name: 'Emma' },
      ]);

      expect(profile.numberOfChildren).toBe(1);
      expect(profile.familyType).toBe('single_child');
      expect(profile.children).toHaveLength(1);
      expect(profile.children[0].age).toBe(5);
      expect(profile.id).toMatch(/^family_\d+$/);
    });

    it('should create a twins family profile', () => {
      const profile = createFamilyProfile(2, [
        { age: 3 },
        { age: 3 },
      ]);

      expect(profile.numberOfChildren).toBe(2);
      expect(profile.familyType).toBe('twins');
      expect(profile.children).toHaveLength(2);
    });

    it('should create a close age gap family profile', () => {
      const profile = createFamilyProfile(2, [
        { age: 4 },
        { age: 6 },
      ]);

      expect(profile.familyType).toBe('close_age_gap');
    });

    it('should create a mixed ages family profile', () => {
      const profile = createFamilyProfile(3, [
        { age: 2 },
        { age: 5 },
        { age: 10 },
      ]);

      expect(profile.numberOfChildren).toBe(3);
      expect(profile.familyType).toBe('mixed_ages');
    });

    it('should create a special needs family profile', () => {
      const profile = createFamilyProfile(1, [
        {
          age: 6,
          specialNeeds: ['autism', 'sensory_sensitive'],
        },
      ]);

      expect(profile.familyType).toBe('special_needs');
      expect(profile.specialNeeds).toContain('autism');
      expect(profile.specialNeeds).toContain('sensory_sensitive');
    });

    it('should extract mobility challenges from children', () => {
      const profile = createFamilyProfile(1, [
        {
          age: 4,
          mobilityChallenges: true,
        },
      ]);

      expect(profile.specialNeeds).toContain('mobility_challenges');
    });

    it('should extract allergies from children', () => {
      const profile = createFamilyProfile(1, [
        {
          age: 3,
          allergies: ['peanut', 'dairy'],
        },
      ]);

      expect(profile.children[0].allergies).toEqual(['peanut', 'dairy']);
    });

    it('should set proper timestamps', () => {
      const before = Date.now();
      const profile = createFamilyProfile(1, [{ age: 3 }]);
      const after = Date.now();

      expect(profile.createdAt).toBeGreaterThanOrEqual(before);
      expect(profile.createdAt).toBeLessThanOrEqual(after);
      expect(profile.updatedAt).toBe(profile.createdAt);
    });

    it('should assign unique IDs to children', () => {
      const profile = createFamilyProfile(3, [
        { age: 2 },
        { age: 5 },
        { age: 8 },
      ]);

      const ids = profile.children.map((c) => c.id);
      expect(new Set(ids).size).toBe(3);
    });
  });

  describe('localStorage operations', () => {
    it('should save and load family profiles', () => {
      const profile1 = createFamilyProfile(1, [{ age: 5 }]);
      const profile2 = createFamilyProfile(2, [{ age: 3 }, { age: 6 }]);

      const profiles = [profile1, profile2];
      saveFamilyProfiles(profiles);

      const loaded = loadFamilyProfiles();
      expect(loaded).toHaveLength(2);
      expect(loaded[0].id).toBe(profile1.id);
      expect(loaded[1].id).toBe(profile2.id);
    });

    it('should return empty array when no profiles exist', () => {
      const loaded = loadFamilyProfiles();
      expect(loaded).toEqual([]);
    });

    it('should set and get current family profile', () => {
      const profile = createFamilyProfile(1, [{ age: 5 }]);
      saveFamilyProfiles([profile]);

      setCurrentFamilyProfile(profile.id);
      const current = getCurrentFamilyProfile();

      expect(current).not.toBeNull();
      expect(current?.id).toBe(profile.id);
    });

    it('should return null when no current profile is set', () => {
      const current = getCurrentFamilyProfile();
      expect(current).toBeNull();
    });

    it('should not set profile if ID does not exist', () => {
      const profile = createFamilyProfile(1, [{ age: 5 }]);
      saveFamilyProfiles([profile]);

      setCurrentFamilyProfile('nonexistent_id');
      const current = getCurrentFamilyProfile();

      expect(current).toBeNull();
    });
  });

  describe('calculateFamilySuitabilityScore', () => {
    const mockLocation = {
      id: 'loc1',
      category: 'park',
      facilities: ['public_toilet', 'drinking_water', 'playground'],
      averageRating: 4.5,
      reviews: [
        { comment: 'Very safe for kids' },
        { comment: 'Great facilities' },
      ],
    };

    it('should calculate suitability score for single child family', () => {
      const family = createFamilyProfile(1, [{ age: 5 }]);
      const score = calculateFamilySuitabilityScore(mockLocation, family);

      expect(score.overall).toBeGreaterThanOrEqual(0);
      expect(score.overall).toBeLessThanOrEqual(100);
      expect(score.safety).toBeGreaterThanOrEqual(0);
      expect(score.facilities).toBeGreaterThanOrEqual(0);
      expect(score.accessibility).toBeGreaterThanOrEqual(0);
      expect(score.atmosphere).toBeGreaterThanOrEqual(0);
      expect(score.timing).toBeGreaterThanOrEqual(0);
    });

    it('should give higher safety score for toddler-friendly locations', () => {
      const family = createFamilyProfile(1, [{ age: 2 }]);
      const toddlerLocation = {
        ...mockLocation,
        category: 'nursing_room',
        facilities: [...mockLocation.facilities, 'changing_table'],
      };

      const score = calculateFamilySuitabilityScore(toddlerLocation, family);
      expect(score.safety).toBeGreaterThan(65);
    });

    it('should increase accessibility score for wheelchair requirements', () => {
      const family = createFamilyProfile(1, [
        { age: 5, mobilityChallenges: true },
      ]);
      family.preferences.wheelchairAccessRequired = true;

      const wheelchairLocation = {
        ...mockLocation,
        facilities: [...mockLocation.facilities, 'wheelchair_accessible'],
      };

      const score = calculateFamilySuitabilityScore(wheelchairLocation, family);
      expect(score.accessibility).toBeGreaterThan(85);
    });

    it('should favor quiet locations for sensory-sensitive children', () => {
      const family = createFamilyProfile(1, [
        {
          age: 5,
          sensoryPreferences: { lowNoise: true },
        },
      ]);

      const quietLocation = {
        ...mockLocation,
        category: 'nursing_room',
      };

      const score = calculateFamilySuitabilityScore(quietLocation, family);
      expect(score.atmosphere).toBeGreaterThan(70);
    });

    it('should include reasoning for recommendations', () => {
      const family = createFamilyProfile(1, [{ age: 3 }]);
      const score = calculateFamilySuitabilityScore(mockLocation, family);

      expect(score.reasoning).toBeInstanceOf(Array);
      expect(score.reasoning.length).toBeGreaterThan(0);
    });

    it('should handle location with no facilities', () => {
      const family = createFamilyProfile(1, [{ age: 5 }]);
      const emptyLocation = {
        id: 'loc2',
        category: 'attraction',
      };

      const score = calculateFamilySuitabilityScore(emptyLocation, family);
      expect(score.overall).toBeGreaterThanOrEqual(0);
      expect(score.overall).toBeLessThanOrEqual(100);
    });

    it('should handle family with multiple special needs', () => {
      const family = createFamilyProfile(2, [
        {
          age: 4,
          specialNeeds: ['autism', 'anxiety'],
          sensoryPreferences: { lowNoise: true, lowCrowds: true },
        },
        {
          age: 2,
          mobilityChallenges: true,
        },
      ]);

      family.preferences.wheelchairAccessRequired = true;

      const score = calculateFamilySuitabilityScore(mockLocation, family);
      expect(score.overall).toBeGreaterThanOrEqual(0);
      expect(score.overall).toBeLessThanOrEqual(100);
    });

    it('should detect safety mentions in reviews', () => {
      const family = createFamilyProfile(1, [{ age: 5 }]);
      const safeLocation = {
        ...mockLocation,
        reviews: [
          { comment: 'Very safe environment' },
          { comment: 'No safety issues' },
        ],
      };

      const score = calculateFamilySuitabilityScore(safeLocation, family);
      expect(score.reasoning.some((r) => r.includes('Safety'))).toBe(true);
    });
  });

  describe('getFamilyTypeRecommendations', () => {
    it('should return recommendations for single child families', () => {
      const recs = getFamilyTypeRecommendations('single_child');
      expect(recs.length).toBeGreaterThan(0);
      expect(recs[0]).toMatch(/interactive|engaging/i);
    });

    it('should return recommendations for twins', () => {
      const recs = getFamilyTypeRecommendations('twins');
      expect(recs.length).toBeGreaterThan(0);
      expect(recs.some((r) => r.includes('multiple'))).toBe(true);
    });

    it('should return recommendations for close age gap families', () => {
      const recs = getFamilyTypeRecommendations('close_age_gap');
      expect(recs.length).toBeGreaterThan(0);
      expect(recs.some((r) => r.includes('similar'))).toBe(true);
    });

    it('should return recommendations for mixed ages', () => {
      const recs = getFamilyTypeRecommendations('mixed_ages');
      expect(recs.length).toBeGreaterThan(0);
      expect(recs.some((r) => r.includes('age-diverse'))).toBe(true);
    });

    it('should return recommendations for special needs families', () => {
      const recs = getFamilyTypeRecommendations('special_needs');
      expect(recs.length).toBeGreaterThan(0);
      expect(recs.some((r) => r.includes('sensory'))).toBe(true);
    });

    it('should return recommendations for extended family', () => {
      const recs = getFamilyTypeRecommendations('extended_family');
      expect(recs.length).toBeGreaterThan(0);
      expect(recs.some((r) => r.includes('Spacious'))).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle family with no children data', () => {
      const profile = createFamilyProfile(0, []);
      expect(profile.numberOfChildren).toBe(0);
      expect(profile.children).toHaveLength(0);
    });

    it('should handle very young children (< 1 year)', () => {
      const family = createFamilyProfile(1, [{ age: 0 }]);

      const score = calculateFamilySuitabilityScore(
        {
          id: 'loc1',
          category: 'nursing_room',
          facilities: ['changing_table', 'nursing_room'],
        },
        family
      );

      expect(score.safety).toBeGreaterThan(60);
    });

    it('should handle teenagers (> 12 years)', () => {
      const profile = createFamilyProfile(1, [{ age: 15 }]);
      expect(profile.familyType).toBe('single_child');
    });

    it('should handle family with maximum children', () => {
      const children = Array.from({ length: 10 }, (_, i) => ({
        age: (i + 1) * 2,
      }));
      const familyProfile = createFamilyProfile(10, children);

      expect(familyProfile.numberOfChildren).toBe(10);
      expect(familyProfile.children).toHaveLength(10);
    });

    it('should handle location with extensive reviews', () => {
      const family = createFamilyProfile(1, [{ age: 5 }]);
      const reviews = Array.from({ length: 50 }, (_, i) => ({
        comment: `Review ${i}: safe place for kids`,
      }));

      const score = calculateFamilySuitabilityScore(
        {
          id: 'loc1',
          category: 'park',
          reviews,
        },
        family
      );

      expect(score.overall).toBeGreaterThanOrEqual(0);
    });
  });

  describe('preferences and time management', () => {
    it('should track family preferences correctly', () => {
      const profile = createFamilyProfile(1, [{ age: 5 }]);

      expect(profile.preferences.budgetLevel).toBe('moderate');
      expect(profile.preferences.languagePreferences).toContain('zh');
      expect(profile.preferences.languagePreferences).toContain('en');
    });

    it('should have default time preferences', () => {
      const profile = createFamilyProfile(1, [{ age: 5 }]);

      expect(profile.preferences.timePreferences.preferredDays).toHaveLength(7);
      expect(profile.preferences.timePreferences.preferredTimes).toHaveLength(1);
    });

    it('should reflect timing preferences in suitability score', () => {
      const family = createFamilyProfile(1, [{ age: 5 }]);
      family.preferences.timePreferences.avoidPeakHours = true;

      const score = calculateFamilySuitabilityScore(
        { id: 'loc1', category: 'park' },
        family
      );

      expect(
        score.reasoning.some((r) => r.includes('peak hour'))
      ).toBe(true);
    });
  });
});
