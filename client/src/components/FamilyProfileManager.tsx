import { useState, useEffect } from 'react';
import { X, Plus, Edit2, Trash2, Users } from 'lucide-react';
import {
  createFamilyProfile,
  saveFamilyProfiles,
  loadFamilyProfiles,
  getCurrentFamilyProfile,
  setCurrentFamilyProfile,
  getFamilyTypeRecommendations,
  type FamilyProfile,
  type ChildProfile,
} from '../utils/familyContext';
import '../styles/FamilyProfileManager.css';

interface FamilyProfileManagerProps {
  onProfileChange?: (profile: FamilyProfile | null) => void;
  onClose?: () => void;
  isOpen: boolean;
}

export function FamilyProfileManager({
  onProfileChange,
  onClose,
  isOpen,
}: FamilyProfileManagerProps) {
  const [profiles, setProfiles] = useState<FamilyProfile[]>([]);
  const [currentProfile, setCurrentProfile] = useState<FamilyProfile | null>(
    null
  );
  const [showForm, setShowForm] = useState(false);

  // Legitimate pattern: loading profile data from localStorage on component mount.
  // Multiple setState calls hydrate React state from persistent storage during initialization.
  // This ensures the component's state matches the saved profiles when mounted.
  // eslint-disable react-hooks/set-state-in-effect
  useEffect(() => {
    const loaded = loadFamilyProfiles();
    setProfiles(loaded);

    const current = getCurrentFamilyProfile();
    setCurrentProfile(current);
  }, []);
  // eslint-enable react-hooks/set-state-in-effect

  const handleCreateProfile = (children: Omit<ChildProfile, 'id'>[]) => {
    const newProfile = createFamilyProfile(children.length, children);
    const updated = [...profiles, newProfile];

    setProfiles(updated);
    saveFamilyProfiles(updated);
    setCurrentFamilyProfile(newProfile.id);
    setCurrentProfile(newProfile);
    onProfileChange?.(newProfile);
    setShowForm(false);
  };

  const handleSelectProfile = (profile: FamilyProfile) => {
    setCurrentProfile(profile);
    setCurrentFamilyProfile(profile.id);
    onProfileChange?.(profile);
  };

  const handleDeleteProfile = (profileId: string) => {
    const updated = profiles.filter((p) => p.id !== profileId);
    setProfiles(updated);
    saveFamilyProfiles(updated);

    if (currentProfile?.id === profileId) {
      const newCurrent = updated[0] || null;
      setCurrentProfile(newCurrent);
      onProfileChange?.(newCurrent);
      if (newCurrent) {
        setCurrentFamilyProfile(newCurrent.id);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="family-profile-manager">
      <div className="family-profile-overlay" onClick={onClose} />
      <div className="family-profile-modal">
        <div className="family-profile-header">
          <h2>
            <Users size={20} />
            Family Profiles
          </h2>
          <button
            onClick={onClose}
            className="family-profile-close"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="family-profile-content">
          {profiles.length === 0 ? (
            <div className="no-profiles-message">
              <p>No family profiles yet. Create one to get personalized recommendations.</p>
              <button
                onClick={() => setShowForm(true)}
                className="create-profile-btn"
              >
                <Plus size={16} />
                Create First Profile
              </button>
            </div>
          ) : (
            <>
              <div className="profiles-list">
                {profiles.map((profile) => (
                  <div
                    key={profile.id}
                    className={`profile-card ${
                      currentProfile?.id === profile.id ? 'active' : ''
                    }`}
                    onClick={() => handleSelectProfile(profile)}
                  >
                    <div className="profile-card-header">
                      <h3>
                        {profile.name ||
                          `Family with ${profile.numberOfChildren} child${profile.numberOfChildren !== 1 ? 'ren' : ''}`}
                      </h3>
                      <div className="profile-card-actions">
                        <button
                          className="action-btn edit-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Edit functionality can be added in future iterations
                          }}
                          aria-label="Edit profile"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          className="action-btn delete-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteProfile(profile.id);
                          }}
                          aria-label="Delete profile"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="profile-card-info">
                      <div className="info-item">
                        <span className="label">Family Type:</span>
                        <span className="value">{profile.familyType}</span>
                      </div>
                      <div className="info-item">
                        <span className="label">Children:</span>
                        <span className="value">{profile.numberOfChildren}</span>
                      </div>
                      {profile.children.length > 0 && (
                        <div className="children-list">
                          {profile.children.map((child) => (
                            <div key={child.id} className="child-item">
                              <span className="child-name">
                                {child.name || `Child ${profile.children.indexOf(child) + 1}`}
                              </span>
                              <span className="child-age">Age: {child.age}</span>
                              {child.specialNeeds?.length ? (
                                <span className="child-needs">
                                  Special needs: {child.specialNeeds.join(', ')}
                                </span>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      )}
                      {profile.specialNeeds.length > 0 && (
                        <div className="info-item">
                          <span className="label">Needs:</span>
                          <span className="value">
                            {profile.specialNeeds.join(', ')}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="profile-recommendations">
                      <p className="recommendations-title">Suggestions:</p>
                      <ul>
                        {getFamilyTypeRecommendations(profile.familyType).map(
                          (rec, idx) => (
                            <li key={idx}>{rec}</li>
                          )
                        )}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setShowForm(true)}
                className="create-profile-btn-bottom"
              >
                <Plus size={16} />
                Add Another Profile
              </button>
            </>
          )}

          {showForm && (
            <FamilyProfileForm
              onSubmit={handleCreateProfile}
              onCancel={() => setShowForm(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

interface FamilyProfileFormProps {
  onSubmit: (children: Omit<ChildProfile, 'id'>[]) => void;
  onCancel: () => void;
}

function FamilyProfileForm({ onSubmit, onCancel }: FamilyProfileFormProps) {
  const [numberOfChildren, setNumberOfChildren] = useState(1);
  const [children, setChildren] = useState<Omit<ChildProfile, 'id'>[]>([
    { age: 5 },
  ]);

  const handleAddChild = () => {
    setChildren([...children, { age: 5 }]);
    setNumberOfChildren(children.length + 1);
  };

  const handleRemoveChild = (idx: number) => {
    const updated = children.filter((_, i) => i !== idx);
    setChildren(updated);
    setNumberOfChildren(updated.length);
  };

  const handleChildChange = (
    idx: number,
    field: keyof Omit<ChildProfile, 'id'>,
    value: any
  ) => {
    const updated = [...children];
    if (field === 'age') {
      updated[idx] = { ...updated[idx], [field]: parseInt(value) || 0 };
    } else {
      updated[idx] = { ...updated[idx], [field]: value };
    }
    setChildren(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (children.length > 0) {
      onSubmit(children);
    }
  };

  return (
    <form className="family-profile-form" onSubmit={handleSubmit}>
      <h3>Create New Family Profile</h3>

      <div className="form-group">
        <label>Number of Children: {numberOfChildren}</label>
      </div>

      <div className="children-form-container">
        {children.map((child, idx) => (
          <div key={idx} className="child-form-group">
            <div className="form-row">
              <div className="form-input">
                <label>Child {idx + 1} Name (optional)</label>
                <input
                  type="text"
                  placeholder="e.g., Emma"
                  value={child.name || ''}
                  onChange={(e) =>
                    handleChildChange(idx, 'name', e.target.value)
                  }
                />
              </div>
              <div className="form-input">
                <label>Age (years)</label>
                <input
                  type="number"
                  min="0"
                  max="18"
                  value={child.age}
                  onChange={(e) =>
                    handleChildChange(idx, 'age', e.target.value)
                  }
                />
              </div>
            </div>

            {children.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemoveChild(idx)}
                className="remove-child-btn"
              >
                <Trash2 size={16} />
                Remove
              </button>
            )}
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={handleAddChild}
        className="add-child-btn"
      >
        <Plus size={16} />
        Add Another Child
      </button>

      <div className="form-actions">
        <button type="button" onClick={onCancel} className="cancel-btn">
          Cancel
        </button>
        <button type="submit" className="submit-btn">
          Create Profile
        </button>
      </div>
    </form>
  );
}
