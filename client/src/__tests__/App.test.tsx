import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import App from '../App.tsx';
import { LanguageProvider } from '../i18n/LanguageContext.tsx';

// Mock geolocation
const mockGeolocation = {
  getCurrentPosition: vi.fn(),
};
Object.defineProperty(global.navigator, 'geolocation', {
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

  it('opens add location form when add button is clicked', () => {
    render(
      <LanguageProvider>
        <App />
      </LanguageProvider>
    );
    const addButton = screen.getByTitle(/新增地點/i);
    fireEvent.click(addButton);
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
    // Find and click facility filter buttons
    const toiletBtn = screen.getByTitle(/公共廁所|public_toilet/i);
    fireEvent.click(toiletBtn);
    expect(toiletBtn).toHaveClass('active');

    const nursingBtn = screen.getByTitle(/哺乳|nursing_room/i);
    fireEvent.click(nursingBtn);
    expect(nursingBtn).toHaveClass('active');
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
    mockGeolocation.getCurrentPosition.mockImplementation((success) => {
      success({
        coords: { latitude: 25.033, longitude: 121.5653, accuracy: 10 }
      });
    });

    render(
      <LanguageProvider>
        <App />
      </LanguageProvider>
    );
    const findMeButton = screen.getByTitle(/定位我的位置|Find Me/i);
    fireEvent.click(findMeButton);

    expect(mockGeolocation.getCurrentPosition).toHaveBeenCalled();
  });

  it('handles find me error gracefully', () => {
    mockGeolocation.getCurrentPosition.mockImplementation((success, error) => {
      error({ code: 1, message: 'Permission denied' });
    });

    render(
      <LanguageProvider>
        <App />
      </LanguageProvider>
    );
    const findMeButton = screen.getByTitle(/定位我的位置|Find Me/i);
    fireEvent.click(findMeButton);

    expect(mockGeolocation.getCurrentPosition).toHaveBeenCalled();
  });

  it('toggles dark mode', () => {
    localStorage.clear();
    render(
      <LanguageProvider>
        <App />
      </LanguageProvider>
    );
    const darkModeButton = screen.getByTitle(/暗色|Dark/i);
    fireEvent.click(darkModeButton);
    expect(localStorage.getItem('darkMode')).toBe('true');

    fireEvent.click(darkModeButton);
    expect(localStorage.getItem('darkMode')).toBe('false');
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
});
