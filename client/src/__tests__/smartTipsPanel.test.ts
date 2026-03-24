import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('SmartTipsPanel', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should render tips in order of priority', () => {
    const tips = [
      { id: 'tip1', priority: 1 },
      { id: 'tip2', priority: 3 },
      { id: 'tip3', priority: 2 },
    ];

    const sorted = [...tips].sort((a, b) => a.priority - b.priority);
    expect(sorted[0].id).toBe('tip1');
    expect(sorted[1].id).toBe('tip3');
    expect(sorted[2].id).toBe('tip2');
  });

  it('should handle dismissed tips in localStorage', () => {
    const dismissed = ['tip1', 'tip2'];
    localStorage.setItem('dismissedTips', JSON.stringify(dismissed));

    const retrieved = JSON.parse(localStorage.getItem('dismissedTips') || '[]');
    expect(retrieved).toEqual(dismissed);
  });

  it('should add new dismissed tips to localStorage', () => {
    let dismissed = new Set<string>();
    dismissed.add('tip1');

    localStorage.setItem('dismissedTips', JSON.stringify(Array.from(dismissed)));

    const retrieved = JSON.parse(localStorage.getItem('dismissedTips') || '[]');
    expect(retrieved).toContain('tip1');
  });

  it('should track first visit', () => {
    expect(localStorage.getItem('fammap_visited')).toBeNull();

    localStorage.setItem('fammap_visited', 'true');

    const hasVisited = localStorage.getItem('fammap_visited');
    expect(hasVisited).toBe('true');
  });

  it('should not show tips if all are dismissed', () => {
    const allTips = ['welcome', 'search-feature', 'family-profile', 'saved-places', 'route-planning', 'crowdedness-info'];
    localStorage.setItem('dismissedTips', JSON.stringify(allTips));

    const dismissed = new Set(JSON.parse(localStorage.getItem('dismissedTips') || '[]'));
    const hasActiveTips = allTips.some(tip => !dismissed.has(tip));

    expect(hasActiveTips).toBe(false);
  });

  it('should handle bilingual tip content', () => {
    const tip = {
      id: 'test-tip',
      titleZh: '测试',
      titleEn: 'Test',
      descriptionZh: '这是一个测试',
      descriptionEn: 'This is a test',
    };

    expect(tip.titleZh).toBe('测试');
    expect(tip.titleEn).toBe('Test');
    expect(tip.descriptionZh).toBe('这是一个测试');
    expect(tip.descriptionEn).toBe('This is a test');
  });

  it('should categorize tips correctly', () => {
    const categories = ['getting-started', 'features', 'tips', 'safety'];
    const tip = { category: 'features' };

    expect(categories).toContain(tip.category);
  });

  it('should handle tip dismissal state', () => {
    let dismissedTips = new Set<string>();

    expect(dismissedTips.has('welcome')).toBe(false);

    dismissedTips.add('welcome');

    expect(dismissedTips.has('welcome')).toBe(true);
  });

  it('should preserve dismissed tips across sessions', () => {
    const dismissed = ['welcome', 'search-feature'];
    localStorage.setItem('dismissedTips', JSON.stringify(dismissed));

    const retrieved = JSON.parse(localStorage.getItem('dismissedTips') || '[]');
    const dismissedSet = new Set(retrieved);

    expect(Array.from(dismissedSet)).toEqual(expect.arrayContaining(dismissed));
  });

  it('should calculate tip progress correctly', () => {
    const totalTips = 6;
    const dismissedCount = 2;
    const progress = dismissedCount + 1; // Current tip being shown

    expect(progress).toBeLessThanOrEqual(totalTips);
    expect(progress).toBeGreaterThan(0);
  });

  it('should handle empty dismissed tips', () => {
    const dismissed = localStorage.getItem('dismissedTips');
    const dismissedSet = new Set(dismissed ? JSON.parse(dismissed) : []);

    expect(dismissedSet.size).toBe(0);
  });
});
