import { useState } from 'react';
import { Zap, AlertCircle } from 'lucide-react';
import type { CrowdednessReportCreateDTO } from '../types';

interface CrowdednessReportFormProps {
  onSubmit: (report: CrowdednessReportCreateDTO) => Promise<void>;
  onCancel?: () => void;
  language: 'zh' | 'en';
}

export function CrowdednessReportForm({ onSubmit, onCancel, language }: CrowdednessReportFormProps) {
  const [crowdingLevel, setCrowdingLevel] = useState<'light' | 'moderate' | 'heavy' | ''>('');
  const [comment, setComment] = useState('');
  const [userName, setUserName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!crowdingLevel) {
      setError(language === 'zh' ? '請選擇人潮等級' : 'Please select a crowding level');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit({
        crowdingLevel: crowdingLevel as 'light' | 'moderate' | 'heavy',
        comment: comment || undefined,
        userName: userName || undefined,
      });
      setCrowdingLevel('');
      setComment('');
      setUserName('');
    } catch (err) {
      setError(err instanceof Error ? err.message : (language === 'zh' ? '提交失敗' : 'Submission failed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCrowdingEmoji = (level: string) => {
    switch (level) {
      case 'light':
        return '🟢';
      case 'moderate':
        return '🟡';
      case 'heavy':
        return '🔴';
      default:
        return '🤔';
    }
  };

  const getCrowdingLabel = (level: string) => {
    if (language === 'zh') {
      switch (level) {
        case 'light':
          return '人少 (Light)';
        case 'moderate':
          return '中等 (Moderate)';
        case 'heavy':
          return '人多 (Heavy)';
        default:
          return '';
      }
    } else {
      switch (level) {
        case 'light':
          return 'Light';
        case 'moderate':
          return 'Moderate';
        case 'heavy':
          return 'Heavy';
        default:
          return '';
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="crowdedness-report-form">
      <div className="form-group">
        <label htmlFor="crowding-level" className="form-label">
          {language === 'zh' ? '🎯 現在的人潮等級' : '🎯 Current Crowding Level'}
        </label>
        <div className="crowding-level-buttons">
          {(['light', 'moderate', 'heavy'] as const).map((level) => (
            <button
              key={level}
              type="button"
              className={`crowding-button ${crowdingLevel === level ? 'selected' : ''}`}
              onClick={() => setCrowdingLevel(level)}
              aria-pressed={crowdingLevel === level}
            >
              <span className="crowding-emoji">{getCrowdingEmoji(level)}</span>
              <span className="crowding-label">{getCrowdingLabel(level)}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="user-name" className="form-label">
          {language === 'zh' ? '👤 您的名字（選填）' : '👤 Your Name (Optional)'}
        </label>
        <input
          id="user-name"
          type="text"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          placeholder={language === 'zh' ? '匿名' : 'Anonymous'}
          className="form-input"
          maxLength={50}
          disabled={isSubmitting}
        />
      </div>

      <div className="form-group">
        <label htmlFor="comment" className="form-label">
          {language === 'zh' ? '💬 評論（選填）' : '💬 Comment (Optional)'}
        </label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={language === 'zh' ? '分享您的體驗...' : 'Share your experience...'}
          className="form-textarea"
          rows={3}
          maxLength={200}
          disabled={isSubmitting}
        />
        <div className="char-count">
          {comment.length}/200
        </div>
      </div>

      {error && (
        <div className="error-message" role="alert">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <div className="form-actions">
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting}
          aria-label={language === 'zh' ? '提交人潮報告' : 'Submit crowding report'}
        >
          <Zap size={16} />
          {isSubmitting ? (language === 'zh' ? '提交中...' : 'Submitting...') : (language === 'zh' ? '提交' : 'Submit')}
        </button>
        {onCancel && (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            {language === 'zh' ? '取消' : 'Cancel'}
          </button>
        )}
      </div>
    </form>
  );
}
