import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SavedSearchesPanel } from '../components/SavedSearchesPanel';
import { saveSavedSearch, getSavedSearches, clearAllSavedSearches } from '../utils/savedSearches';

describe('SavedSearchesPanel Component', () => {
  const mockOnClose = vi.fn();
  const mockOnSelectSearch = vi.fn();

  beforeEach(() => {
    clearAllSavedSearches();
    mockOnClose.mockClear();
    mockOnSelectSearch.mockClear();
    localStorage.clear();
  });

  afterEach(() => {
    clearAllSavedSearches();
    localStorage.clear();
  });

  describe('Rendering', () => {
    it('should render saved searches panel', () => {
      render(
        <SavedSearchesPanel
          onClose={mockOnClose}
          onSelectSearch={mockOnSelectSearch}
          language="en"
        />
      );

      expect(screen.getByText('Saved Searches')).toBeInTheDocument();
    });

    it('should show no searches message when empty', () => {
      render(
        <SavedSearchesPanel
          onClose={mockOnClose}
          onSelectSearch={mockOnSelectSearch}
          language="en"
        />
      );

      expect(screen.getByText('No saved searches yet')).toBeInTheDocument();
    });

    it('should display saved searches', () => {
      saveSavedSearch({
        name: 'Park Search',
        query: 'park',
        filters: { categories: ['park'], facilities: [] },
        usageCount: 0
      });

      render(
        <SavedSearchesPanel
          onClose={mockOnClose}
          onSelectSearch={mockOnSelectSearch}
          language="en"
        />
      );

      expect(screen.getByText('Park Search')).toBeInTheDocument();
      expect(screen.getByText('park')).toBeInTheDocument();
    });

    it('should render with Chinese language', () => {
      render(
        <SavedSearchesPanel
          onClose={mockOnClose}
          onSelectSearch={mockOnSelectSearch}
          language="zh"
        />
      );

      expect(screen.getByText('保存的搜尋')).toBeInTheDocument();
    });
  });

  describe('Sorting', () => {
    beforeEach(() => {
      for (let i = 0; i < 3; i++) {
        saveSavedSearch({
          name: `Search ${i}`,
          query: `query ${i}`,
          filters: { categories: [], facilities: [] },
          usageCount: i * 2
        });
      }
    });

    it('should have sort buttons', () => {
      render(
        <SavedSearchesPanel
          onClose={mockOnClose}
          onSelectSearch={mockOnSelectSearch}
          language="en"
        />
      );

      expect(screen.getByText('Recent')).toBeInTheDocument();
      expect(screen.getByText('Frequency')).toBeInTheDocument();
      expect(screen.getByText('Created')).toBeInTheDocument();
    });

    it('should update sort order when button clicked', () => {
      render(
        <SavedSearchesPanel
          onClose={mockOnClose}
          onSelectSearch={mockOnSelectSearch}
          language="en"
        />
      );

      const frequencyBtn = screen.getByText('Frequency');
      fireEvent.click(frequencyBtn);

      expect(frequencyBtn).toHaveClass('active');
    });
  });

  describe('User Interactions', () => {
    beforeEach(() => {
      saveSavedSearch({
        name: 'Test Search',
        query: 'test query',
        filters: { categories: ['park'], facilities: ['changing_table'] },
        usageCount: 0
      });
    });

    it('should call onSelectSearch when search is clicked', () => {
      render(
        <SavedSearchesPanel
          onClose={mockOnClose}
          onSelectSearch={mockOnSelectSearch}
          language="en"
        />
      );

      const searchButton = screen.getByText('Test Search').closest('button');
      fireEvent.click(searchButton!);

      expect(mockOnSelectSearch).toHaveBeenCalled();
    });

    it('should call onClose when close button clicked', () => {
      render(
        <SavedSearchesPanel
          onClose={mockOnClose}
          onSelectSearch={mockOnSelectSearch}
          language="en"
        />
      );

      const closeButton = screen.getByLabelText('Close');
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should increment usage count when search is selected', async () => {
      render(
        <SavedSearchesPanel
          onClose={mockOnClose}
          onSelectSearch={mockOnSelectSearch}
          language="en"
        />
      );

      const searchButton = screen.getByText('Test Search').closest('button');
      fireEvent.click(searchButton!);

      // Check that the usage count was incremented
      const searches = getSavedSearches();
      expect(searches[0].usageCount).toBe(1);
    });

    it('should show usage count badge', () => {
      saveSavedSearch({
        name: 'Frequently Used',
        query: 'frequent',
        filters: { categories: [], facilities: [] },
        usageCount: 5
      });

      render(
        <SavedSearchesPanel
          onClose={mockOnClose}
          onSelectSearch={mockOnSelectSearch}
          language="en"
        />
      );

      const badge = screen.getByText('5');
      expect(badge).toBeInTheDocument();
    });
  });

  describe('Search Actions', () => {
    beforeEach(() => {
      saveSavedSearch({
        name: 'Search to Duplicate',
        query: 'duplicate me',
        filters: { categories: ['park'], facilities: [] },
        usageCount: 0
      });
    });

    it('should have duplicate and delete buttons', () => {
      render(
        <SavedSearchesPanel
          onClose={mockOnClose}
          onSelectSearch={mockOnSelectSearch}
          language="en"
        />
      );

      expect(screen.getByTitle('Duplicate')).toBeInTheDocument();
      expect(screen.getByTitle('Delete')).toBeInTheDocument();
    });

    it('should create a copy when duplicate button clicked', () => {
      render(
        <SavedSearchesPanel
          onClose={mockOnClose}
          onSelectSearch={mockOnSelectSearch}
          language="en"
        />
      );

      const duplicateButton = screen.getByTitle('Duplicate');
      fireEvent.click(duplicateButton);

      const searches = getSavedSearches();
      expect(searches).toHaveLength(2);
      expect(searches.some(s => s.name.includes('Copy'))).toBe(true);
    });

    it('should delete search when delete button clicked', () => {
      render(
        <SavedSearchesPanel
          onClose={mockOnClose}
          onSelectSearch={mockOnSelectSearch}
          language="en"
        />
      );

      // Mock window.confirm to return true
      vi.spyOn(window, 'confirm').mockReturnValue(true);

      const deleteButton = screen.getByTitle('Delete');
      fireEvent.click(deleteButton);

      expect(getSavedSearches()).toHaveLength(0);

      vi.restoreAllMocks();
    });

    it('should not delete when user cancels confirmation', () => {
      render(
        <SavedSearchesPanel
          onClose={mockOnClose}
          onSelectSearch={mockOnSelectSearch}
          language="en"
        />
      );

      vi.spyOn(window, 'confirm').mockReturnValue(false);

      const deleteButton = screen.getByTitle('Delete');
      fireEvent.click(deleteButton);

      expect(getSavedSearches()).toHaveLength(1);

      vi.restoreAllMocks();
    });
  });

  describe('Metadata Display', () => {
    it('should display creation date', () => {
      saveSavedSearch({
        name: 'Date Test',
        query: 'test',
        filters: { categories: [], facilities: [] },
        usageCount: 0
      });

      render(
        <SavedSearchesPanel
          onClose={mockOnClose}
          onSelectSearch={mockOnSelectSearch}
          language="en"
        />
      );

      expect(screen.getByText(/Created on/)).toBeInTheDocument();
    });

    it('should display usage metadata in Chinese', () => {
      saveSavedSearch({
        name: '中文搜尋',
        query: '公園',
        filters: { categories: ['park'], facilities: [] },
        usageCount: 3
      });

      render(
        <SavedSearchesPanel
          onClose={mockOnClose}
          onSelectSearch={mockOnSelectSearch}
          language="zh"
        />
      );

      expect(screen.getByText('3')).toBeInTheDocument();
    });
  });

  describe('Multiple Searches', () => {
    beforeEach(() => {
      for (let i = 0; i < 5; i++) {
        saveSavedSearch({
          name: `Search ${i}`,
          query: `query ${i}`,
          filters: { categories: [], facilities: [] },
          usageCount: i
        });
      }
    });

    it('should display all searches', () => {
      render(
        <SavedSearchesPanel
          onClose={mockOnClose}
          onSelectSearch={mockOnSelectSearch}
          language="en"
        />
      );

      for (let i = 0; i < 5; i++) {
        expect(screen.getByText(`Search ${i}`)).toBeInTheDocument();
      }
    });

    it('should handle duplicate of multiple searches', () => {
      render(
        <SavedSearchesPanel
          onClose={mockOnClose}
          onSelectSearch={mockOnSelectSearch}
          language="en"
        />
      );

      const duplicateButtons = screen.getAllByTitle('Duplicate');
      fireEvent.click(duplicateButtons[0]);

      const searches = getSavedSearches();
      expect(searches.length).toBeGreaterThan(5);
    });
  });

  describe('Accessibility', () => {
    it('should have proper aria labels', () => {
      render(
        <SavedSearchesPanel
          onClose={mockOnClose}
          onSelectSearch={mockOnSelectSearch}
          language="en"
        />
      );

      expect(screen.getByLabelText('Close')).toBeInTheDocument();
      expect(screen.getByLabelText('Duplicate')).toBeInTheDocument();
      expect(screen.getByLabelText('Delete')).toBeInTheDocument();
    });
  });
});
