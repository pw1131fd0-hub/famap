import React, { useState } from 'react';
import { type LocationCreateDTO, type Category } from '../types';
import { useTranslation } from '../i18n/useTranslation';

interface LocationFormProps {
  onSubmit: (location: LocationCreateDTO) => Promise<void>;
  onCancel: () => void;
  initialCoordinates?: { lat: number; lng: number };
}

export const LocationForm: React.FC<LocationFormProps> = ({ onSubmit, onCancel, initialCoordinates }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<LocationCreateDTO>({
    name: { zh: '', en: '' },
    description: { zh: '', en: '' },
    category: 'park',
    coordinates: initialCoordinates || { lat: 25.0330, lng: 121.5654 },
    address: { zh: '', en: '' },
    facilities: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validate required fields
    if (!formData.name.zh.trim() || !formData.name.en.trim() ||
        !formData.address.zh.trim() || !formData.address.en.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
      setSuccess(true);
      setTimeout(() => {
        onCancel(); // Close form after success
      }, 1500);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to submit location';
      setError(message);
      console.error('Failed to submit location:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleFacility = (facility: string) => {
    setFormData(prev => ({
      ...prev,
      facilities: prev.facilities.includes(facility)
        ? prev.facilities.filter(f => f !== facility)
        : [...prev.facilities, facility]
    }));
  };

  const categories: Category[] = ['park', 'nursing_room', 'restaurant', 'medical'];
  const commonFacilities = ['stroller_accessible', 'changing_table', 'high_chair', 'public_toilet'];

  return (
    <div className="location-form">
      <h3>{t.common.addLocation}</h3>
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
          Location added successfully!
        </div>
      )}
      <form onSubmit={handleSubmit} role="form" aria-label="Add a new location">
        <div className="form-group">
          <label htmlFor="nameZh">
            {t.locationForm.nameZh}
            <input
              id="nameZh"
              type="text"
              value={formData.name.zh}
              onChange={e => setFormData({ ...formData, name: { ...formData.name, zh: e.target.value } })}
              required
              aria-required="true"
            />
          </label>
        </div>
        <div className="form-group">
          <label htmlFor="nameEn">
            {t.locationForm.nameEn}
            <input
              id="nameEn"
              type="text"
              value={formData.name.en}
              onChange={e => setFormData({ ...formData, name: { ...formData.name, en: e.target.value } })}
              required
              aria-required="true"
            />
          </label>
        </div>
        <div className="form-group">
          <label htmlFor="category">
            {t.locationForm.category}
            <select
              id="category"
              value={formData.category}
              onChange={e => setFormData({ ...formData, category: e.target.value as Category })}
              aria-label="Location category"
            >
              {categories.map(c => (
                <option key={c} value={c}>{t.categories[c]}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="form-group">
          <label>
            {t.locationForm.addressZh}
            <input
              type="text"
              value={formData.address.zh}
              onChange={e => setFormData({ ...formData, address: { ...formData.address, zh: e.target.value } })}
              required
            />
          </label>
        </div>
        <div className="form-group">
          <label>
            {t.locationForm.addressEn}
            <input
              type="text"
              value={formData.address.en}
              onChange={e => setFormData({ ...formData, address: { ...formData.address, en: e.target.value } })}
              required
            />
          </label>
        </div>
        <div className="form-group">
          <label>
            {t.locationForm.descriptionZh}
            <textarea
              value={formData.description.zh}
              onChange={e => setFormData({ ...formData, description: { ...formData.description, zh: e.target.value } })}
            />
          </label>
        </div>
        <div className="form-group">
          <label>
            {t.locationForm.descriptionEn}
            <textarea
              value={formData.description.en}
              onChange={e => setFormData({ ...formData, description: { ...formData.description, en: e.target.value } })}
            />
          </label>
        </div>
        <div className="form-group">
          <span>{t.locationForm.facilities}</span>
          <div className="facility-checkboxes">
            {commonFacilities.map(f => (
              <label key={f} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.facilities.includes(f)}
                  onChange={() => toggleFacility(f)}
                />
                {t.facilities[f as keyof typeof t.facilities] || f}
              </label>
            ))}
          </div>
        </div>
        <div className="form-actions">
          <button type="button" onClick={onCancel} className="cancel-button" aria-label="Cancel form">
            {t.common.cancel}
          </button>
          <button type="submit" disabled={loading} className="submit-button" aria-busy={loading}>
            {loading ? t.common.loading : t.common.submit}
          </button>
        </div>
      </form>
    </div>
  );
};
