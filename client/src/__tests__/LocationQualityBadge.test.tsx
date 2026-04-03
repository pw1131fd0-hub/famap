// @vitest-environment happy-dom
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LocationQualityBadge } from '../components/LocationQualityBadge';

describe('LocationQualityBadge', () => {
  it('should render high trust badge correctly', () => {
    render(
      <LocationQualityBadge score={85} trustLevel="high" reviewCount={50} />
    );

    expect(screen.getByText(/85/)).toBeInTheDocument();
    expect(screen.getByText(/Highly Trusted/)).toBeInTheDocument();
    expect(screen.getByText(/50 reviews/)).toBeInTheDocument();
  });

  it('should render medium trust badge correctly', () => {
    render(
      <LocationQualityBadge score={70} trustLevel="medium" reviewCount={20} />
    );

    expect(screen.getByText(/70/)).toBeInTheDocument();
    expect(screen.getByText(/Verified/)).toBeInTheDocument();
    expect(screen.getByText(/20 reviews/)).toBeInTheDocument();
  });

  it('should render low trust badge correctly', () => {
    render(
      <LocationQualityBadge score={45} trustLevel="low" reviewCount={3} />
    );

    expect(screen.getByText(/45/)).toBeInTheDocument();
    expect(screen.getByText(/New/)).toBeInTheDocument();
    expect(screen.getByText(/3 reviews/)).toBeInTheDocument();
  });

  it('should format score to one decimal place', () => {
    render(
      <LocationQualityBadge score={87.456} trustLevel="high" reviewCount={40} />
    );

    expect(screen.getByText(/87.5/)).toBeInTheDocument();
  });
});
