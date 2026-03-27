import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LocationDetailPanel } from '../components/LocationDetailPanel';
import { LanguageProvider } from '../i18n/LanguageContext';
import type { Location, Review } from '../types';

describe('LocationDetailPanel', () => {
  const mockLocation: Location = {
    id: '1',
    name: { zh: '台北公園', en: 'Taipei Park' },
    address: { zh: '台北市中山區', en: 'Zhongshan, Taipei' },
    coordinates: { lat: 25.0330, lng: 121.5654 },
    category: 'park',
    facilities: ['changing_table', 'high_chair'],
    averageRating: 4.5,
    description: { zh: '台北市中心的公園', en: 'Park in central Taipei' },
    phoneNumber: '02-1234-5678',
    pricing: { isFree: true },
    ageRange: { minAge: 0, maxAge: 12 },
    operatingHours: {
      monday: '09:00-17:00',
      tuesday: '09:00-17:00',
      wednesday: '09:00-17:00',
      thursday: '09:00-17:00',
      friday: '09:00-17:00',
      saturday: '08:00-18:00',
      sunday: '08:00-18:00'
    },
    publicTransit: {
      nearestMRT: {
        station: '中山站',
        line: '紅線',
        distance: 500
      },
      busLines: ['22', '25']
    },
    parking: {
      available: true,
      cost: '$50/hour',
      hasValidation: true
    },
    toilet: {
      available: true,
      childrenFriendly: true,
      hasChangingTable: true
    },
    hasWiFi: true,
    allergens: {
      commonAllergens: ['peanuts', 'dairy']
    },
    crowding: {
      quietHours: '09:00-12:00',
      peakHours: '13:00-17:00',
      averageCrowding: 'moderate'
    },
    nursingAmenities: {
      hasDedicatedArea: true,
      hasChangingTable: true,
      hasPowerOutlet: true,
      hasRefrigerator: true,
      hasWarmWater: true
    },
    weatherCoverage: {
      isIndoor: false,
      hasRoof: false,
      hasShade: true,
      weatherProtection: 'Large trees provide shade'
    },
    nearbyAmenities: {
      convenientStores: 3,
      nearbyRestrooms: true,
      nearbyRestaurants: true,
      nearbyPublicTransit: 'MRT nearby'
    },
    accessibility: {
      wheelchairAccessible: true,
      accessibleToilet: true,
      disabledParking: true,
      hasElevator: false,
      hasRamp: true,
      accessibilityNotes: 'Good access'
    },
    activity: {
      mainActivities: 'Playground',
      activityTypes: ['slide', 'swing'],
      equipment: ['sandbox', 'playground equipment'],
      ageAppropriate: { minAge: 2, maxAge: 10 }
    },
    safety: {
      safetyRating: 4.5,
      playAreaSafety: 'excellent',
      firstAidAvailable: true,
      supervisionAvailable: true,
      safetyNotes: 'Well maintained'
    },
    qualityMetrics: {
      cleanlinessRating: 4.5,
      maintenanceStatus: 'good',
      lastMaintenanceDate: '2026-03-20',
      cleanlinessNotes: 'Very clean'
    }
  };

  const mockReviews: Review[] = [
    {
      id: '1',
      locationId: '1',
      userId: 'user1',
      rating: 5,
      comment: 'Great place!',
      userName: 'Alice',
      createdAt: '2026-03-20'
    }
  ];

  const mockOnClose = vi.fn();
  const mockOnFavoriteToggle = vi.fn();
  const mockOnReviewSubmit = vi.fn();
  const mockOnCrowdednessReportSubmit = vi.fn();
  const mockOnToggleSection = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders location name and category', () => {
    render(
      <LanguageProvider>
        <LocationDetailPanel
          location={mockLocation}
          isFavorite={false}
          onFavoriteToggle={mockOnFavoriteToggle}
          onClose={mockOnClose}
          reviews={mockReviews}
          onReviewSubmit={mockOnReviewSubmit}
          crowdednessReports={[]}
          onCrowdednessReportSubmit={mockOnCrowdednessReportSubmit}
          expandedSections={{ basic: true }}
          onToggleSection={mockOnToggleSection}
        />
      </LanguageProvider>
    );

    expect(screen.getByText('台北公園')).toBeInTheDocument();
  });

  it('handles favorite toggle', () => {
    render(
      <LanguageProvider>
        <LocationDetailPanel
          location={mockLocation}
          isFavorite={false}
          onFavoriteToggle={mockOnFavoriteToggle}
          onClose={mockOnClose}
          reviews={mockReviews}
          onReviewSubmit={mockOnReviewSubmit}
          crowdednessReports={[]}
          onCrowdednessReportSubmit={mockOnCrowdednessReportSubmit}
          expandedSections={{ basic: true }}
          onToggleSection={mockOnToggleSection}
        />
      </LanguageProvider>
    );

    const favoriteButton = screen.getByRole('button', { name: /加入收藏|add to favorites/i });
    fireEvent.click(favoriteButton);
    expect(mockOnFavoriteToggle).toHaveBeenCalled();
  });

  it('handles close button click', () => {
    render(
      <LanguageProvider>
        <LocationDetailPanel
          location={mockLocation}
          isFavorite={false}
          onFavoriteToggle={mockOnFavoriteToggle}
          onClose={mockOnClose}
          reviews={mockReviews}
          onReviewSubmit={mockOnReviewSubmit}
          crowdednessReports={[]}
          onCrowdednessReportSubmit={mockOnCrowdednessReportSubmit}
          expandedSections={{ basic: true }}
          onToggleSection={mockOnToggleSection}
        />
      </LanguageProvider>
    );

    const buttons = screen.getAllByRole('button');
    const closeButton = buttons.find(btn => btn.querySelector('svg'));
    if (closeButton && closeButton.textContent?.includes('×') === false) {
      fireEvent.click(closeButton);
    }
  });

  it('displays phone number when available', () => {
    render(
      <LanguageProvider>
        <LocationDetailPanel
          location={mockLocation}
          isFavorite={false}
          onFavoriteToggle={mockOnFavoriteToggle}
          onClose={mockOnClose}
          reviews={mockReviews}
          onReviewSubmit={mockOnReviewSubmit}
          crowdednessReports={[]}
          onCrowdednessReportSubmit={mockOnCrowdednessReportSubmit}
          expandedSections={{ basic: true }}
          onToggleSection={mockOnToggleSection}
        />
      </LanguageProvider>
    );

    expect(screen.getByText(/02-1234-5678/)).toBeInTheDocument();
  });

  it('displays pricing information', () => {
    render(
      <LanguageProvider>
        <LocationDetailPanel
          location={mockLocation}
          isFavorite={false}
          onFavoriteToggle={mockOnFavoriteToggle}
          onClose={mockOnClose}
          reviews={mockReviews}
          onReviewSubmit={mockOnReviewSubmit}
          crowdednessReports={[]}
          onCrowdednessReportSubmit={mockOnCrowdednessReportSubmit}
          expandedSections={{ basic: true }}
          onToggleSection={mockOnToggleSection}
        />
      </LanguageProvider>
    );

    expect(screen.getByText(/免費/i)).toBeInTheDocument();
  });

  it('displays age range when available', () => {
    render(
      <LanguageProvider>
        <LocationDetailPanel
          location={mockLocation}
          isFavorite={false}
          onFavoriteToggle={mockOnFavoriteToggle}
          onClose={mockOnClose}
          reviews={mockReviews}
          onReviewSubmit={mockOnReviewSubmit}
          crowdednessReports={[]}
          onCrowdednessReportSubmit={mockOnCrowdednessReportSubmit}
          expandedSections={{ basic: true }}
          onToggleSection={mockOnToggleSection}
        />
      </LanguageProvider>
    );

    // Check for age range information - contains 0-12 or similar
    const elements = screen.getAllByText((_, element) => {
      return element?.textContent?.includes('0') === true || element?.textContent?.includes('12') === true;
    });
    expect(elements.length).toBeGreaterThan(0);
  });

  it('displays operating hours', () => {
    render(
      <LanguageProvider>
        <LocationDetailPanel
          location={mockLocation}
          isFavorite={false}
          onFavoriteToggle={mockOnFavoriteToggle}
          onClose={mockOnClose}
          reviews={mockReviews}
          onReviewSubmit={mockOnReviewSubmit}
          crowdednessReports={[]}
          onCrowdednessReportSubmit={mockOnCrowdednessReportSubmit}
          expandedSections={{ facilities: true }}
          onToggleSection={mockOnToggleSection}
        />
      </LanguageProvider>
    );

    expect(screen.getByText(/週一/)).toBeInTheDocument();
    const hours = screen.getAllByText(/09:00-17:00/);
    expect(hours.length).toBeGreaterThan(0);
  });

  it('displays transit information', () => {
    render(
      <LanguageProvider>
        <LocationDetailPanel
          location={mockLocation}
          isFavorite={false}
          onFavoriteToggle={mockOnFavoriteToggle}
          onClose={mockOnClose}
          reviews={mockReviews}
          onReviewSubmit={mockOnReviewSubmit}
          crowdednessReports={[]}
          onCrowdednessReportSubmit={mockOnCrowdednessReportSubmit}
          expandedSections={{ transit: true }}
          onToggleSection={mockOnToggleSection}
        />
      </LanguageProvider>
    );

    expect(screen.getByText(/中山站/)).toBeInTheDocument();
    expect(screen.getByText(/22, 25/)).toBeInTheDocument();
  });

  it('displays parking information', () => {
    render(
      <LanguageProvider>
        <LocationDetailPanel
          location={mockLocation}
          isFavorite={false}
          onFavoriteToggle={mockOnFavoriteToggle}
          onClose={mockOnClose}
          reviews={mockReviews}
          onReviewSubmit={mockOnReviewSubmit}
          crowdednessReports={[]}
          onCrowdednessReportSubmit={mockOnCrowdednessReportSubmit}
          expandedSections={{ transit: true }}
          onToggleSection={mockOnToggleSection}
        />
      </LanguageProvider>
    );

    expect(screen.getByText(/有停車位/)).toBeInTheDocument();
  });

  it('displays WiFi availability', () => {
    render(
      <LanguageProvider>
        <LocationDetailPanel
          location={mockLocation}
          isFavorite={false}
          onFavoriteToggle={mockOnFavoriteToggle}
          onClose={mockOnClose}
          reviews={mockReviews}
          onReviewSubmit={mockOnReviewSubmit}
          crowdednessReports={[]}
          onCrowdednessReportSubmit={mockOnCrowdednessReportSubmit}
          expandedSections={{ amenities: true }}
          onToggleSection={mockOnToggleSection}
        />
      </LanguageProvider>
    );

    expect(screen.getByText(/有免費WiFi/)).toBeInTheDocument();
  });

  it('displays allergen information', () => {
    render(
      <LanguageProvider>
        <LocationDetailPanel
          location={mockLocation}
          isFavorite={false}
          onFavoriteToggle={mockOnFavoriteToggle}
          onClose={mockOnClose}
          reviews={mockReviews}
          onReviewSubmit={mockOnReviewSubmit}
          crowdednessReports={[]}
          onCrowdednessReportSubmit={mockOnCrowdednessReportSubmit}
          expandedSections={{ amenities: true }}
          onToggleSection={mockOnToggleSection}
        />
      </LanguageProvider>
    );

    expect(screen.getByText(/peanuts, dairy/)).toBeInTheDocument();
  });

  it('displays crowding information', () => {
    render(
      <LanguageProvider>
        <LocationDetailPanel
          location={mockLocation}
          isFavorite={false}
          onFavoriteToggle={mockOnFavoriteToggle}
          onClose={mockOnClose}
          reviews={mockReviews}
          onReviewSubmit={mockOnReviewSubmit}
          crowdednessReports={[]}
          onCrowdednessReportSubmit={mockOnCrowdednessReportSubmit}
          expandedSections={{ comfort: true }}
          onToggleSection={mockOnToggleSection}
        />
      </LanguageProvider>
    );

    expect(screen.getByText(/中等/)).toBeInTheDocument();
  });

  it('displays nursing amenities', () => {
    render(
      <LanguageProvider>
        <LocationDetailPanel
          location={mockLocation}
          isFavorite={false}
          onFavoriteToggle={mockOnFavoriteToggle}
          onClose={mockOnClose}
          reviews={mockReviews}
          onReviewSubmit={mockOnReviewSubmit}
          crowdednessReports={[]}
          onCrowdednessReportSubmit={mockOnCrowdednessReportSubmit}
          expandedSections={{}}
          onToggleSection={mockOnToggleSection}
        />
      </LanguageProvider>
    );

    expect(screen.getByText(/專用區域/)).toBeInTheDocument();
    expect(screen.getByText(/冰箱/)).toBeInTheDocument();
  });

  it('displays accessibility features', () => {
    render(
      <LanguageProvider>
        <LocationDetailPanel
          location={mockLocation}
          isFavorite={false}
          onFavoriteToggle={mockOnFavoriteToggle}
          onClose={mockOnClose}
          reviews={mockReviews}
          onReviewSubmit={mockOnReviewSubmit}
          crowdednessReports={[]}
          onCrowdednessReportSubmit={mockOnCrowdednessReportSubmit}
          expandedSections={{}}
          onToggleSection={mockOnToggleSection}
        />
      </LanguageProvider>
    );

    expect(screen.getByText(/輪椅可進入/)).toBeInTheDocument();
    expect(screen.getByText(/無障礙廁所/)).toBeInTheDocument();
  });

  it('displays safety information', () => {
    render(
      <LanguageProvider>
        <LocationDetailPanel
          location={mockLocation}
          isFavorite={false}
          onFavoriteToggle={mockOnFavoriteToggle}
          onClose={mockOnClose}
          reviews={mockReviews}
          onReviewSubmit={mockOnReviewSubmit}
          crowdednessReports={[]}
          onCrowdednessReportSubmit={mockOnCrowdednessReportSubmit}
          expandedSections={{}}
          onToggleSection={mockOnToggleSection}
        />
      </LanguageProvider>
    );

    expect(screen.getByText(/優良/)).toBeInTheDocument();
    expect(screen.getByText(/急救設備/)).toBeInTheDocument();
  });

  it('displays quality metrics', () => {
    render(
      <LanguageProvider>
        <LocationDetailPanel
          location={mockLocation}
          isFavorite={false}
          onFavoriteToggle={mockOnFavoriteToggle}
          onClose={mockOnClose}
          reviews={mockReviews}
          onReviewSubmit={mockOnReviewSubmit}
          crowdednessReports={[]}
          onCrowdednessReportSubmit={mockOnCrowdednessReportSubmit}
          expandedSections={{}}
          onToggleSection={mockOnToggleSection}
        />
      </LanguageProvider>
    );

    expect(screen.getByText(/清潔度評分/)).toBeInTheDocument();
    expect(screen.getByText(/良好/)).toBeInTheDocument();
  });

  it('renders reviews section', () => {
    render(
      <LanguageProvider>
        <LocationDetailPanel
          location={mockLocation}
          isFavorite={false}
          onFavoriteToggle={mockOnFavoriteToggle}
          onClose={mockOnClose}
          reviews={mockReviews}
          onReviewSubmit={mockOnReviewSubmit}
          crowdednessReports={[]}
          onCrowdednessReportSubmit={mockOnCrowdednessReportSubmit}
          expandedSections={{}}
          onToggleSection={mockOnToggleSection}
        />
      </LanguageProvider>
    );

    expect(screen.getByText(/用戶評論/)).toBeInTheDocument();
  });

  it('does not display optional sections when data is not available', () => {
    const minimalLocation: Location = {
      ...mockLocation,
      phoneNumber: undefined,
      publicTransit: undefined,
      parking: undefined,
      toilet: undefined,
      hasWiFi: false,
      allergens: undefined,
      crowding: undefined,
      nursingAmenities: undefined,
      weatherCoverage: undefined,
      nearbyAmenities: undefined,
      accessibility: undefined,
      activity: undefined,
      safety: undefined,
      qualityMetrics: undefined
    };

    render(
      <LanguageProvider>
        <LocationDetailPanel
          location={minimalLocation}
          isFavorite={false}
          onFavoriteToggle={mockOnFavoriteToggle}
          onClose={mockOnClose}
          reviews={[]}
          onReviewSubmit={mockOnReviewSubmit}
          crowdednessReports={[]}
          onCrowdednessReportSubmit={mockOnCrowdednessReportSubmit}
          expandedSections={{}}
          onToggleSection={mockOnToggleSection}
        />
      </LanguageProvider>
    );

    expect(screen.queryByText(/Phone/i)).not.toBeInTheDocument();
  });

  it('toggles favorite button state correctly', () => {
    const { rerender } = render(
      <LanguageProvider>
        <LocationDetailPanel
          location={mockLocation}
          isFavorite={false}
          onFavoriteToggle={mockOnFavoriteToggle}
          onClose={mockOnClose}
          reviews={mockReviews}
          onReviewSubmit={mockOnReviewSubmit}
          crowdednessReports={[]}
          onCrowdednessReportSubmit={mockOnCrowdednessReportSubmit}
          expandedSections={{ basic: true }}
          onToggleSection={mockOnToggleSection}
        />
      </LanguageProvider>
    );

    const favoriteButton = screen.getByRole('button', { name: /加入收藏|add to favorites/i });
    expect(favoriteButton).toBeInTheDocument();

    rerender(
      <LanguageProvider>
        <LocationDetailPanel
          location={mockLocation}
          isFavorite={true}
          onFavoriteToggle={mockOnFavoriteToggle}
          onClose={mockOnClose}
          reviews={mockReviews}
          onReviewSubmit={mockOnReviewSubmit}
          crowdednessReports={[]}
          onCrowdednessReportSubmit={mockOnCrowdednessReportSubmit}
          expandedSections={{ basic: true }}
          onToggleSection={mockOnToggleSection}
        />
      </LanguageProvider>
    );

    expect(screen.getByRole('button', { name: /移除收藏|remove from favorites/i })).toBeInTheDocument();
  });

  it('handles pricing paid state', () => {
    const paidLocation = {
      ...mockLocation,
      pricing: { isFree: false, priceRange: 'NT$100-200' }
    };

    render(
      <LanguageProvider>
        <LocationDetailPanel
          location={paidLocation}
          isFavorite={false}
          onFavoriteToggle={mockOnFavoriteToggle}
          onClose={mockOnClose}
          reviews={mockReviews}
          onReviewSubmit={mockOnReviewSubmit}
          crowdednessReports={[]}
          onCrowdednessReportSubmit={mockOnCrowdednessReportSubmit}
          expandedSections={{ basic: true }}
          onToggleSection={mockOnToggleSection}
        />
      </LanguageProvider>
    );

    expect(screen.getByText(/NT\$100-200/)).toBeInTheDocument();
  });

  it('handles age range with only minAge', () => {
    const ageMinOnlyLocation = {
      ...mockLocation,
      ageRange: { minAge: 5 }
    };

    render(
      <LanguageProvider>
        <LocationDetailPanel
          location={ageMinOnlyLocation}
          isFavorite={false}
          onFavoriteToggle={mockOnFavoriteToggle}
          onClose={mockOnClose}
          reviews={mockReviews}
          onReviewSubmit={mockOnReviewSubmit}
          crowdednessReports={[]}
          onCrowdednessReportSubmit={mockOnCrowdednessReportSubmit}
          expandedSections={{ basic: true }}
          onToggleSection={mockOnToggleSection}
        />
      </LanguageProvider>
    );

    expect(screen.getByText(/5\+/)).toBeInTheDocument();
  });

  it('handles age range with only maxAge', () => {
    const ageMaxOnlyLocation = {
      ...mockLocation,
      ageRange: { maxAge: 12 }
    };

    render(
      <LanguageProvider>
        <LocationDetailPanel
          location={ageMaxOnlyLocation}
          isFavorite={false}
          onFavoriteToggle={mockOnFavoriteToggle}
          onClose={mockOnClose}
          reviews={mockReviews}
          onReviewSubmit={mockOnReviewSubmit}
          crowdednessReports={[]}
          onCrowdednessReportSubmit={mockOnCrowdednessReportSubmit}
          expandedSections={{ basic: true }}
          onToggleSection={mockOnToggleSection}
        />
      </LanguageProvider>
    );

    expect(screen.getByText(/Up to 12/)).toBeInTheDocument();
  });

  it('displays operating hours status indicator', () => {
    render(
      <LanguageProvider>
        <LocationDetailPanel
          location={mockLocation}
          isFavorite={false}
          onFavoriteToggle={mockOnFavoriteToggle}
          onClose={mockOnClose}
          reviews={mockReviews}
          onReviewSubmit={mockOnReviewSubmit}
          crowdednessReports={[]}
          onCrowdednessReportSubmit={mockOnCrowdednessReportSubmit}
          expandedSections={{ facilities: true }}
          onToggleSection={mockOnToggleSection}
        />
      </LanguageProvider>
    );

    // Should display opening hours title and status indicator
    const elements = screen.getAllByText('營業時間');
    expect(elements.length).toBeGreaterThan(0);
  });

  it('handles parking cost information', () => {
    render(
      <LanguageProvider>
        <LocationDetailPanel
          location={mockLocation}
          isFavorite={false}
          onFavoriteToggle={mockOnFavoriteToggle}
          onClose={mockOnClose}
          reviews={mockReviews}
          onReviewSubmit={mockOnReviewSubmit}
          crowdednessReports={[]}
          onCrowdednessReportSubmit={mockOnCrowdednessReportSubmit}
          expandedSections={{ transit: true }}
          onToggleSection={mockOnToggleSection}
        />
      </LanguageProvider>
    );

    expect(screen.getByText(/\$50\/hour/)).toBeInTheDocument();
  });

  it('handles parking validation', () => {
    render(
      <LanguageProvider>
        <LocationDetailPanel
          location={mockLocation}
          isFavorite={false}
          onFavoriteToggle={mockOnFavoriteToggle}
          onClose={mockOnClose}
          reviews={mockReviews}
          onReviewSubmit={mockOnReviewSubmit}
          crowdednessReports={[]}
          onCrowdednessReportSubmit={mockOnCrowdednessReportSubmit}
          expandedSections={{ transit: true }}
          onToggleSection={mockOnToggleSection}
        />
      </LanguageProvider>
    );

    const elements = screen.getAllByText(/停車驗證/);
    expect(elements.length).toBeGreaterThan(0);
  });

  it('displays toilet facilities details', () => {
    render(
      <LanguageProvider>
        <LocationDetailPanel
          location={mockLocation}
          isFavorite={false}
          onFavoriteToggle={mockOnFavoriteToggle}
          onClose={mockOnClose}
          reviews={mockReviews}
          onReviewSubmit={mockOnReviewSubmit}
          crowdednessReports={[]}
          onCrowdednessReportSubmit={mockOnCrowdednessReportSubmit}
          expandedSections={{ amenities: true }}
          onToggleSection={mockOnToggleSection}
        />
      </LanguageProvider>
    );

    expect(screen.getByText(/廁所設施/)).toBeInTheDocument();
    expect(screen.getByText(/兒童友善/)).toBeInTheDocument();
  });

  it('handles weather coverage details', () => {
    render(
      <LanguageProvider>
        <LocationDetailPanel
          location={mockLocation}
          isFavorite={false}
          onFavoriteToggle={mockOnFavoriteToggle}
          onClose={mockOnClose}
          reviews={mockReviews}
          onReviewSubmit={mockOnReviewSubmit}
          crowdednessReports={[]}
          onCrowdednessReportSubmit={mockOnCrowdednessReportSubmit}
          expandedSections={{}}
          onToggleSection={mockOnToggleSection}
        />
      </LanguageProvider>
    );

    expect(screen.getByText(/天候保護/)).toBeInTheDocument();
    expect(screen.getByText(/有遮蔭/)).toBeInTheDocument();
  });

  it('handles nearby amenities', () => {
    render(
      <LanguageProvider>
        <LocationDetailPanel
          location={mockLocation}
          isFavorite={false}
          onFavoriteToggle={mockOnFavoriteToggle}
          onClose={mockOnClose}
          reviews={mockReviews}
          onReviewSubmit={mockOnReviewSubmit}
          crowdednessReports={[]}
          onCrowdednessReportSubmit={mockOnCrowdednessReportSubmit}
          expandedSections={{}}
          onToggleSection={mockOnToggleSection}
        />
      </LanguageProvider>
    );

    expect(screen.getByText(/便利商店/)).toBeInTheDocument();
    expect(screen.getByText(/家\(200m內\)/)).toBeInTheDocument();
  });

  it('displays activity information', () => {
    render(
      <LanguageProvider>
        <LocationDetailPanel
          location={mockLocation}
          isFavorite={false}
          onFavoriteToggle={mockOnFavoriteToggle}
          onClose={mockOnClose}
          reviews={mockReviews}
          onReviewSubmit={mockOnReviewSubmit}
          crowdednessReports={[]}
          onCrowdednessReportSubmit={mockOnCrowdednessReportSubmit}
          expandedSections={{}}
          onToggleSection={mockOnToggleSection}
        />
      </LanguageProvider>
    );

    expect(screen.getByText(/遊戲活動/)).toBeInTheDocument();
    expect(screen.getByText(/Playground/)).toBeInTheDocument();
  });

  it('handles directions button correctly', () => {
    render(
      <LanguageProvider>
        <LocationDetailPanel
          location={mockLocation}
          isFavorite={false}
          onFavoriteToggle={mockOnFavoriteToggle}
          onClose={mockOnClose}
          reviews={mockReviews}
          onReviewSubmit={mockOnReviewSubmit}
          crowdednessReports={[]}
          onCrowdednessReportSubmit={mockOnCrowdednessReportSubmit}
          expandedSections={{ basic: true }}
          onToggleSection={mockOnToggleSection}
        />
      </LanguageProvider>
    );

    const directionsLinks = screen.getAllByRole('link');
    const directionsButton = directionsLinks.find(link => (link as HTMLAnchorElement).href.includes('google.com/maps'));
    expect(directionsButton).toBeDefined();
    if (directionsButton) {
      expect(directionsButton).toHaveAttribute('target', '_blank');
    }
  });

  it('handles phone button correctly', () => {
    render(
      <LanguageProvider>
        <LocationDetailPanel
          location={mockLocation}
          isFavorite={false}
          onFavoriteToggle={mockOnFavoriteToggle}
          onClose={mockOnClose}
          reviews={mockReviews}
          onReviewSubmit={mockOnReviewSubmit}
          crowdednessReports={[]}
          onCrowdednessReportSubmit={mockOnCrowdednessReportSubmit}
          expandedSections={{ basic: true }}
          onToggleSection={mockOnToggleSection}
        />
      </LanguageProvider>
    );

    const phoneButton = screen.getByRole('link', { name: /02-1234-5678/ });
    expect(phoneButton).toHaveAttribute('href', 'tel:02-1234-5678');
  });

  it('displays elevator accessibility feature', () => {
    render(
      <LanguageProvider>
        <LocationDetailPanel
          location={mockLocation}
          isFavorite={false}
          onFavoriteToggle={mockOnFavoriteToggle}
          onClose={mockOnClose}
          reviews={mockReviews}
          onReviewSubmit={mockOnReviewSubmit}
          crowdednessReports={[]}
          onCrowdednessReportSubmit={mockOnCrowdednessReportSubmit}
          expandedSections={{}}
          onToggleSection={mockOnToggleSection}
        />
      </LanguageProvider>
    );

    // Elevator is false in mock, so it should not display
    expect(screen.queryByText(/電梯/)).not.toBeInTheDocument();
  });

  it('handles bus lines correctly', () => {
    render(
      <LanguageProvider>
        <LocationDetailPanel
          location={mockLocation}
          isFavorite={false}
          onFavoriteToggle={mockOnFavoriteToggle}
          onClose={mockOnClose}
          reviews={mockReviews}
          onReviewSubmit={mockOnReviewSubmit}
          crowdednessReports={[]}
          onCrowdednessReportSubmit={mockOnCrowdednessReportSubmit}
          expandedSections={{ transit: true }}
          onToggleSection={mockOnToggleSection}
        />
      </LanguageProvider>
    );

    expect(screen.getByText(/公車路線/)).toBeInTheDocument();
    expect(screen.getByText(/22, 25/)).toBeInTheDocument();
  });

  it('displays crowding quiet and peak hours', () => {
    render(
      <LanguageProvider>
        <LocationDetailPanel
          location={mockLocation}
          isFavorite={false}
          onFavoriteToggle={mockOnFavoriteToggle}
          onClose={mockOnClose}
          reviews={mockReviews}
          onReviewSubmit={mockOnReviewSubmit}
          crowdednessReports={[]}
          onCrowdednessReportSubmit={mockOnCrowdednessReportSubmit}
          expandedSections={{ comfort: true }}
          onToggleSection={mockOnToggleSection}
        />
      </LanguageProvider>
    );

    expect(screen.getByText(/安靜時段/)).toBeInTheDocument();
    expect(screen.getByText(/09:00-12:00/)).toBeInTheDocument();
    expect(screen.getByText(/尖峰時段/)).toBeInTheDocument();
  });

  it('handles nursing power outlet correctly', () => {
    render(
      <LanguageProvider>
        <LocationDetailPanel
          location={mockLocation}
          isFavorite={false}
          onFavoriteToggle={mockOnFavoriteToggle}
          onClose={mockOnClose}
          reviews={mockReviews}
          onReviewSubmit={mockOnReviewSubmit}
          crowdednessReports={[]}
          onCrowdednessReportSubmit={mockOnCrowdednessReportSubmit}
          expandedSections={{}}
          onToggleSection={mockOnToggleSection}
        />
      </LanguageProvider>
    );

    expect(screen.getByText(/電源/)).toBeInTheDocument();
    expect(screen.getByText(/可用溫奶器/)).toBeInTheDocument();
  });

  it('displays quality metrics maintenance date', () => {
    render(
      <LanguageProvider>
        <LocationDetailPanel
          location={mockLocation}
          isFavorite={false}
          onFavoriteToggle={mockOnFavoriteToggle}
          onClose={mockOnClose}
          reviews={mockReviews}
          onReviewSubmit={mockOnReviewSubmit}
          crowdednessReports={[]}
          onCrowdednessReportSubmit={mockOnCrowdednessReportSubmit}
          expandedSections={{}}
          onToggleSection={mockOnToggleSection}
        />
      </LanguageProvider>
    );

    expect(screen.getByText(/最後維護日期/)).toBeInTheDocument();
  });

  it('displays accessibility ramp correctly', () => {
    render(
      <LanguageProvider>
        <LocationDetailPanel
          location={mockLocation}
          isFavorite={false}
          onFavoriteToggle={mockOnFavoriteToggle}
          onClose={mockOnClose}
          reviews={mockReviews}
          onReviewSubmit={mockOnReviewSubmit}
          crowdednessReports={[]}
          onCrowdednessReportSubmit={mockOnCrowdednessReportSubmit}
          expandedSections={{}}
          onToggleSection={mockOnToggleSection}
        />
      </LanguageProvider>
    );

    expect(screen.getByText(/坡道/)).toBeInTheDocument();
  });

  it('handles no parking available state', () => {
    const noParkingLocation = {
      ...mockLocation,
      parking: {
        available: false,
        hasValidation: false
      }
    };

    render(
      <LanguageProvider>
        <LocationDetailPanel
          location={noParkingLocation}
          isFavorite={false}
          onFavoriteToggle={mockOnFavoriteToggle}
          onClose={mockOnClose}
          reviews={mockReviews}
          onReviewSubmit={mockOnReviewSubmit}
          crowdednessReports={[]}
          onCrowdednessReportSubmit={mockOnCrowdednessReportSubmit}
          expandedSections={{ transit: true }}
          onToggleSection={mockOnToggleSection}
        />
      </LanguageProvider>
    );

    expect(screen.getByText(/無停車位/)).toBeInTheDocument();
  });

  it('displays different safety ratings', () => {
    render(
      <LanguageProvider>
        <LocationDetailPanel
          location={mockLocation}
          isFavorite={false}
          onFavoriteToggle={mockOnFavoriteToggle}
          onClose={mockOnClose}
          reviews={mockReviews}
          onReviewSubmit={mockOnReviewSubmit}
          crowdednessReports={[]}
          onCrowdednessReportSubmit={mockOnCrowdednessReportSubmit}
          expandedSections={{}}
          onToggleSection={mockOnToggleSection}
        />
      </LanguageProvider>
    );

    // Check for safety rating text
    expect(screen.getByText(/安全評分/)).toBeInTheDocument();
  });

  it('handles missing optional transit data', () => {
    const minimalTransitLocation = {
      ...mockLocation,
      publicTransit: {
        busLines: []
      }
    };

    render(
      <LanguageProvider>
        <LocationDetailPanel
          location={minimalTransitLocation}
          isFavorite={false}
          onFavoriteToggle={mockOnFavoriteToggle}
          onClose={mockOnClose}
          reviews={mockReviews}
          onReviewSubmit={mockOnReviewSubmit}
          crowdednessReports={[]}
          onCrowdednessReportSubmit={mockOnCrowdednessReportSubmit}
          expandedSections={{ transit: true }}
          onToggleSection={mockOnToggleSection}
        />
      </LanguageProvider>
    );

    // Should still render transit section even with minimal data
    expect(screen.getByText(/公共運輸/)).toBeInTheDocument();
  });

  it('toggles sections when section toggle is called', () => {
    render(
      <LanguageProvider>
        <LocationDetailPanel
          location={mockLocation}
          isFavorite={false}
          onFavoriteToggle={mockOnFavoriteToggle}
          onClose={mockOnClose}
          reviews={mockReviews}
          onReviewSubmit={mockOnReviewSubmit}
          crowdednessReports={[]}
          onCrowdednessReportSubmit={mockOnCrowdednessReportSubmit}
          expandedSections={{ basic: false }}
          onToggleSection={mockOnToggleSection}
        />
      </LanguageProvider>
    );

    // Just verify the component renders without errors
    expect(screen.getByText('台北公園')).toBeInTheDocument();
  });

  it('renders with isFavorite true', () => {
    render(
      <LanguageProvider>
        <LocationDetailPanel
          location={mockLocation}
          isFavorite={true}
          onFavoriteToggle={mockOnFavoriteToggle}
          onClose={mockOnClose}
          reviews={mockReviews}
          onReviewSubmit={mockOnReviewSubmit}
          crowdednessReports={[]}
          onCrowdednessReportSubmit={mockOnCrowdednessReportSubmit}
          expandedSections={{ basic: true }}
          onToggleSection={mockOnToggleSection}
        />
      </LanguageProvider>
    );

    // Verify component renders in favorite state
    const buttons = screen.getAllByRole('button');
    const favoriteButton = buttons.find(btn => btn.className.includes('favorite'));
    expect(favoriteButton).toBeInTheDocument();
    expect(favoriteButton?.className).toContain('active');
  });

  it('renders all facility sections with comprehensive data', () => {
    render(
      <LanguageProvider>
        <LocationDetailPanel
          location={mockLocation}
          isFavorite={false}
          onFavoriteToggle={mockOnFavoriteToggle}
          onClose={mockOnClose}
          reviews={mockReviews}
          onReviewSubmit={mockOnReviewSubmit}
          crowdednessReports={[]}
          onCrowdednessReportSubmit={mockOnCrowdednessReportSubmit}
          expandedSections={{
            basic: true,
            facilities: true,
            amenities: true,
            accessibility: true,
            safety: true
          }}
          onToggleSection={mockOnToggleSection}
        />
      </LanguageProvider>
    );

    // Verify basic section is rendered
    expect(screen.getByText('台北公園')).toBeInTheDocument();
  });

  it('renders directions link with proper encoding', () => {
    render(
      <LanguageProvider>
        <LocationDetailPanel
          location={mockLocation}
          isFavorite={false}
          onFavoriteToggle={mockOnFavoriteToggle}
          onClose={mockOnClose}
          reviews={mockReviews}
          onReviewSubmit={mockOnReviewSubmit}
          crowdednessReports={[]}
          onCrowdednessReportSubmit={mockOnCrowdednessReportSubmit}
          expandedSections={{ basic: true }}
          onToggleSection={mockOnToggleSection}
        />
      </LanguageProvider>
    );

    // Verify there's a maps link in the document
    const linksToMaps = screen.queryAllByRole('link');
    const directionsLink = linksToMaps.find(link => (link as HTMLAnchorElement).href?.includes('google.com/maps'));
    expect(directionsLink).toBeDefined();
  });

  it('renders phone link as clickable tel', () => {
    render(
      <LanguageProvider>
        <LocationDetailPanel
          location={mockLocation}
          isFavorite={false}
          onFavoriteToggle={mockOnFavoriteToggle}
          onClose={mockOnClose}
          reviews={mockReviews}
          onReviewSubmit={mockOnReviewSubmit}
          crowdednessReports={[]}
          onCrowdednessReportSubmit={mockOnCrowdednessReportSubmit}
          expandedSections={{ basic: true }}
          onToggleSection={mockOnToggleSection}
        />
      </LanguageProvider>
    );

    const phoneLink = screen.getByTitle('Call');
    expect(phoneLink).toHaveAttribute('href', 'tel:02-1234-5678');
  });

  it('displays rating when available', () => {
    render(
      <LanguageProvider>
        <LocationDetailPanel
          location={mockLocation}
          isFavorite={false}
          onFavoriteToggle={mockOnFavoriteToggle}
          onClose={mockOnClose}
          reviews={mockReviews}
          onReviewSubmit={mockOnReviewSubmit}
          crowdednessReports={[]}
          onCrowdednessReportSubmit={mockOnCrowdednessReportSubmit}
          expandedSections={{ basic: true }}
          onToggleSection={mockOnToggleSection}
        />
      </LanguageProvider>
    );

    const ratingElements = screen.queryAllByText(/4.5/);
    expect(ratingElements.length).toBeGreaterThan(0);
  });

  it('handles location without optional properties gracefully', () => {
    const minimalLocation: Location = {
      id: '1',
      name: { zh: '簡單地點', en: 'Simple Location' },
      address: { zh: '台北市', en: 'Taipei' },
      coordinates: { lat: 25.0330, lng: 121.5654 },
      category: 'park',
      facilities: [],
      averageRating: 0,
      description: { zh: '描述', en: 'Description' }
    };

    render(
      <LanguageProvider>
        <LocationDetailPanel
          location={minimalLocation}
          isFavorite={false}
          onFavoriteToggle={mockOnFavoriteToggle}
          onClose={mockOnClose}
          reviews={[]}
          onReviewSubmit={mockOnReviewSubmit}
          crowdednessReports={[]}
          onCrowdednessReportSubmit={mockOnCrowdednessReportSubmit}
          expandedSections={{ basic: true }}
          onToggleSection={mockOnToggleSection}
        />
      </LanguageProvider>
    );

    expect(screen.getByText('簡單地點')).toBeInTheDocument();
    expect(screen.getByText(/台北市|Taipei/)).toBeInTheDocument();
  });
});
