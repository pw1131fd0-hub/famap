import React from 'react';
import type { Review } from '../types';
import { useTranslation } from '../i18n/LanguageContext';

interface ReviewListProps {
  reviews: Review[];
}

export const ReviewList: React.FC<ReviewListProps> = ({ reviews }) => {
  const { t } = useTranslation();

  if (reviews.length === 0) {
    return <div className="reviews-empty">{t.reviews.empty}</div>;
  }

  return (
    <div className="reviews-list">
      <h3>{t.reviews.title}</h3>
      {reviews.map((review) => (
        <div key={review.id} className="review-item">
          <div className="review-header">
            <span className="user-name">{review.userName}</span>
            <span className="review-rating">⭐ {review.rating}</span>
            <span className="review-date">{new Date(review.createdAt).toLocaleDateString()}</span>
          </div>
          <p className="review-comment">{review.comment}</p>
        </div>
      ))}
    </div>
  );
};
