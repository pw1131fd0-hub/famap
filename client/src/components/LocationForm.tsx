import React, { useState } from 'react';
import { type LocationCreateDTO, type Category } from '../types';
import { useTranslation } from '../i18n/LanguageContext';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Failed to submit location:', error);
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
  const commonFacilities = ['stroller_accessible', 'nursing_room', 'high_chair', 'public_toilet'];

  return (
    <div className="location-form">
      <h3>{t.common.addLocation}</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>{t.locationForm.nameZh}</label>
          <input
            type="text"
            value={formData.name.zh}
            onChange={e => setFormData({ ...formData, name: { ...formData.name, zh: e.target.value } })}
            required
          />
        </div>
        <div className="form-group">
          <label>{t.locationForm.nameEn}</label>
          <input
            type="text"
            value={formData.name.en}
            onChange={e => setFormData({ ...formData, name: { ...formData.name, en: e.target.value } })}
            required
          />
        </div>
        <div className="form-group">
          <label>{t.locationForm.category}</label>
          <select
            value={formData.category}
            onChange={e => setFormData({ ...formData, category: e.target.value as Category })}
          >
            {categories.map(c => (
              <option key={c} value={c}>{t.categories[c]}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>{t.locationForm.addressZh}</label>
          <input
            type="text"
            value={formData.address.zh}
            onChange={e => setFormData({ ...formData, address: { ...formData.address, zh: e.target.value } })}
            required
          />
        </div>
        <div className="form-group">
          <label>{t.locationForm.addressEn}</label>
          <input
            type="text"
            value={formData.address.en}
            onChange={e => setFormData({ ...formData, address: { ...formData.address, en: e.target.value } })}
            required
          />
        </div>
        <div className="form-group">
          <label>{t.locationForm.descriptionZh}</label>
          <textarea
            value={formData.description.zh}
            onChange={e => setFormData({ ...formData, description: { ...formData.description, zh: e.target.value } })}
          />
        </div>
        <div className="form-group">
          <label>{t.locationForm.descriptionEn}</label>
          <textarea
            value={formData.description.en}
            onChange={e => setFormData({ ...formData, description: { ...formData.description, en: e.target.value } })}
          />
        </div>
        <div className="form-group">
          <label>{t.locationForm.facilities}</label>
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
          <button type="button" onClick={onCancel} className="cancel-button">{t.common.cancel}</button>
          <button type="submit" disabled={loading} className="submit-button">
            {loading ? t.common.loading : t.common.submit}
          </button>
        </div>
      </form>
    </div>
  );
};
