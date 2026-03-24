import React, { useState } from 'react';
import type { ReviewCreateDTO } from '../types';
import { useTranslation } from '../i18n/useTranslation';
import { captureException } from '../utils/sentryConfig';

interface ReviewFormProps {
  onSubmit: (review: ReviewCreateDTO) => Promise<void>;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({ onSubmit }) => {
  const { t } = useTranslation();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [userName, setUserName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!comment.trim() || !userName.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({ rating, comment, userName });
      setComment('');
      setUserName('');
      setRating(5);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to submit review';
      setError(message);
      captureException(err instanceof Error ? err : new Error(String(err)), {
        context: 'ReviewForm submit',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="review-form" onSubmit={handleSubmit} role="form" aria-label="Write a review">
      <h3>{t.reviews.write}</h3>
      {error && (
        <div
          role="alert"
          style={{
            padding: '8px 12px',
            backgroundColor: '#fee',
            color: '#c00',
            borderRadius: '4px',
            marginBottom: '12px',
            fontSize: '0.9em'
          }}
        >
          {error}
        </div>
      )}
      {success && (
        <div
          role="status"
          aria-live="polite"
          style={{
            padding: '8px 12px',
            backgroundColor: '#efe',
            color: '#060',
            borderRadius: '4px',
            marginBottom: '12px',
            fontSize: '0.9em'
          }}
        >
          Review submitted successfully!
        </div>
      )}
      <div className="form-group">
        <label htmlFor="userName">
          {t.reviews.userName}
          <input
            id="userName"
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            required
            placeholder={t.reviews.userName}
            aria-required="true"
          />
        </label>
      </div>
      <div className="form-group">
        <label htmlFor="rating">
          {t.reviews.rating}
          <select
            id="rating"
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            aria-label="Rating"
          >
            {[5, 4, 3, 2, 1].map(num => (
              <option key={num} value={num}>{num} ⭐</option>
            ))}
          </select>
        </label>
      </div>
      <div className="form-group">
        <label htmlFor="comment">
          {t.reviews.comment}
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
            placeholder={t.reviews.comment}
            aria-required="true"
          />
        </label>
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="submit-button"
        aria-busy={submitting}
      >
        {submitting ? t.common.loading : t.common.submit}
      </button>
    </form>
  );
};
