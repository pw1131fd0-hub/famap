import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from '../App.tsx';
import { LanguageProvider } from '../i18n/LanguageContext.tsx';

describe('App', () => {
  it('renders the map and sidebar', () => {
    render(
      <LanguageProvider>
        <App />
      </LanguageProvider>
    );
    // Daan Forest Park should be in the initial mock data or rendered somehow
    // Let's check for "FamMap" logo or something
    expect(screen.getByText(/FamMap/i)).toBeInTheDocument();
  });

  it('switches language when language button is clicked', () => {
    render(
      <LanguageProvider>
        <App />
      </LanguageProvider>
    );
    const langButton = screen.getByTitle(/Switch Language/i);
    // Initial is zh, so button shows 'EN'
    expect(screen.getByText('EN')).toBeInTheDocument();
    
    fireEvent.click(langButton);
    // Now is en, so button shows '中'
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
});
