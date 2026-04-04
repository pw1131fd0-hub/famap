// @vitest-environment happy-dom
/**
 * Tests for Emergency Venue Finder Component
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EmergencyVenueFinder } from '../components/EmergencyVenueFinder';
import type { Location } from '../types';
import { LanguageProvider } from '../i18n/LanguageContext';
import * as emergencyVenueFinderUtils from '../utils/emergencyVenueFinder';

// Mock the emergency venue finder utilities
vi.mock('../utils/emergencyVenueFinder', () => ({
  findEmergencyVenue: vi.fn((locations: any[]) => {
    return locations.slice(0, 2).map((loc: any) => ({
      locationId: loc.id,
      locationName: loc.name.en,
      score: 85,
      urgencyMatch: 90,
      timeMatch: 80,
      facilityReliability: 85,
      crowdingLevel: 'low',
      estimatedWaitTime: 10,
      travelTime: 5,
      suitabilityForAges: true,
      recommendationReason: ['Close by', 'Good facilities'],
    }));
  }),
  generateLastMinuteOutingPlans: vi.fn(() => ({
    durationMinutes: 120,
    nearbyVenues: [],
    quickActivities: [
      {
        category: 'Playground',
        duration: 45,
        venues: ['Park 1'],
      },
    ],
    weatherConsiderations: 'Sunny day',
    estimatedCost: 200,
    bestTimeWindow: {
      startTime: new Date(new Date().getTime() + 3600000),
      endTime: new Date(new Date().getTime() + 7200000),
      crowdingPrediction: 'Low',
    },
  })),
  findSpecificEmergencyVenue: vi.fn(),
}));

const mockLocations: Location[] = [
  {
    id: 'loc-1',
    name: { en: 'Medical Clinic', zh: '醫療診所' },
    category: 'medical',
    coordinates: { lat: 25.033, lng: 121.5154 },
    facilities: ['medical_facility', 'first_aid'],
    address: { en: 'Test Address 1', zh: '測試地址 1' },
    photos: [],
    rating: 4.5,
  },
  {
    id: 'loc-2',
    name: { en: 'Family Restaurant', zh: '家庭餐廳' },
    category: 'restaurant',
    coordinates: { lat: 25.0365, lng: 121.5164 },
    facilities: ['bathroom', 'high_chair'],
    address: { en: 'Test Address 2', zh: '測試地址 2' },
    photos: [],
    rating: 4.2,
  },
];

const renderComponent = (props = {}) => {
  const defaultProps = {
    locations: mockLocations,
    userLat: 25.033,
    userLng: 121.5154,
    onVenueSelected: vi.fn(),
    ...props,
  };

  return render(
    <LanguageProvider initialLanguage="en">
      <EmergencyVenueFinder {...defaultProps} />
    </LanguageProvider>
  );
};

describe('EmergencyVenueFinder Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the emergency venue finder component', () => {
    renderComponent();
    expect(screen.getByText(/Emergency & Quick Venue Finder/i)).toBeInTheDocument();
  });

  it('displays emergency type selector', () => {
    renderComponent();
    const selector = screen.getByLabelText(/What do you need/i);
    expect(selector).toBeInTheDocument();
  });

  it('displays urgency selector', () => {
    renderComponent();
    const urgencySelect = screen.getByLabelText(/How urgent/i);
    expect(urgencySelect).toBeInTheDocument();
  });

  it('displays time available slider', () => {
    renderComponent();
    const timeSlider = screen.getByRole('slider', { name: /Time available/i });
    expect(timeSlider).toBeInTheDocument();
  });

  it('displays family size slider', () => {
    renderComponent();
    expect(screen.getByText(/Family size/i)).toBeInTheDocument();
  });

  it('displays child ages input field', () => {
    renderComponent();
    expect(screen.getByPlaceholderText(/e.g., 3, 5, 8/i)).toBeInTheDocument();
  });

  it('displays Find Venue button', () => {
    renderComponent();
    expect(screen.getByRole('button', { name: /Find Venue/i })).toBeInTheDocument();
  });

  it('displays Last-Minute Outing Plan button', () => {
    renderComponent();
    expect(screen.getByRole('button', { name: /Last-Minute Outing Plan/i })).toBeInTheDocument();
  });

  it('handles search button click', async () => {
    renderComponent();
    const searchButton = screen.getByRole('button', { name: /Find Venue/i });

    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText(/Available Venues/i)).toBeInTheDocument();
    });
  });

  it('displays venue results after search', async () => {
    vi.mocked(emergencyVenueFinderUtils.findEmergencyVenue).mockReturnValue([
      {
        locationId: 'loc-1',
        locationName: 'Medical Clinic',
        score: 85,
        urgencyMatch: 90,
        timeMatch: 80,
        facilityReliability: 85,
        crowdingLevel: 'low',
        estimatedWaitTime: 10,
        travelTime: 5,
        suitabilityForAges: true,
        recommendationReason: ['Close by', 'Good facilities'],
      },
    ]);

    renderComponent();
    const searchButton = screen.getByRole('button', { name: /Find Venue/i });

    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText('Medical Clinic')).toBeInTheDocument();
      expect(screen.getByText(/85\/100/)).toBeInTheDocument();
    });
  });

  it('displays venue metrics in results', async () => {
    vi.mocked(emergencyVenueFinderUtils.findEmergencyVenue).mockReturnValue([
      {
        locationId: 'loc-1',
        locationName: 'Medical Clinic',
        score: 85,
        urgencyMatch: 90,
        timeMatch: 80,
        facilityReliability: 85,
        crowdingLevel: 'low',
        estimatedWaitTime: 10,
        travelTime: 5,
        suitabilityForAges: true,
        recommendationReason: ['Close by', 'Good facilities'],
      },
    ]);

    renderComponent();
    fireEvent.click(screen.getByRole('button', { name: /Find Venue/i }));

    await waitFor(() => {
      expect(screen.getByText(/Travel time/i)).toBeInTheDocument();
      expect(screen.getByText(/Est. wait/i)).toBeInTheDocument();
      expect(screen.getByText(/Crowding/i)).toBeInTheDocument();
    });
  });

  it('handles venue selection', async () => {
    const onVenueSelected = vi.fn();
    vi.mocked(emergencyVenueFinderUtils.findEmergencyVenue).mockReturnValue([
      {
        locationId: 'loc-1',
        locationName: 'Medical Clinic',
        score: 85,
        urgencyMatch: 90,
        timeMatch: 80,
        facilityReliability: 85,
        crowdingLevel: 'low',
        estimatedWaitTime: 10,
        travelTime: 5,
        suitabilityForAges: true,
        recommendationReason: ['Close by', 'Good facilities'],
      },
    ]);

    renderComponent({ onVenueSelected });

    fireEvent.click(screen.getByRole('button', { name: /Find Venue/i }));

    await waitFor(() => {
      const selectButton = screen.getByRole('button', { name: /Select Venue/i });
      fireEvent.click(selectButton);
      expect(onVenueSelected).toHaveBeenCalled();
    });
  });

  it('handles last-minute plan generation', async () => {
    renderComponent();
    const lastMinuteButton = screen.getByRole('button', { name: /Last-Minute Outing Plan/i });

    fireEvent.click(lastMinuteButton);

    await waitFor(() => {
      expect(vi.mocked(emergencyVenueFinderUtils.generateLastMinuteOutingPlans)).toHaveBeenCalled();
    });
  });

  it('displays last-minute plan information', async () => {
    renderComponent();
    fireEvent.click(screen.getByRole('button', { name: /Last-Minute Outing Plan/i }));

    await waitFor(() => {
      expect(screen.getByText(/Activities/i)).toBeInTheDocument();
      expect(screen.getByText(/Est. cost/i)).toBeInTheDocument();
    });
  });

  it('updates emergency type when selector changes', async () => {
    renderComponent();

    const emergencySelect = screen.getByLabelText(/What do you need/i);
    fireEvent.change(emergencySelect, { target: { value: 'nursing_room' } });

    fireEvent.click(screen.getByRole('button', { name: /Find Venue/i }));

    await waitFor(() => {
      expect(vi.mocked(emergencyVenueFinderUtils.findEmergencyVenue)).toHaveBeenCalled();
    });
  });

  it('updates urgency when selector changes', async () => {
    renderComponent();
    const urgencySelect = screen.getByLabelText(/How urgent/i);
    fireEvent.change(urgencySelect, { target: { value: 'critical' } });

    expect(urgencySelect).toHaveValue('critical');
  });

  it('updates time available when slider changes', async () => {
    renderComponent();
    const timeSlider = screen.getByRole('slider', { name: /Time available/i });

    fireEvent.change(timeSlider, { target: { value: '60' } });

    expect(timeSlider).toHaveValue('60');
  });

  it('displays empty state when no results found', async () => {
    vi.mocked(emergencyVenueFinderUtils.findEmergencyVenue).mockReturnValue([]);

    renderComponent();
    fireEvent.click(screen.getByRole('button', { name: /Find Venue/i }));

    await waitFor(() => {
      expect(screen.getByText(/No suitable venues found/i)).toBeInTheDocument();
    });
  });

  it('handles empty locations array', () => {
    renderComponent({ locations: [] });
    expect(screen.getByText(/Emergency & Quick Venue Finder/i)).toBeInTheDocument();
  });

  it('parses child ages input correctly', async () => {
    const user = userEvent.setup();
    renderComponent();

    const agesInput = screen.getByPlaceholderText(/e.g., 3, 5, 8/i);
    await user.clear(agesInput);
    await user.type(agesInput, '2, 5, 10');

    // Ages should be parsed
    expect(agesInput).toHaveValue('2, 5, 10');
  });

  it('supports bilingual labels', () => {
    renderComponent();

    // English labels should be present
    expect(screen.getByText(/What do you need/i)).toBeInTheDocument();
    expect(screen.getByText(/How urgent/i)).toBeInTheDocument();
  });

  it('displays crowding level badge with appropriate styling', async () => {
    vi.mocked(emergencyVenueFinderUtils.findEmergencyVenue).mockReturnValue([
      {
        locationId: 'loc-1',
        locationName: 'Medical Clinic',
        score: 85,
        urgencyMatch: 90,
        timeMatch: 80,
        facilityReliability: 85,
        crowdingLevel: 'low',
        estimatedWaitTime: 10,
        travelTime: 5,
        suitabilityForAges: true,
        recommendationReason: [],
      },
    ]);

    renderComponent();
    fireEvent.click(screen.getByRole('button', { name: /Find Venue/i }));

    await waitFor(() => {
      const crowdingBadges = document.querySelectorAll('.evf-crowding');
      expect(crowdingBadges.length).toBeGreaterThan(0);
    });
  });

  it('displays recommendation reasons in results', async () => {
    vi.mocked(emergencyVenueFinderUtils.findEmergencyVenue).mockReturnValue([
      {
        locationId: 'loc-1',
        locationName: 'Medical Clinic',
        score: 85,
        urgencyMatch: 90,
        timeMatch: 80,
        facilityReliability: 85,
        crowdingLevel: 'low',
        estimatedWaitTime: 10,
        travelTime: 5,
        suitabilityForAges: true,
        recommendationReason: ['Close by', 'Good facilities', 'Quick service'],
      },
    ]);

    renderComponent();
    fireEvent.click(screen.getByRole('button', { name: /Find Venue/i }));

    await waitFor(() => {
      expect(screen.getByText(/Why recommended/i)).toBeInTheDocument();
    });
  });
});
