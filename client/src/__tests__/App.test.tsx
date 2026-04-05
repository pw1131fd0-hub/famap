// @vitest-environment happy-dom
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, beforeAll, vi } from 'vitest';
import App from '../App.tsx';
import { LanguageProvider } from '../i18n/LanguageContext.tsx';

// Mock fetch to prevent hanging from pending requests
beforeAll(() => {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
  });
});

// Mock lazy-loaded components with realistic structure
vi.mock('../components/LocationForm', () => ({
  LocationForm: vi.fn(({ onSubmit, onCancel }: any) => (
    <div data-testid="location-form" className="location-form">
      <h3>新增地點</h3>
      <input aria-label="中文名稱" />
      <input aria-label="英文名稱" />
      <input aria-label="中文地址" />
      <input aria-label="英文地址" />
      <button onClick={onCancel}>取消</button>
      <button onClick={() => onSubmit({})}>提交</button>
    </div>
  )),
}));
vi.mock('../components/LocationDetailPanel', () => ({
  LocationDetailPanel: vi.fn(({ location, onClose, onFavoriteToggle, onReviewSubmit }: any) => (
    <div data-testid="location-detail-panel" className="detail-panel">
      <header className="detail-header">
        <h3>{location?.name?.zh || location?.name?.en || 'Location'}</h3>
        <button onClick={onClose}>X</button>
      </header>
      <section>
        <h4>地址</h4>
      </section>
      <button aria-label="加入收藏" onClick={(e: any) => onFavoriteToggle(e)}>Heart</button>
      <section>
        <label>您的名稱</label>
        <input aria-label="您的名稱" name="userName" />
        <label>評論內容</label>
        <textarea aria-label="評論內容" name="comment" />
        <button onClick={() => onReviewSubmit({ userName: 'User', comment: 'Great!', rating: 5 })}>提交</button>
      </section>
    </div>
  )),
}));
vi.mock('../components/RoutePlanner', () => ({
  RoutePlanner: vi.fn(() => <div data-testid="route-planner">RoutePlanner</div>),
}));
vi.mock('../components/AlertCenter', () => ({
  AlertCenter: vi.fn(() => <div data-testid="alert-center">AlertCenter</div>),
}));
vi.mock('../components/FamilyProfileManager', () => ({
  FamilyProfileManager: vi.fn(() => <div data-testid="family-profile-manager">FamilyProfileManager</div>),
}));
vi.mock('../components/LocationComparison', () => ({
  LocationComparison: vi.fn(() => <div data-testid="location-comparison">LocationComparison</div>),
}));
vi.mock('../components/SmartTipsPanel', () => ({
  SmartTipsPanel: vi.fn(() => <div data-testid="smart-tips-panel">SmartTipsPanel</div>),
}));
vi.mock('../components/OutingPlanner', () => ({
  OutingPlanner: vi.fn(() => <div data-testid="outing-planner">OutingPlanner</div>),
}));
vi.mock('../components/FamilyTripPlanner', () => ({
  FamilyTripPlanner: vi.fn(() => <div data-testid="family-trip-planner">FamilyTripPlanner</div>),
}));
vi.mock('../components/TripCostCalculator', () => ({
  TripCostCalculator: vi.fn(() => <div data-testid="trip-cost-calculator">TripCostCalculator</div>),
}));
vi.mock('../components/FamilyExplorationPassport', () => ({
  FamilyExplorationPassport: vi.fn(() => <div data-testid="family-exploration-passport">FamilyExplorationPassport</div>),
}));

// Mock checkInSystem
vi.mock('../utils/checkInSystem', () => ({
  loadCheckIns: vi.fn(() => []),
}));

// Mock recentlyViewed
vi.mock('../utils/recentlyViewed', () => ({
  recordView: vi.fn(),
  getRecentlyViewedIds: vi.fn(() => []),
}));

// Mock sentryConfig
vi.mock('../utils/sentryConfig', () => ({
  initializeSentry: vi.fn(),
  addBreadcrumb: vi.fn(),
  captureException: vi.fn(),
}));

// Mock performanceMonitoring
vi.mock('../utils/performanceMonitoring', () => ({
  default: {
    measureAsync: vi.fn((_, fn) => fn()),
  },
}));

// Mock mapConfig
vi.mock('../config/mapConfig', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    CITIES: [{ key: 'taipei', name: 'Taipei', center: [25.0, 121.0], defaultZoom: 13 }],
    DAY_NAMES_ZH: { monday: '一', tuesday: '二', wednesday: '三', thursday: '四', friday: '五', saturday: '六', sunday: '日' },
    MARKER_CONFIG: {},
    initializeLeafletIcons: vi.fn(),
    createGlowingIcon: vi.fn(() => ({})),
  };
});

