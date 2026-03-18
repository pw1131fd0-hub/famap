import React, { useState } from 'react';
import type { ReviewCreateDTO } from '../types';
import { useTranslation } from '../i18n/LanguageContext';

interface ReviewFormProps {
  onSubmit: (review: ReviewCreateDTO) => Promise<void>;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({ onSubmit }) => {
  const { t } = useTranslation();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [userName, setUserName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment || !userName) return;

    setSubmitting(true);
    try {
      await onSubmit({ rating, comment, userName });
      setComment('');
      setUserName('');
      setRating(5);
    } catch (error) {
      console.error('Failed to submit review:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="review-form" onSubmit={handleSubmit}>
      <h3>{t.reviews.write}</h3>
      <div className="form-group">
        <label>
          {t.reviews.userName}
          <input 
            type="text" 
            value={userName} 
            onChange={(e) => setUserName(e.target.value)} 
            required 
            placeholder={t.reviews.userName}
          />
        </label>
      </div>
      <div className="form-group">
        <label>
          {t.reviews.rating}
          <select value={rating} onChange={(e) => setRating(Number(e.target.value))}>
            {[5, 4, 3, 2, 1].map(num => (
              <option key={num} value={num}>{num} ⭐</option>
            ))}
          </select>
        </label>
      </div>
      <div className="form-group">
        <label>
          {t.reviews.comment}
          <textarea 
            value={comment} 
            onChange={(e) => setComment(e.target.value)} 
            required 
            placeholder={t.reviews.comment}
          />
        </label>
      </div>
      <button type="submit" disabled={submitting} className="submit-button">
        {submitting ? t.common.loading : t.common.submit}
      </button>
    </form>
  );
};
