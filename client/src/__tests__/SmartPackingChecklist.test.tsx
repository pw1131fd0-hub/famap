// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SmartPackingChecklist } from '../components/SmartPackingChecklist';
import {
  generatePackingList,
  saveChecklistState,
  loadChecklistState,
  clearChecklistState,
} from '../utils/packingChecklist';

// Mock localStorage per test
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

describe('generatePackingList', () => {
  it('returns essential, recommended, and optional arrays', () => {
    const list = generatePackingList('park');
    expect(list).toHaveProperty('essential');
    expect(list).toHaveProperty('recommended');
    expect(list).toHaveProperty('optional');
    expect(Array.isArray(list.essential)).toBe(true);
    expect(Array.isArray(list.recommended)).toBe(true);
    expect(Array.isArray(list.optional)).toBe(true);
  });

  it('includes essential items for park', () => {
    const list = generatePackingList('park');
    const allIds = list.essential.map(i => i.id);
    expect(allIds).toContain('water');
    expect(allIds).toContain('wet_wipes');
    expect(allIds).toContain('sunscreen');
  });

  it('includes baby items when child age is 3 months', () => {
    const list = generatePackingList('park', 3);
    const allIds = [...list.essential, ...list.recommended, ...list.optional].map(i => i.id);
    expect(allIds).toContain('diapers');
    expect(allIds).toContain('bottle');
  });

  it('does not include baby diapers for child age 48+ months', () => {
    const list = generatePackingList('park', 48);
    const allIds = [...list.essential, ...list.recommended, ...list.optional].map(i => i.id);
    expect(allIds).not.toContain('diapers');
  });

  it('includes restaurant items for restaurant category', () => {
    const list = generatePackingList('restaurant', 24);
    const allIds = [...list.essential, ...list.recommended, ...list.optional].map(i => i.id);
    expect(allIds).toContain('bib');
  });

  it('includes health card for medical category', () => {
    const list = generatePackingList('medical');
    const allIds = list.essential.map(i => i.id);
    expect(allIds).toContain('health_card');
  });

  it('includes nursing room items for nursing_room category', () => {
    const list = generatePackingList('nursing_room', 6);
    const allIds = [...list.essential, ...list.recommended, ...list.optional].map(i => i.id);
    expect(allIds).toContain('nursing_cover');
  });

  it('deduplicates items', () => {
    const list = generatePackingList('park', 12);
    const allIds = [...list.essential, ...list.recommended, ...list.optional].map(i => i.id);
    const uniqueIds = new Set(allIds);
    expect(uniqueIds.size).toBe(allIds.length);
  });

  it('includes summer items when season is summer', () => {
    const list = generatePackingList('park', undefined, 'summer');
    const allIds = [...list.essential, ...list.recommended, ...list.optional].map(i => i.id);
    expect(allIds).toContain('cooling_towel');
    expect(allIds).toContain('fan');
  });

  it('includes winter items when season is winter', () => {
    const list = generatePackingList('park', undefined, 'winter');
    const allIds = [...list.essential, ...list.recommended, ...list.optional].map(i => i.id);
    expect(allIds).toContain('warm_jacket');
  });

  it('includes rainy/spring items when season is spring', () => {
    const list = generatePackingList('park', undefined, 'spring');
    const allIds = [...list.essential, ...list.recommended, ...list.optional].map(i => i.id);
    expect(allIds).toContain('rain_jacket');
  });

  it('all items have required fields', () => {
    const list = generatePackingList('park', 12, 'summer');
    const all = [...list.essential, ...list.recommended, ...list.optional];
    all.forEach(item => {
      expect(item.id).toBeTruthy();
      expect(item.nameZh).toBeTruthy();
      expect(item.nameEn).toBeTruthy();
      expect(item.emoji).toBeTruthy();
      expect(['essential', 'recommended', 'optional']).toContain(item.category);
    });
  });

  it('handles attraction category without errors', () => {
    expect(() => generatePackingList('attraction')).not.toThrow();
    const list = generatePackingList('attraction');
    expect(list.essential.length).toBeGreaterThan(0);
  });

  it('handles other category without errors', () => {
    expect(() => generatePackingList('other')).not.toThrow();
  });
});

describe('checklist localStorage helpers', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it('saves and loads checked ids', () => {
    const checked = new Set(['water', 'diapers', 'snacks']);
    saveChecklistState('loc1', checked);
    const loaded = loadChecklistState('loc1');
    expect(loaded).toEqual(checked);
  });

  it('returns empty set for unknown location', () => {
    const loaded = loadChecklistState('nonexistent');
    expect(loaded.size).toBe(0);
  });

  it('clears a specific location checklist', () => {
    const checked = new Set(['water']);
    saveChecklistState('loc1', checked);
    saveChecklistState('loc2', checked);
    clearChecklistState('loc1');
    expect(loadChecklistState('loc1').size).toBe(0);
    expect(loadChecklistState('loc2').size).toBe(1);
  });

  it('handles malformed localStorage data gracefully', () => {
    localStorageMock.getItem.mockReturnValueOnce('not-valid-json');
    expect(() => loadChecklistState('loc1')).not.toThrow();
    const result = loadChecklistState('loc1');
    expect(result instanceof Set).toBe(true);
  });
});

