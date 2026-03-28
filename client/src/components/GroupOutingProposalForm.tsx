import { useState } from 'react';
import type { GroupOutingProposal, AgeRange } from '../types';
import '../styles/components/GroupOutingProposalForm.css';

interface GroupOutingProposalFormProps {
  onSubmit: (proposal: Omit<GroupOutingProposal, 'id' | 'currentMembers' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  isDarkMode?: boolean;
  defaultLocationId?: string;
}

export function GroupOutingProposalForm({
  onSubmit,
  onCancel,
  isDarkMode = false,
  defaultLocationId,
}: GroupOutingProposalFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [proposedDate, setProposedDate] = useState('');
  const [proposedTime, setProposedTime] = useState('10:00');
  const [maxFamilies, setMaxFamilies] = useState(5);
  const [minAge, setMinAge] = useState(0);
  const [maxAge, setMaxAge] = useState(18);
  const [interests, setInterests] = useState<string[]>([]);
  const [interestInput, setInterestInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) newErrors.title = 'Title is required';
    if (!description.trim()) newErrors.description = 'Description is required';
    if (!proposedDate) newErrors.proposedDate = 'Date is required';
    if (new Date(proposedDate) < new Date()) {
      newErrors.proposedDate = 'Date cannot be in the past';
    }
    if (maxFamilies < 1) newErrors.maxFamilies = 'At least 1 family required';
    if (minAge > maxAge) newErrors.ageRange = 'Min age cannot be greater than max age';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddInterest = () => {
    if (interestInput.trim() && !interests.includes(interestInput)) {
      setInterests([...interests, interestInput]);
      setInterestInput('');
    }
  };

  const handleRemoveInterest = (interest: string) => {
    setInterests(interests.filter(i => i !== interest));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const proposal = {
      creatorFamilyId: 'current-user-family-id',
      locationId: defaultLocationId || '',
      title,
      description,
      proposedDate,
      proposedTime,
      maxFamilies,
      interests,
      ageRangeTarget: {
        minAge: minAge || undefined,
        maxAge: maxAge || undefined,
      } as AgeRange,
      status: 'open' as const,
    };

    onSubmit(proposal);
  };

  return (
    <div className={`outing-proposal-form ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
      <div className="form-header">
        <h2 className="form-title">Propose a Group Outing</h2>
        <p className="form-subtitle">Invite other families to join your outing</p>
      </div>

      <form onSubmit={handleSubmit} className="form-content">
        <div className="form-group">
          <label htmlFor="title" className="form-label">Outing Title *</label>
          <input
            id="title"
            type="text"
            className={`form-input ${errors.title ? 'error' : ''}`}
            placeholder="e.g., Park Playdate, Museum Visit"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          {errors.title && <span className="error-message">{errors.title}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="description" className="form-label">Description *</label>
          <textarea
            id="description"
            className={`form-textarea ${errors.description ? 'error' : ''}`}
            placeholder="Describe what you plan to do..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
          />
          {errors.description && <span className="error-message">{errors.description}</span>}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="date" className="form-label">Proposed Date *</label>
            <input
              id="date"
              type="date"
              className={`form-input ${errors.proposedDate ? 'error' : ''}`}
              value={proposedDate}
              onChange={(e) => setProposedDate(e.target.value)}
            />
            {errors.proposedDate && <span className="error-message">{errors.proposedDate}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="time" className="form-label">Time</label>
            <input
              id="time"
              type="time"
              className="form-input"
              value={proposedTime}
              onChange={(e) => setProposedTime(e.target.value)}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="maxFamilies" className="form-label">Maximum Families *</label>
          <input
            id="maxFamilies"
            type="number"
            className={`form-input ${errors.maxFamilies ? 'error' : ''}`}
            min="1"
            max="20"
            value={maxFamilies}
            onChange={(e) => setMaxFamilies(Number(e.target.value))}
          />
          {errors.maxFamilies && <span className="error-message">{errors.maxFamilies}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">Age Range</label>
          <div className="age-range-inputs">
            <div className="age-input-group">
              <label className="age-label">Min Age</label>
              <input
                type="number"
                className="form-input"
                min="0"
                max="18"
                value={minAge}
                onChange={(e) => setMinAge(Number(e.target.value))}
              />
            </div>
            <span className="age-separator">to</span>
            <div className="age-input-group">
              <label className="age-label">Max Age</label>
              <input
                type="number"
                className="form-input"
                min="0"
                max="18"
                value={maxAge}
                onChange={(e) => setMaxAge(Number(e.target.value))}
              />
            </div>
          </div>
          {errors.ageRange && <span className="error-message">{errors.ageRange}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">Interests & Activities</label>
          <div className="interest-input-group">
            <input
              type="text"
              className="form-input"
              placeholder="Add an interest (e.g., outdoor, educational)"
              value={interestInput}
              onChange={(e) => setInterestInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddInterest();
                }
              }}
            />
            <button
              type="button"
              className="add-interest-btn"
              onClick={handleAddInterest}
            >
              Add
            </button>
          </div>
          {interests.length > 0 && (
            <div className="interests-tags">
              {interests.map((interest) => (
                <span key={interest} className="interest-tag">
                  {interest}
                  <button
                    type="button"
                    className="remove-interest"
                    onClick={() => handleRemoveInterest(interest)}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-cancel"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-submit"
          >
            Propose Outing
          </button>
        </div>
      </form>
    </div>
  );
}
