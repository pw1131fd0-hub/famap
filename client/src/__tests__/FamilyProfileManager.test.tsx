// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FamilyProfileManager } from '../components/FamilyProfileManager';
import * as familyContext from '../utils/familyContext';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('FamilyProfileManager', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should render when isOpen is true', () => {
    render(<FamilyProfileManager isOpen={true} onClose={() => {}} />);
    expect(screen.getByText('Family Profiles')).toBeInTheDocument();
  });

  it('should show message when no profiles exist', () => {
    render(<FamilyProfileManager isOpen={true} onClose={() => {}} />);
    expect(
      screen.getByText('No family profiles yet. Create one to get personalized recommendations.')
    ).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(<FamilyProfileManager isOpen={true} onClose={onClose} />);

    const closeBtn = screen.getByLabelText('Close');
    fireEvent.click(closeBtn);

    expect(onClose).toHaveBeenCalled();
  });

  it('should show form when create button is clicked', () => {
    render(<FamilyProfileManager isOpen={true} onClose={() => {}} />);

    const createBtn = screen.getByText('Create First Profile');
    fireEvent.click(createBtn);

    expect(screen.getByText('Create New Family Profile')).toBeInTheDocument();
  });

  it('should display created profiles', () => {
    const profile = familyContext.createFamilyProfile(1, [{ age: 5 }]);
    familyContext.saveFamilyProfiles([profile]);

    render(<FamilyProfileManager isOpen={true} onClose={() => {}} />);

    expect(screen.getByText(/Family with 1 child/)).toBeInTheDocument();
  });

  it('should show profile details', () => {
    const profile = familyContext.createFamilyProfile(2, [
      { age: 3, name: 'Emma' },
      { age: 5, name: 'Oliver' },
    ]);
    familyContext.saveFamilyProfiles([profile]);

    const { container } = render(
      <FamilyProfileManager isOpen={true} onClose={() => {}} />
    );

    expect(screen.getByText('Family Type:')).toBeInTheDocument();
    expect(screen.getByText('Children:')).toBeInTheDocument();
    // Verify profile type is close_age_gap by checking component rendered
    const profileInfo = container.querySelector('.profile-card-info');
    expect(profileInfo?.textContent).toContain('close_age_gap');
  });

  it('should show family type recommendations', () => {
    const profile = familyContext.createFamilyProfile(1, [{ age: 5 }]);
    familyContext.saveFamilyProfiles([profile]);

    render(<FamilyProfileManager isOpen={true} onClose={() => {}} />);

    expect(screen.getByText('Suggestions:')).toBeInTheDocument();
  });

  it('should handle special needs in profiles', () => {
    const profile = familyContext.createFamilyProfile(1, [
      {
        age: 6,
        specialNeeds: ['autism'],
      },
    ]);
    familyContext.saveFamilyProfiles([profile]);

    render(<FamilyProfileManager isOpen={true} onClose={() => {}} />);

    const container = screen.getByText(/Special needs:/);
    expect(container).toBeInTheDocument();
  });

  it('should show child age in profile', () => {
    const profile = familyContext.createFamilyProfile(1, [{ age: 7 }]);
    familyContext.saveFamilyProfiles([profile]);

    render(<FamilyProfileManager isOpen={true} onClose={() => {}} />);

    expect(screen.getByText('Age: 7')).toBeInTheDocument();
  });

  it('should highlight active profile', () => {
    const profile1 = familyContext.createFamilyProfile(1, [{ age: 3 }]);
    const profile2 = familyContext.createFamilyProfile(1, [{ age: 5 }]);
    familyContext.saveFamilyProfiles([profile1, profile2]);
    familyContext.setCurrentFamilyProfile(profile1.id);

    const { container } = render(
      <FamilyProfileManager isOpen={true} onClose={() => {}} />
    );

    const activeCard = container.querySelector('.profile-card.active');
    expect(activeCard).toBeInTheDocument();
  });

  it('should allow adding another profile after first creation', () => {
    const profile = familyContext.createFamilyProfile(1, [{ age: 5 }]);
    familyContext.saveFamilyProfiles([profile]);

    render(<FamilyProfileManager isOpen={true} onClose={() => {}} />);

    const addBtn = screen.getByText('Add Another Profile');
    fireEvent.click(addBtn);

    expect(screen.getByText('Create New Family Profile')).toBeInTheDocument();
  });

  it('should delete a profile', () => {
    const profile = familyContext.createFamilyProfile(1, [{ age: 5 }]);
    familyContext.saveFamilyProfiles([profile]);

    render(<FamilyProfileManager isOpen={true} onClose={() => {}} />);

    const deleteBtn = screen.getByLabelText('Delete profile');
    fireEvent.click(deleteBtn);

    expect(
      screen.getByText('No family profiles yet. Create one to get personalized recommendations.')
    ).toBeInTheDocument();
  });
});