describe('SmartPackingChecklist component', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it('renders without crashing for park', () => {
    render(
      <SmartPackingChecklist
        locationId="test-park"
        venueCategory="park"
        language="zh"
      />
    );
    expect(screen.getByTestId('smart-packing-checklist')).toBeInTheDocument();
  });

  it('shows title in Chinese', () => {
    render(
      <SmartPackingChecklist
        locationId="test-1"
        venueCategory="park"
        language="zh"
      />
    );
    expect(screen.getByText('出發前準備清單')).toBeInTheDocument();
  });

  it('shows title in English', () => {
    render(
      <SmartPackingChecklist
        locationId="test-2"
        venueCategory="park"
        language="en"
      />
    );
    expect(screen.getByText('Packing Checklist')).toBeInTheDocument();
  });

  it('expands when clicking the toggle', () => {
    render(
      <SmartPackingChecklist
        locationId="test-3"
        venueCategory="park"
        language="en"
      />
    );
    const toggle = screen.getByRole('button', { name: /Packing Checklist/i });
    fireEvent.click(toggle);
    // After expanding, we should see checklist items
    expect(screen.getByText('Essential')).toBeInTheDocument();
  });

  it('collapses when toggle clicked twice', () => {
    render(
      <SmartPackingChecklist
        locationId="test-4"
        venueCategory="park"
        language="en"
      />
    );
    const toggle = screen.getByRole('button', { name: /Packing Checklist/i });
    fireEvent.click(toggle); // expand
    fireEvent.click(toggle); // collapse
    expect(screen.queryByText('Essential')).not.toBeInTheDocument();
  });

  it('shows items when expanded for park in Chinese', () => {
    render(
      <SmartPackingChecklist
        locationId="test-5"
        venueCategory="park"
        language="zh"
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /出發前準備清單/i }));
    expect(screen.getByText('必備物品')).toBeInTheDocument();
    expect(screen.getByText('飲用水')).toBeInTheDocument();
  });

  it('allows checking an item and shows progress', () => {
    render(
      <SmartPackingChecklist
        locationId="test-6"
        venueCategory="park"
        language="en"
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /Packing Checklist/i }));
    const waterItem = screen.getByRole('checkbox', { name: 'Drinking Water' });
    fireEvent.click(waterItem);
    expect(waterItem).toHaveAttribute('aria-checked', 'true');
  });

  it('shows reset button after checking an item', () => {
    render(
      <SmartPackingChecklist
        locationId="test-7"
        venueCategory="park"
        language="en"
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /Packing Checklist/i }));
    const waterItem = screen.getByRole('checkbox', { name: 'Drinking Water' });
    fireEvent.click(waterItem);
    expect(screen.getByRole('button', { name: 'Reset' })).toBeInTheDocument();
  });

  it('resets checklist when reset button clicked', () => {
    render(
      <SmartPackingChecklist
        locationId="test-8"
        venueCategory="park"
        language="en"
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /Packing Checklist/i }));
    const waterItem = screen.getByRole('checkbox', { name: 'Drinking Water' });
    fireEvent.click(waterItem);
    expect(waterItem).toHaveAttribute('aria-checked', 'true');

    const resetBtn = screen.getByRole('button', { name: 'Reset' });
    fireEvent.click(resetBtn);
    expect(waterItem).toHaveAttribute('aria-checked', 'false');
  });

  it('works for restaurant category', () => {
    render(
      <SmartPackingChecklist
        locationId="test-restaurant"
        venueCategory="restaurant"
        childAgeMonths={18}
        language="en"
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /Packing Checklist/i }));
    expect(screen.getByText('Essential')).toBeInTheDocument();
  });

  it('works for medical category', () => {
    render(
      <SmartPackingChecklist
        locationId="test-medical"
        venueCategory="medical"
        language="zh"
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /出發前準備清單/i }));
    expect(screen.getByText('健保卡')).toBeInTheDocument();
  });

  it('shows badge with item count', () => {
    render(
      <SmartPackingChecklist
        locationId="test-badge"
        venueCategory="park"
        language="en"
      />
    );
    // Badge should show something like "0/N" before any checks
    const badge = document.querySelector('.packing-progress-badge');
    expect(badge).not.toBeNull();
  });

  it('persists checked state across re-renders', () => {
    const { unmount } = render(
      <SmartPackingChecklist
        locationId="test-persist"
        venueCategory="park"
        language="en"
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /Packing Checklist/i }));
    const waterItem = screen.getByRole('checkbox', { name: 'Drinking Water' });
    fireEvent.click(waterItem);
    unmount();

    render(
      <SmartPackingChecklist
        locationId="test-persist"
        venueCategory="park"
        language="en"
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /Packing Checklist/i }));
    const waterItem2 = screen.getByRole('checkbox', { name: 'Drinking Water' });
    expect(waterItem2).toHaveAttribute('aria-checked', 'true');
  });
});
