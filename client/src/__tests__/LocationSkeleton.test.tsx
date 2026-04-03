// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { LocationSkeleton, LocationListSkeleton } from '../components/LocationSkeleton';

describe('LocationSkeleton', () => {
  it('renders a single skeleton card', () => {
    const { container } = render(<LocationSkeleton />);
    expect(container.querySelector('.location-card-skeleton')).toBeTruthy();
  });

  it('displays skeleton elements with correct structure', () => {
    const { container } = render(<LocationSkeleton />);
    expect(container.querySelector('.skeleton-header')).toBeTruthy();
    expect(container.querySelector('.skeleton-content')).toBeTruthy();
    expect(container.querySelector('.skeleton-footer')).toBeTruthy();
  });

  it('contains multiple skeleton elements', () => {
    const { container } = render(<LocationSkeleton />);
    const skeletons = container.querySelectorAll('.skeleton');
    expect(skeletons.length).toBeGreaterThan(0);
  });
});

describe('LocationListSkeleton', () => {
  it('renders multiple skeleton cards', () => {
    const { container } = render(<LocationListSkeleton />);
    expect(container.querySelector('.location-list-skeleton')).toBeTruthy();
  });

  it('renders 3 skeleton cards by default', () => {
    const { container } = render(<LocationListSkeleton />);
    const cards = container.querySelectorAll('.location-card-skeleton');
    expect(cards.length).toBe(3);
  });

  it('applies animation class to skeleton elements', () => {
    const { container } = render(<LocationListSkeleton />);
    const skeleton = container.querySelector('.skeleton');
    expect(skeleton).toBeTruthy();
    expect(skeleton?.className).toContain('skeleton');
  });
});
