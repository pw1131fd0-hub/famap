import { describe, it, expect, beforeEach } from 'vitest';
import { recordView, getRecentlyViewedIds, clearRecentlyViewed } from '../utils/recentlyViewed';

describe('recentlyViewed', () => {
  beforeEach(() => {
    clearRecentlyViewed();
  });

  it('starts empty', () => {
    expect(getRecentlyViewedIds()).toEqual([]);
  });

  it('records a single view', () => {
    recordView('loc1');
    expect(getRecentlyViewedIds()).toEqual(['loc1']);
  });

  it('most recent view is first', () => {
    recordView('loc1');
    recordView('loc2');
    expect(getRecentlyViewedIds()[0]).toBe('loc2');
  });

  it('deduplicates and moves to front', () => {
    recordView('loc1');
    recordView('loc2');
    recordView('loc1');
    const ids = getRecentlyViewedIds();
    expect(ids[0]).toBe('loc1');
    expect(ids.filter(id => id === 'loc1').length).toBe(1);
  });

  it('respects max limit in getRecentlyViewedIds', () => {
    for (let i = 0; i < 15; i++) recordView(`loc${i}`);
    expect(getRecentlyViewedIds(5).length).toBe(5);
  });

  it('caps stored entries at 10', () => {
    for (let i = 0; i < 15; i++) recordView(`loc${i}`);
    expect(getRecentlyViewedIds().length).toBe(10);
  });

  it('clearRecentlyViewed empties the list', () => {
    recordView('loc1');
    recordView('loc2');
    clearRecentlyViewed();
    expect(getRecentlyViewedIds()).toEqual([]);
  });
});
