// @vitest-environment happy-dom
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ReviewList } from '../components/ReviewList';
import { LanguageProvider } from '../i18n/LanguageContext';

describe('ReviewList', () => {
  it('renders reviews', () => {
    const mockReviews = [
      { id: '1', locationId: '1', userId: 'u1', userName: 'User 1', rating: 5, comment: 'Great!', createdAt: new Date().toISOString() },
      { id: '2', locationId: '1', userId: 'u2', userName: 'User 2', rating: 4, comment: 'Good.', createdAt: new Date().toISOString() },
    ];
    render(
      <LanguageProvider>
        <ReviewList reviews={mockReviews} />
      </LanguageProvider>
    );
    expect(screen.getByText(/User 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Great!/i)).toBeInTheDocument();
    expect(screen.getByText(/User 2/i)).toBeInTheDocument();
    expect(screen.getByText(/Good./i)).toBeInTheDocument();
  });

  it('renders empty message when no reviews', () => {
    render(
      <LanguageProvider>
        <ReviewList reviews={[]} />
      </LanguageProvider>
    );
    expect(screen.getByText(/暫無評論/i)).toBeInTheDocument();
  });
});
