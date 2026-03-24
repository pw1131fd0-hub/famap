import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  getSavedSearches,
  saveSavedSearch,
  updateSavedSearch,
  deleteSavedSearch,
  recordSearchUsage,
  getSortedSearches,
  duplicateSavedSearch,
  clearAllSavedSearches,
  exportSearches,
  importSearches
} from '../utils/savedSearches';

describe('Saved Searches Utility', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('getSavedSearches', () => {
    it('should return empty array when no searches saved', () => {
      const searches = getSavedSearches();
      expect(searches).toEqual([]);
    });

    it('should return saved searches from localStorage', () => {
      saveSavedSearch({
        name: 'Test Search',
        query: 'park',
        filters: { categories: ['park'], facilities: [] },
        usageCount: 0
      });

      const searches = getSavedSearches();
      expect(searches).toHaveLength(1);
      expect(searches[0].name).toBe('Test Search');
    });
  });

  describe('saveSavedSearch', () => {
    it('should save a new search with generated id and timestamp', () => {
      const search = saveSavedSearch({
        name: 'Park Search',
        query: 'park near me',
        filters: { categories: ['park'], facilities: [] },
        usageCount: 0
      });

      expect(search.id).toBeDefined();
      expect(search.id).toMatch(/^search_/);
      expect(search.createdAt).toBeDefined();
      expect(search.name).toBe('Park Search');
    });

    it('should throw error when exceeding max saves', () => {
      for (let i = 0; i < 20; i++) {
        saveSavedSearch({
          name: `Search ${i}`,
          query: `query ${i}`,
          filters: { categories: [], facilities: [] },
          usageCount: 0
        });
      }

      expect(() => {
        saveSavedSearch({
          name: 'Extra Search',
          query: 'query',
          filters: { categories: [], facilities: [] },
          usageCount: 0
        });
      }).toThrow();
    });

    it('should support optional category field', () => {
      const search = saveSavedSearch({
        name: 'Restaurant Search',
        query: 'restaurant',
        category: 'restaurant',
        filters: { categories: ['restaurant'], facilities: [] },
        usageCount: 0
      });

      expect(search.category).toBe('restaurant');
    });
  });

  describe('updateSavedSearch', () => {
    it('should update an existing search', () => {
      const search = saveSavedSearch({
        name: 'Original',
        query: 'query',
        filters: { categories: [], facilities: [] },
        usageCount: 0
      });

      const updated = updateSavedSearch(search.id, { name: 'Updated' });
      expect(updated?.name).toBe('Updated');

      const retrieved = getSavedSearches().find(s => s.id === search.id);
      expect(retrieved?.name).toBe('Updated');
    });

    it('should return null for non-existent search', () => {
      const result = updateSavedSearch('nonexistent', { name: 'New Name' });
      expect(result).toBeNull();
    });
  });

  describe('deleteSavedSearch', () => {
    it('should delete a saved search', () => {
      const search = saveSavedSearch({
        name: 'To Delete',
        query: 'query',
        filters: { categories: [], facilities: [] },
        usageCount: 0
      });

      expect(getSavedSearches()).toHaveLength(1);
      const deleted = deleteSavedSearch(search.id);
      expect(deleted).toBe(true);
      expect(getSavedSearches()).toHaveLength(0);
    });

    it('should return false for non-existent search', () => {
      const deleted = deleteSavedSearch('nonexistent');
      expect(deleted).toBe(false);
    });
  });

  describe('recordSearchUsage', () => {
    it('should increment usage count and update lastUsed', () => {
      const search = saveSavedSearch({
        name: 'Track Usage',
        query: 'query',
        filters: { categories: [], facilities: [] },
        usageCount: 0
      });

      const before = search.createdAt;
      const updated = recordSearchUsage(search.id);

      expect(updated?.usageCount).toBe(1);
      expect(updated?.lastUsed).toBeGreaterThanOrEqual(before);
    });

    it('should increment usage count on multiple calls', () => {
      const search = saveSavedSearch({
        name: 'Multi Track',
        query: 'query',
        filters: { categories: [], facilities: [] },
        usageCount: 0
      });

      recordSearchUsage(search.id);
      recordSearchUsage(search.id);
      recordSearchUsage(search.id);

      const updated = getSavedSearches()[0];
      expect(updated.usageCount).toBe(3);
    });

    it('should return null for non-existent search', () => {
      const result = recordSearchUsage('nonexistent');
      expect(result).toBeNull();
    });
  });

  describe('getSortedSearches', () => {
    beforeEach(() => {
      saveSavedSearch({
        name: 'First',
        query: 'first',
        filters: { categories: [], facilities: [] },
        usageCount: 5
      });

      setTimeout(() => {
        saveSavedSearch({
          name: 'Second',
          query: 'second',
          filters: { categories: [], facilities: [] },
          usageCount: 10
        });
      }, 10);
    });

    it('should sort by recent lastUsed', () => {
      const searches = getSortedSearches('recent');
      // Most recently used should be first
      expect(searches.length).toBeGreaterThan(0);
    });

    it('should sort by frequency (usageCount)', () => {
      recordSearchUsage(getSavedSearches()[0].id);
      recordSearchUsage(getSavedSearches()[0].id);

      const searches = getSortedSearches('frequency');
      expect(searches[0].usageCount).toBeGreaterThanOrEqual(searches[1]?.usageCount || 0);
    });

    it('should sort by creation date', () => {
      const searches = getSortedSearches('created');
      expect(searches.length).toBeGreaterThan(0);
    });
  });

  describe('duplicateSavedSearch', () => {
    it('should create a copy of an existing search', () => {
      const original = saveSavedSearch({
        name: 'Original',
        query: 'original query',
        filters: { categories: ['park'], facilities: ['changing_table'] },
        usageCount: 5
      });

      const duplicate = duplicateSavedSearch(original.id, 'Duplicate');
      expect(duplicate).not.toBeNull();
      expect(duplicate?.name).toBe('Duplicate');
      expect(duplicate?.query).toBe('original query');
      expect(duplicate?.filters).toEqual(original.filters);
      expect(duplicate?.usageCount).toBe(0);
      expect(duplicate?.id).not.toBe(original.id);
    });

    it('should return null for non-existent search', () => {
      const duplicate = duplicateSavedSearch('nonexistent', 'Copy');
      expect(duplicate).toBeNull();
    });
  });

  describe('clearAllSavedSearches', () => {
    it('should clear all saved searches', () => {
      saveSavedSearch({
        name: 'First',
        query: 'first',
        filters: { categories: [], facilities: [] },
        usageCount: 0
      });
      saveSavedSearch({
        name: 'Second',
        query: 'second',
        filters: { categories: [], facilities: [] },
        usageCount: 0
      });

      expect(getSavedSearches()).toHaveLength(2);
      const cleared = clearAllSavedSearches();
      expect(cleared).toBe(true);
      expect(getSavedSearches()).toHaveLength(0);
    });
  });

  describe('exportSearches', () => {
    it('should export searches as JSON string', () => {
      saveSavedSearch({
        name: 'Export Test',
        query: 'test',
        filters: { categories: ['park'], facilities: [] },
        usageCount: 0
      });

      const exported = exportSearches();
      const parsed = JSON.parse(exported);
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed[0].name).toBe('Export Test');
    });

    it('should export empty array when no searches', () => {
      const exported = exportSearches();
      expect(JSON.parse(exported)).toEqual([]);
    });
  });

  describe('importSearches', () => {
    it('should import searches from JSON string', () => {
      const searchData = [
        {
          name: 'Imported 1',
          query: 'import1',
          filters: { categories: ['park'], facilities: [] },
          usageCount: 0
        },
        {
          name: 'Imported 2',
          query: 'import2',
          filters: { categories: ['restaurant'], facilities: [] },
          usageCount: 0
        }
      ];

      const result = importSearches(JSON.stringify(searchData));
      expect(result.success).toBe(true);
      expect(result.count).toBe(2);
      expect(getSavedSearches()).toHaveLength(2);
    });

    it('should skip duplicate searches', () => {
      saveSavedSearch({
        name: 'Existing',
        query: 'existing',
        filters: { categories: [], facilities: [] },
        usageCount: 0
      });

      const importData = [
        {
          name: 'Existing',
          query: 'existing',
          filters: { categories: [], facilities: [] },
          usageCount: 0
        },
        {
          name: 'New',
          query: 'new',
          filters: { categories: [], facilities: [] },
          usageCount: 0
        }
      ];

      const result = importSearches(JSON.stringify(importData));
      expect(result.count).toBe(1); // Only new one imported
      expect(getSavedSearches()).toHaveLength(2);
    });

    it('should handle invalid JSON', () => {
      const result = importSearches('invalid json');
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle invalid format', () => {
      const result = importSearches(JSON.stringify({ not: 'array' }));
      expect(result.success).toBe(false);
      expect(result.error).toContain('expected array');
    });

    it('should respect max saved searches limit', () => {
      // Save 15 searches
      for (let i = 0; i < 15; i++) {
        saveSavedSearch({
          name: `Search ${i}`,
          query: `query ${i}`,
          filters: { categories: [], facilities: [] },
          usageCount: 0
        });
      }

      // Try to import 10 more (should only succeed for 5)
      const importData = Array.from({ length: 10 }, (_, i) => ({
        name: `Import ${i}`,
        query: `import_query_${i}`,
        filters: { categories: [], facilities: [] },
        usageCount: 0
      }));

      importSearches(JSON.stringify(importData));
      expect(getSavedSearches().length).toBeLessThanOrEqual(20);
    });
  });

  describe('Integration tests', () => {
    it('should handle complete workflow', () => {
      // Create search
      const search = saveSavedSearch({
        name: 'My Park Search',
        query: 'playground near me',
        category: 'park',
        filters: { categories: ['park'], facilities: ['changing_table'] },
        usageCount: 0
      });

      expect(getSavedSearches()).toHaveLength(1);

      // Use the search
      recordSearchUsage(search.id);
      recordSearchUsage(search.id);

      // Check usage
      const updated = getSavedSearches()[0];
      expect(updated.usageCount).toBe(2);

      // Duplicate it
      const dup = duplicateSavedSearch(search.id, 'My Park Search Copy');
      expect(getSavedSearches()).toHaveLength(2);

      // Sort by frequency
      const sorted = getSortedSearches('frequency');
      expect(sorted[0].usageCount).toBeGreaterThanOrEqual(sorted[1]?.usageCount || 0);

      // Delete one
      deleteSavedSearch(dup!.id);
      expect(getSavedSearches()).toHaveLength(1);
    });
  });
});
