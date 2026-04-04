// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FamilyExplorationPassport } from '../components/FamilyExplorationPassport';
import { LanguageProvider } from '../i18n/LanguageContext';
import type { Location } from '../types';
import { clearAllCheckIns, addCheckIn, saveCheckIns } from '../utils/checkInSystem';
import type { CheckIn } from '../utils/checkInSystem';

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock, writable: true });

function renderWithLanguage(ui: React.ReactElement) {
  return render(<LanguageProvider>{ui}</LanguageProvider>);
}

const mockLocation: Location = {
  id: 'loc1',
  name: { zh: '大安森林公園', en: 'Daan Forest Park' },
  address: { zh: '台北市大安區', en: 'Daan District, Taipei' },
  coordinates: { lat: 25.0330, lng: 121.5654 },
  category: 'park',
  facilities: ['changing_table'],
  averageRating: 4.8,
  description: { zh: '台北著名公園', en: 'Famous park in Taipei' },
};

describe('FamilyExplorationPassport', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  describe('rendering without location', () => {
    it('renders passport title in Chinese', () => {
      renderWithLanguage(<FamilyExplorationPassport />);
      expect(screen.getByText('家庭探索護照')).toBeInTheDocument();
    });

    it('renders stats row with zero counts', () => {
      renderWithLanguage(<FamilyExplorationPassport />);
      const statValues = screen.getAllByText('0');
      expect(statValues.length).toBeGreaterThanOrEqual(3);
    });

    it('shows no check-ins message', () => {
      renderWithLanguage(<FamilyExplorationPassport />);
      expect(screen.getByText(/還沒有打卡記錄/)).toBeInTheDocument();
    });

    it('renders badges section', () => {
      renderWithLanguage(<FamilyExplorationPassport />);
      expect(screen.getByText(/成就徽章/)).toBeInTheDocument();
    });

    it('shows all badges as locked initially', () => {
      renderWithLanguage(<FamilyExplorationPassport />);
      const lockedBadges = document.querySelectorAll('.badge-item.locked');
      expect(lockedBadges.length).toBeGreaterThan(0);
    });
  });

  describe('rendering with location prop', () => {
    it('shows check-in button when location provided', () => {
      renderWithLanguage(<FamilyExplorationPassport location={mockLocation} />);
      const btn = screen.getByRole('button');
      expect(btn).toBeInTheDocument();
      expect(btn.textContent).toContain('打卡');
    });

    it('check-in button shows "已打卡" after clicking', () => {
      renderWithLanguage(<FamilyExplorationPassport location={mockLocation} />);
      const btn = screen.getByRole('button');
      fireEvent.click(btn);
      expect(btn.textContent).toContain('已打卡');
    });

    it('check-in button is disabled after checking in', () => {
      renderWithLanguage(<FamilyExplorationPassport location={mockLocation} />);
      const btn = screen.getByRole('button');
      fireEvent.click(btn);
      expect(btn).toBeDisabled();
    });

    it('shows "today checked in" if already checked in today', () => {
      const today = new Date().toISOString();
      const existing: CheckIn[] = [{
        id: 'ci_today',
        locationId: 'loc1',
        locationName: '大安森林公園',
        locationCategory: 'park',
        timestamp: today,
      }];
      saveCheckIns(existing);

      renderWithLanguage(<FamilyExplorationPassport location={mockLocation} />);
      const btn = screen.getByRole('button');
      expect(btn).toBeDisabled();
      expect(btn.textContent).toContain('已打卡');
    });
  });

  describe('check-in flow updates stats', () => {
    it('increments check-in count after check-in', () => {
      renderWithLanguage(<FamilyExplorationPassport location={mockLocation} />);
      // Initially 0 total check-ins
      expect(screen.getAllByText('0').length).toBeGreaterThanOrEqual(1);
      const btn = screen.getByRole('button');
      fireEvent.click(btn);
      // After check-in, count should be 1 (may appear in multiple stat cards)
      expect(screen.getAllByText('1').length).toBeGreaterThanOrEqual(1);
    });

    it('shows badge after earning first_step', () => {
      renderWithLanguage(<FamilyExplorationPassport location={mockLocation} />);
      const btn = screen.getByRole('button');
      fireEvent.click(btn);
      // first_step badge should now be earned (not locked)
      const earnedBadges = document.querySelectorAll('.badge-item.earned');
      expect(earnedBadges.length).toBeGreaterThan(0);
    });
  });

  describe('with existing check-ins', () => {
    beforeEach(() => {
      const checkIns: CheckIn[] = [
        { id: 'ci1', locationId: 'l1', locationName: '公園A', locationCategory: 'park', timestamp: '2024-01-01T10:00:00Z' },
        { id: 'ci2', locationId: 'l2', locationName: '哺乳室B', locationCategory: 'nursing_room', timestamp: '2024-01-02T10:00:00Z' },
        { id: 'ci3', locationId: 'l3', locationName: '餐廳C', locationCategory: 'restaurant', timestamp: '2024-01-03T10:00:00Z' },
      ];
      saveCheckIns(checkIns);
    });

    it('shows correct total check-in count', () => {
      renderWithLanguage(<FamilyExplorationPassport />);
      // '3' may appear in multiple stat cards (total, unique, etc.)
      expect(screen.getAllByText('3').length).toBeGreaterThanOrEqual(1);
    });

    it('shows unique locations count', () => {
      renderWithLanguage(<FamilyExplorationPassport />);
      // 3 unique locations
      const threeElements = screen.getAllByText('3');
      expect(threeElements.length).toBeGreaterThanOrEqual(1);
    });

    it('shows recent check-ins in history', () => {
      renderWithLanguage(<FamilyExplorationPassport showHistory />);
      expect(screen.getByText('餐廳C')).toBeInTheDocument();
      expect(screen.getByText('哺乳室B')).toBeInTheDocument();
      expect(screen.getByText('公園A')).toBeInTheDocument();
    });

    it('earns expected badges', () => {
      renderWithLanguage(<FamilyExplorationPassport />);
      const earnedBadges = document.querySelectorAll('.badge-item.earned');
      expect(earnedBadges.length).toBeGreaterThan(0);
    });
  });

  describe('compact mode', () => {
    it('renders compact version with location', () => {
      renderWithLanguage(<FamilyExplorationPassport location={mockLocation} compact />);
      expect(screen.getByText('探索護照')).toBeInTheDocument();
    });

    it('shows check-in button in compact mode', () => {
      renderWithLanguage(<FamilyExplorationPassport location={mockLocation} compact />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('does not show full badges grid in compact mode', () => {
      renderWithLanguage(<FamilyExplorationPassport location={mockLocation} compact />);
      expect(screen.queryByText(/成就徽章/)).not.toBeInTheDocument();
    });
  });

  describe('showHistory prop', () => {
    beforeEach(() => {
      const checkIns: CheckIn[] = [{
        id: 'ci1',
        locationId: 'l1',
        locationName: 'Test Park',
        locationCategory: 'park',
        timestamp: new Date().toISOString(),
      }];
      saveCheckIns(checkIns);
    });

    it('shows history section when showHistory is true', () => {
      renderWithLanguage(<FamilyExplorationPassport showHistory />);
      expect(screen.getByText(/最近打卡記錄/)).toBeInTheDocument();
    });

    it('hides history when showHistory is false', () => {
      renderWithLanguage(<FamilyExplorationPassport showHistory={false} />);
      expect(screen.queryByText(/最近打卡記錄/)).not.toBeInTheDocument();
    });
  });

  describe('weekly streak', () => {
    it('shows streak banner when streak > 0', () => {
      // Add check-in for this week
      const checkIns: CheckIn[] = [{
        id: 'ci1',
        locationId: 'l1',
        locationName: 'Park',
        locationCategory: 'park',
        timestamp: new Date().toISOString(),
      }];
      saveCheckIns(checkIns);
      renderWithLanguage(<FamilyExplorationPassport />);
      // streak banner should appear (streak >= 1 since we checked in this week)
      expect(screen.getByText(/連續.*週打卡/)).toBeInTheDocument();
    });
  });

  describe('badge statistics', () => {
    it('shows badge count fraction', () => {
      renderWithLanguage(<FamilyExplorationPassport />);
      // Should show "0/12" style badge count
      expect(screen.getByText(/徽章.*0\/12/)).toBeInTheDocument();
    });

    it('increments badge count after earning', () => {
      renderWithLanguage(<FamilyExplorationPassport location={mockLocation} />);
      const btn = screen.getByRole('button');
      fireEvent.click(btn);
      // Badge count should have increased
      expect(screen.queryByText(/徽章.*0\/12/)).not.toBeInTheDocument();
    });
  });
});