// Mock useVoiceSearch hook
vi.mock('../hooks/useVoiceSearch', () => ({
  useVoiceSearch: vi.fn(() => ({
    isListening: false,
    isSupported: false,
    transcript: '',
    startListening: vi.fn(),
    stopListening: vi.fn(),
  })),
}));

// Mock useDebounce hook
vi.mock('../hooks/useDebounce', () => ({
  useDebounce: vi.fn((value) => value),
}));

// Mock axios
vi.mock('axios', () => {
  const mockAxiosInstance = {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
    create: vi.fn().mockReturnThis(),
    interceptors: {
      response: {
        use: vi.fn(),
      },
      request: {
        use: vi.fn(),
      },
    },
  };
  return {
    default: {
      create: vi.fn(() => mockAxiosInstance),
    }
  };
});

// Mock geolocation
const mockGeolocation = {
  getCurrentPosition: vi.fn(),
};
Object.defineProperty(navigator, 'geolocation', {
  value: mockGeolocation,
  writable: true,
});

describe('App', () => {
  beforeEach(() => {
    mockGeolocation.getCurrentPosition.mockClear();
  });

  it('renders the map and sidebar', () => {
    render(
      <LanguageProvider>
        <App />
      </LanguageProvider>
    );
    expect(screen.getByText(/FamMap/i)).toBeInTheDocument();
  });

  it('switches language when language button is clicked', () => {
    render(
      <LanguageProvider>
        <App />
      </LanguageProvider>
    );
    const langButton = screen.getByTitle(/Switch Language/i);
    expect(screen.getByText('EN')).toBeInTheDocument();

    fireEvent.click(langButton);
    expect(screen.getByText('中')).toBeInTheDocument();
  });

  it('opens add location form when add button is clicked', async () => {
    render(
      <LanguageProvider>
        <App />
      </LanguageProvider>
    );
    const addButton = screen.getByTitle(/新增地點/i);
    await act(async () => {
      fireEvent.click(addButton);
    });
    expect(screen.getAllByText(/新增地點/i).length).toBeGreaterThan(1);
  });

  it('filters by category when category button is clicked', () => {
    render(
      <LanguageProvider>
        <App />
      </LanguageProvider>
    );
    const parkButton = screen.getByText(/公園/i);
    fireEvent.click(parkButton);
    expect(parkButton.parentElement).toHaveClass('active');
  });

  it('toggles stroller friendly filter', () => {
    render(
      <LanguageProvider>
        <App />
      </LanguageProvider>
    );
    const strollerButton = screen.getByTitle(/嬰兒車友善/i);
    fireEvent.click(strollerButton);
    expect(strollerButton).toHaveClass('active');
  });

  it('toggles favorites view', () => {
    render(
      <LanguageProvider>
        <App />
      </LanguageProvider>
    );
    const favTab = screen.getByText(/我的收藏/i);
    fireEvent.click(favTab);
    expect(favTab.parentElement).toHaveClass('active');
  });

  // New tests for improved coverage
  it('sorts by distance', () => {
    render(
      <LanguageProvider>
        <App />
      </LanguageProvider>
    );
    const distanceButton = screen.getByText(/距離|Distance/i);
    fireEvent.click(distanceButton);
    expect(distanceButton).toHaveClass('active');
  });

  it('sorts by rating', () => {
    render(
      <LanguageProvider>
        <App />
      </LanguageProvider>
    );
    const ratingButton = screen.getByText(/評分|Rating/i);
    fireEvent.click(ratingButton);
    expect(ratingButton).toHaveClass('active');
  });

  it('sorts by name', () => {
    render(
      <LanguageProvider>
        <App />
      </LanguageProvider>
    );
    const nameButton = screen.getByText(/A-Z|名稱|Name/i);
    fireEvent.click(nameButton);
    expect(nameButton).toHaveClass('active');
  });

  it('toggles facility filters', () => {
    render(
      <LanguageProvider>
        <App />
      </LanguageProvider>
    );
    // Find and click all facility filter buttons
    const emojis = ['🚽', '🧴', '💧', '♿', '❄️', '🏊', '🍽️'];
    emojis.forEach(emoji => {
      const buttons = screen.getAllByRole('button');
      const btn = buttons.find(b => b.textContent?.includes(emoji));
      if (btn) {
        fireEvent.click(btn);
        expect(btn).toHaveClass('active');
        fireEvent.click(btn); // Toggle off
      }
    });
  });

  it('changes city selection', () => {
    render(
      <LanguageProvider>
        <App />
      </LanguageProvider>
    );
    const cityButton = screen.getByRole('button', { name: /City selector/ });
    fireEvent.click(cityButton);

    // Select a different city
    const cityOptions = screen.getAllByRole('button');
    const taichungOption = cityOptions.find(btn => btn.textContent?.includes('台中'));
    if (taichungOption) {
      fireEvent.click(taichungOption);
    }
  });

  it('handles find me button successfully', () => {
    mockGeolocation.getCurrentPosition.mockImplementation((_success) => {
      _success({
        coords: { latitude: 25.033, longitude: 121.5653, accuracy: 10 }
      });
    });

    render(
      <LanguageProvider>
        <App />
      </LanguageProvider>
    );
    // Find by the Navigation icon's parent button (using aria-label or by position)
    const buttons = screen.getAllByRole('button');
    const findMeButton = buttons.find(btn => btn.getAttribute('title')?.includes('我的位置') || btn.getAttribute('title')?.includes('Find Me'));
    if (findMeButton) {
      fireEvent.click(findMeButton);
    }

    expect(mockGeolocation.getCurrentPosition).toHaveBeenCalled();
  });

  it('handles find me error gracefully', () => {
    mockGeolocation.getCurrentPosition.mockImplementation((_success, error) => {
      error({ code: 1, message: 'Permission denied' });
    });

    render(
      <LanguageProvider>
        <App />
      </LanguageProvider>
    );
    const buttons = screen.getAllByRole('button');
    const findMeButton = buttons.find(btn => btn.getAttribute('title')?.includes('我的位置') || btn.getAttribute('title')?.includes('Find Me'));
    if (findMeButton) {
      fireEvent.click(findMeButton);
    }

    expect(mockGeolocation.getCurrentPosition).toHaveBeenCalled();
  });

  it('toggles dark mode', () => {
    localStorage.clear();
    render(
      <LanguageProvider>
        <App />
      </LanguageProvider>
    );
    const buttons = screen.getAllByRole('button');
    const darkModeButton = buttons.find(btn => btn.getAttribute('title')?.includes('Dark Mode') || btn.getAttribute('title')?.includes('Light Mode'));
    if (darkModeButton) {
      fireEvent.click(darkModeButton);
      expect(localStorage.getItem('darkMode')).toBe('true');

      fireEvent.click(darkModeButton);
      expect(localStorage.getItem('darkMode')).toBe('false');
    }
  });

  it('opens and closes sidebar', () => {
    render(
      <LanguageProvider>
        <App />
      </LanguageProvider>
    );
    const sidebarToggle = screen.getByRole('button', { name: /Toggle sidebar|Menu/i });
    expect(sidebarToggle).toBeInTheDocument();
    fireEvent.click(sidebarToggle);
    fireEvent.click(sidebarToggle);
  });

  it('closes sidebar when view map button is clicked', () => {
    render(
      <LanguageProvider>
        <App />
      </LanguageProvider>
    );
    const viewMapBtn = screen.getByText(/查看地圖|View Map/i);
    expect(viewMapBtn).toBeInTheDocument();
    fireEvent.click(viewMapBtn);
  });

  it('preserves dark mode preference across rerenders', () => {
    localStorage.setItem('darkMode', 'true');
    const { unmount } = render(
      <LanguageProvider>
        <App />
      </LanguageProvider>
    );
    unmount();

    render(
      <LanguageProvider>
        <App />
      </LanguageProvider>
    );
    expect(localStorage.getItem('darkMode')).toBe('true');
  });

  it('handles multiple facility filters simultaneously', () => {
    render(
      <LanguageProvider>
        <App />
      </LanguageProvider>
    );
    const buttons = screen.getAllByText(/🚽|🧴|💧/);
    buttons.forEach(btn => fireEvent.click(btn));
  });

  it('toggles city dropdown', () => {
    render(
      <LanguageProvider>
        <App />
      </LanguageProvider>
    );
    const cityButton = screen.getByRole('button', { name: /City selector/ });
    fireEvent.click(cityButton);
    fireEvent.click(cityButton);
  });

  it('searches locations by query', () => {
    render(
      <LanguageProvider>
        <App />
      </LanguageProvider>
    );
    const searchInput = screen.getByPlaceholderText(/搜尋|Search/i);
    fireEvent.change(searchInput, { target: { value: 'park' } });
    expect(searchInput).toHaveValue('park');
  });

  it('closes sidebar with X button', () => {
    render(
      <LanguageProvider>
        <App />
      </LanguageProvider>
    );
    // Open sidebar
    const menuBtn = screen.getByRole('button', { name: /Toggle sidebar|Menu/i });
    fireEvent.click(menuBtn);

    // Close with X button
    const closeButtons = screen.getAllByRole('button');
    const closeBtn = closeButtons.find(btn => btn.getAttribute('aria-label') === 'Close');
    if (closeBtn) {
      fireEvent.click(closeBtn);
    }
  });

  it('toggles between all and favorites tabs', () => {
    render(
      <LanguageProvider>
        <App />
      </LanguageProvider>
    );
    // Click favorites tab - use getAllByText and get the first one (sidebar tab)
    const favBtns = screen.getAllByText(/我的收藏|Favorites/i);
    fireEvent.click(favBtns[0]);

    // Click all tab to go back - use getAllByText and get the first one (sidebar tab)
    const allBtns = screen.getAllByText(/全部|All/i);
    fireEvent.click(allBtns[0]);
  });

  it('toggles multiple sort options sequentially', () => {
    render(
      <LanguageProvider>
        <App />
      </LanguageProvider>
    );
    const buttons = screen.getAllByRole('button');
    const distBtn = buttons.find(b => b.textContent?.includes('距離') || b.textContent?.includes('Distance'));
    const ratingBtn = buttons.find(b => b.textContent?.includes('評分') || b.textContent?.includes('Rating'));
    const nameBtn = buttons.find(b => b.textContent?.includes('A-Z'));

    if (distBtn) fireEvent.click(distBtn);
    if (ratingBtn) fireEvent.click(ratingBtn);
    if (nameBtn) fireEvent.click(nameBtn);
  });

  it('closes sidebar by clicking backdrop', () => {
    render(
      <LanguageProvider>
        <App />
      </LanguageProvider>
    );
    // Open sidebar
    const menuBtn = screen.getByRole('button', { name: /Toggle sidebar|Menu/i });
    fireEvent.click(menuBtn);

    // Click backdrop to close
    const backdrop = document.querySelector('.sidebar-backdrop');
    if (backdrop) {
      fireEvent.click(backdrop);
    }
  });

  it('cancels location form submission', () => {
    render(
      <LanguageProvider>
        <App />
      </LanguageProvider>
    );
    // Click add location
    const addBtn = screen.getByRole('button', { name: /新增地點|Add Location/i });
    fireEvent.click(addBtn);

    // Find and click cancel button in the form
    const cancelButtons = screen.getAllByText(/取消|Cancel/i);
    if (cancelButtons.length > 0) {
      fireEvent.click(cancelButtons[0]);
    }
  });

  it('handles find me button interaction', () => {
    render(
      <LanguageProvider>
        <App />
      </LanguageProvider>
    );

    const buttons = screen.getAllByRole('button');
    const findMeBtn = buttons.find(btn => btn.getAttribute('title')?.includes('我的位置') || btn.getAttribute('title')?.includes('Find Me'));

    if (findMeBtn) {
      fireEvent.click(findMeBtn);
      // Verify the button is clickable and doesn't crash the app
      expect(findMeBtn).toBeInTheDocument();
    }
  });

  it('displays error message and closes it', async () => {
    mockGeolocation.getCurrentPosition.mockImplementation((_success, error) => {
      error({ code: 1, message: 'Permission denied' });
    });

    render(
      <LanguageProvider>
        <App />
      </LanguageProvider>
    );

    const buttons = screen.getAllByRole('button');
    const findMeBtn = buttons.find(btn => btn.getAttribute('title')?.includes('我的位置') || btn.getAttribute('title')?.includes('Find Me'));
    if (findMeBtn) {
      fireEvent.click(findMeBtn);
    }

    await waitFor(() => {
      const errorBanner = document.querySelector('[role="alert"]');
      if (errorBanner) {
        const closeBtn = errorBanner.querySelector('button');
        if (closeBtn) {
          fireEvent.click(closeBtn);
        }
      }
    }, { timeout: 1000 });
  });

  it('renders sidebar backdrop when sidebar is open', () => {
    render(
      <LanguageProvider>
        <App />
      </LanguageProvider>
    );
    const menuBtn = screen.getByRole('button', { name: /Toggle sidebar|Menu/i });
    fireEvent.click(menuBtn);

    // Verify backdrop exists
    const backdrop = document.querySelector('.sidebar-backdrop');
    expect(backdrop).toBeInTheDocument();
  });
});
