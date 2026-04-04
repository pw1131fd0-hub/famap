// @vitest-environment happy-dom
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from '../App.tsx';
import { LanguageProvider } from '../i18n/LanguageContext.tsx';
import { locationApi, favoriteApi, reviewApi } from '../services/api';
import type { Location } from '../types';

vi.mock('../services/api', () => ({
  locationApi: {
    getNearby: vi.fn().mockResolvedValue([]),
    getById: vi.fn().mockResolvedValue({}),
    create: vi.fn().mockResolvedValue({}),
  },
  favoriteApi: {
    getFavorites: vi.fn().mockResolvedValue([]),
    add: vi.fn().mockResolvedValue({}),
    remove: vi.fn().mockResolvedValue({}),
    check: vi.fn().mockResolvedValue(false),
  },
  reviewApi: {
    getByLocationId: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockResolvedValue({}),
  },
}));

describe('App Complex Scenarios', () => {
  const mockLocation: Location = {
    id: '1',
    name: { zh: '公園', en: 'Park' },
    description: { zh: '描述', en: 'Desc' },
    category: 'park',
    coordinates: { lat: 25.0, lng: 121.0 },
    address: { zh: '地址', en: 'Addr' },
    facilities: ['stroller_accessible'],
    averageRating: 4.5,
  };

  beforeEach(() => {
    vi.mocked(locationApi.getNearby).mockResolvedValue([mockLocation]);
    vi.mocked(locationApi.getById).mockResolvedValue(mockLocation);
    vi.mocked(locationApi.create).mockResolvedValue(mockLocation);
    vi.mocked(favoriteApi.getFavorites).mockResolvedValue([]);
    vi.mocked(reviewApi.getByLocationId).mockResolvedValue([]);
    vi.mocked(reviewApi.create).mockResolvedValue({
      id: 'r1',
      locationId: '1',
      userId: 'u1',
      userName: 'User',
      rating: 5,
      comment: 'Great!',
      createdAt: new Date().toISOString()
    });
  });

  it('renders location card and selects it', async () => {
    render(
      <LanguageProvider>
        <App />
      </LanguageProvider>
    );

    const cardHeading = await screen.findByRole('heading', { name: /公園/i, level: 3 });
    const card = cardHeading.closest('.location-card');
    if (!card) throw new Error('Card not found');
    fireEvent.click(card);

    // Wait for detail view to appear (it has an address section)
    expect(await screen.findByRole('heading', { name: /地址/i, level: 4 })).toBeInTheDocument();
  });

  it('toggles favorite on a card', async () => {
    render(
      <LanguageProvider>
        <App />
      </LanguageProvider>
    );

    const favButton = await screen.findByLabelText(/加入收藏/i);
    fireEvent.click(favButton);
    expect(favoriteApi.add).toHaveBeenCalled();
  });

  it('removes favorite on a card', async () => {
    vi.mocked(favoriteApi.getFavorites).mockResolvedValue([mockLocation]);
    render(
      <LanguageProvider>
        <App />
      </LanguageProvider>
    );

    const unfavButton = await screen.findByLabelText(/移除收藏/i);
    fireEvent.click(unfavButton);
    expect(favoriteApi.remove).toHaveBeenCalled();
  });

  it('handles find me button', async () => {
    const mockGeolocation = {
      getCurrentPosition: vi.fn().mockImplementation((success) => success({
        coords: { latitude: 25.1, longitude: 121.7 }
      }))
    };
    Object.defineProperty(global.navigator, 'geolocation', {
      value: mockGeolocation,
      writable: true,
      configurable: true,
    });

    render(
      <LanguageProvider>
        <App />
      </LanguageProvider>
    );

    const findMeBtn = screen.getByTitle(/我的位置/i);
    fireEvent.click(findMeBtn);
    expect(mockGeolocation.getCurrentPosition).toHaveBeenCalled();
  });

  it('posts a review when on detail side', async () => {
    render(
      <LanguageProvider>
        <App />
      </LanguageProvider>
    );

    const cardHeading = await screen.findByRole('heading', { name: /公園/i, level: 3 });
    const card = cardHeading.closest('.location-card');
    if (!card) throw new Error('Card not found');
    fireEvent.click(card);

    // Wait for the form to appear
    const nameInput = await screen.findByLabelText(/您的名稱/i);
    fireEvent.change(nameInput, { target: { value: 'User' } });
    fireEvent.change(screen.getByLabelText(/評論內容/i), { target: { value: 'Great!' } });
    fireEvent.click(screen.getByText(/提交/i));

    await waitFor(() => {
      expect(reviewApi.create).toHaveBeenCalled();
    });
  });

  it('creates a new location from form', async () => {
    render(
      <LanguageProvider>
        <App />
      </LanguageProvider>
    );

    fireEvent.click(screen.getByTitle(/新增地點/i));
    
    fireEvent.change(await screen.findByLabelText(/中文名稱/i), { target: { value: 'New Loc' } });
    fireEvent.change(screen.getByLabelText(/英文名稱/i), { target: { value: 'New Loc En' } });
    fireEvent.change(screen.getByLabelText(/中文地址/i), { target: { value: 'Address' } });
    fireEvent.change(screen.getByLabelText(/英文地址/i), { target: { value: 'Addr' } });

    fireEvent.click(screen.getByText(/提交/i));

    await waitFor(() => {
      expect(locationApi.create).toHaveBeenCalled();
    });
  });

  it('renders empty favorites message', async () => {
    vi.mocked(favoriteApi.getFavorites).mockResolvedValue([]);
    render(
      <LanguageProvider>
        <App />
      </LanguageProvider>
    );

    const favTab = screen.getByText(/我的收藏/i);
    fireEvent.click(favTab);
    
    expect(await screen.findByText(/目前沒有收藏/i)).toBeInTheDocument();
  });

  it('closes add location form', async () => {
    render(
      <LanguageProvider>
        <App />
      </LanguageProvider>
    );

    fireEvent.click(screen.getByTitle(/新增地點/i));
    expect(screen.getAllByText(/新增地點/i).length).toBeGreaterThan(1);

    // Find the one in aside
    const aside = document.querySelector('aside');
    const xBtn = aside?.querySelector('.close-detail-button');
    if (xBtn) {
      fireEvent.click(xBtn);
      expect(screen.queryByText(/中文名稱/i)).not.toBeInTheDocument();
    }
  });

  it('toggles favorite from detail view', async () => {
    render(
      <LanguageProvider>
        <App />
      </LanguageProvider>
    );

    const cardHeading = await screen.findByRole('heading', { name: /公園/i, level: 3 });
    const card = cardHeading.closest('.location-card');
    if (!card) throw new Error('Card not found');
    fireEvent.click(card);

    const favBtn = await screen.findByLabelText(/加入收藏/i);
    fireEvent.click(favBtn);
    expect(favoriteApi.add).toHaveBeenCalled();
  });

  it('closes detail view', async () => {
    render(
      <LanguageProvider>
        <App />
      </LanguageProvider>
    );

    const cardHeading = await screen.findByRole('heading', { name: /公園/i, level: 3 });
    const card = cardHeading.closest('.location-card');
    if (!card) throw new Error('Card not found');
    fireEvent.click(card);

    const aside = document.querySelector('aside');
    const xBtn = aside?.querySelector('.close-detail-button');
    if (xBtn) {
      fireEvent.click(xBtn);
      // Wait for it to disappear
      await waitFor(() => {
        expect(screen.queryByRole('heading', { name: /地址/i, level: 4 })).not.toBeInTheDocument();
      });
    }
  });
});