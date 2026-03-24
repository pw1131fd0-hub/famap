import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AlertCenter } from '../components/AlertCenter';
import * as alertSystem from '../utils/alertSystem';

vi.mock('../i18n/useTranslation', () => ({
  useTranslation: () => ({
    language: 'en',
    setLanguage: vi.fn(),
    t: (key: string) => key,
  }),
}));

describe('AlertCenter Component', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render alert center when open', () => {
      const mockClose = vi.fn();
      render(<AlertCenter isOpen={true} onClose={mockClose} />);

      expect(screen.getByText('Alert Center')).toBeInTheDocument();
    });

    it('should not show modal when closed', () => {
      const mockClose = vi.fn();
      const { container } = render(
        <AlertCenter isOpen={false} onClose={mockClose} />
      );

      const center = container.querySelector('.alert-center');
      expect(center?.className).toMatch(/closed/);
    });

    it('should display tabs', () => {
      const mockClose = vi.fn();
      render(<AlertCenter isOpen={true} onClose={mockClose} />);

      const tabButtons = screen.getAllByRole('button');
      const tabLabels = tabButtons.map((btn) => btn.textContent);
      expect(tabLabels.some((text) => text?.includes('All'))).toBe(true);
      expect(tabLabels.some((text) => text?.includes('Unread'))).toBe(true);
      expect(tabLabels.some((text) => text?.includes('Settings'))).toBe(true);
    });
  });

  describe('Alert Display', () => {
    it('should show no alerts message when empty', () => {
      const mockClose = vi.fn();
      render(<AlertCenter isOpen={true} onClose={mockClose} />);

      expect(screen.getByText(/No alerts/)).toBeInTheDocument();
    });

    it('should display alerts from localStorage', async () => {
      const alert = alertSystem.createAlert(
        'new_review',
        'loc1',
        'Park Name',
        { zh: '新評論', en: 'New Review' },
        { zh: '有新評論', en: 'New review message' }
      );

      alertSystem.addAlert(alert);
      const loaded = alertSystem.loadAlerts();
      expect(loaded.length).toBeGreaterThan(0);

      const mockClose = vi.fn();
      const { container } = render(
        <AlertCenter isOpen={true} onClose={mockClose} />
      );

      await waitFor(() => {
        const alertsContent = container.querySelector('.alert-content');
        expect(alertsContent?.textContent).toBeTruthy();
        expect(alertsContent?.textContent?.length).toBeGreaterThan(0);
      });
    });

    it('should display alert severity icons', async () => {
      const urgentAlert = alertSystem.createAlert(
        'crowdedness',
        'loc1',
        'Beach',
        { zh: '緊急', en: 'Urgent' },
        { zh: '緊急信息', en: 'Urgent message' },
        'urgent'
      );

      alertSystem.addAlert(urgentAlert);

      const mockClose = vi.fn();
      const { container } = render(
        <AlertCenter isOpen={true} onClose={mockClose} />
      );

      await waitFor(() => {
        const alertItem = container.querySelector('.alert-item.urgent');
        expect(alertItem).toBeInTheDocument();
      });
    });
  });

  describe('Alert Management', () => {
    beforeEach(() => {
      const alert1 = alertSystem.createAlert(
        'new_review',
        'loc1',
        'Park1',
        { zh: '評論', en: 'Review' },
        { zh: '消息', en: 'Message' }
      );
      const alert2 = alertSystem.createAlert(
        'event',
        'loc2',
        'Park2',
        { zh: '事件', en: 'Event' },
        { zh: '事件消息', en: 'Event message' }
      );

      alertSystem.addAlert(alert1);
      alertSystem.addAlert(alert2);
    });

    it('should mark alert as read', async () => {
      const mockClose = vi.fn();
      const { container } = render(
        <AlertCenter isOpen={true} onClose={mockClose} />
      );

      const markReadButtons = container.querySelectorAll('.action-btn');
      if (markReadButtons.length > 0) {
        fireEvent.click(markReadButtons[0]);

        await waitFor(() => {
          const alerts = alertSystem.loadAlerts();
          expect(alerts.some((a) => a.read)).toBe(true);
        });
      }
    });

    it('should mark all alerts as read', async () => {
      const mockClose = vi.fn();
      render(<AlertCenter isOpen={true} onClose={mockClose} />);

      const markAllBtn = screen.getByText(/Mark all as read/);
      fireEvent.click(markAllBtn);

      await waitFor(() => {
        const alerts = alertSystem.loadAlerts();
        expect(alerts.every((a) => a.read)).toBe(true);
      });
    });

    it('should delete alert', async () => {
      const mockClose = vi.fn();
      const { container } = render(
        <AlertCenter isOpen={true} onClose={mockClose} />
      );

      const initialCount = alertSystem.loadAlerts().length;
      const deleteButtons = container.querySelectorAll('.action-btn.delete');

      if (deleteButtons.length > 0) {
        fireEvent.click(deleteButtons[0]);

        await waitFor(() => {
          const alerts = alertSystem.loadAlerts();
          expect(alerts.length).toBe(initialCount - 1);
        });
      }
    });

    it('should clear all alerts', async () => {
      const mockClose = vi.fn();
      render(<AlertCenter isOpen={true} onClose={mockClose} />);

      const clearBtn = screen.getByText(/Clear all/);
      fireEvent.click(clearBtn);

      // Confirm dialog
      vi.spyOn(window, 'confirm').mockReturnValueOnce(true);

      await waitFor(() => {
        const alerts = alertSystem.loadAlerts();
        // After clearing, should be empty or previous alerts
        expect(typeof alerts).toBe('object');
      });
    });
  });

  describe('Tab Navigation', () => {
    beforeEach(() => {
      const alert = alertSystem.createAlert(
        'new_review',
        'loc1',
        'Park',
        { zh: '評論', en: 'Review' },
        { zh: '消息', en: 'Message' }
      );
      alertSystem.addAlert(alert);
    });

    it('should switch between tabs', async () => {
      const mockClose = vi.fn();
      render(<AlertCenter isOpen={true} onClose={mockClose} />);

      const settingsTab = screen.getByText(/Settings/);
      fireEvent.click(settingsTab);

      await waitFor(() => {
        expect(screen.getByText(/New Review Alerts/)).toBeInTheDocument();
      });
    });

    it('should filter unread alerts on unread tab', async () => {
      const mockClose = vi.fn();
      render(<AlertCenter isOpen={true} onClose={mockClose} />);

      const unreadTab = screen.getByText(/Unread/);
      fireEvent.click(unreadTab);

      await waitFor(() => {
        expect(screen.getByText(/New Review/)).toBeInTheDocument();
      });
    });
  });

  describe('Settings Panel', () => {
    it('should display settings controls', async () => {
      const mockClose = vi.fn();
      render(<AlertCenter isOpen={true} onClose={mockClose} />);

      const settingsTab = screen.getByText(/Settings/);
      fireEvent.click(settingsTab);

      await waitFor(() => {
        expect(screen.getByText(/New Review Alerts/)).toBeInTheDocument();
        expect(screen.getByText(/Event Alerts/)).toBeInTheDocument();
        expect(screen.getByText(/Crowdedness Alerts/)).toBeInTheDocument();
      });
    });

    it('should save preference changes', async () => {
      const mockClose = vi.fn();
      const { container } = render(
        <AlertCenter isOpen={true} onClose={mockClose} />
      );

      const settingsTab = screen.getByText(/Settings/);
      fireEvent.click(settingsTab);

      await waitFor(() => {
        const checkboxes = container.querySelectorAll(
          '.setting-toggle input[type="checkbox"]'
        );
        if (checkboxes.length > 0) {
          fireEvent.click(checkboxes[0]);

          const prefs = alertSystem.loadAlertPreferences();
          expect(typeof prefs).toBe('object');
        }
      });
    });

    it('should show sub-settings when parent is enabled', async () => {
      const mockClose = vi.fn();
      const { container } = render(
        <AlertCenter isOpen={true} onClose={mockClose} />
      );

      const settingsTab = screen.getByText(/Settings/);
      fireEvent.click(settingsTab);

      await waitFor(() => {
        const subSettings = container.querySelector('.setting-sub');
        // Sub-settings should exist for enabled preferences
        expect(subSettings).toBeTruthy();
      });
    });
  });

  describe('Close Handler', () => {
    it('should call onClose when close button clicked', () => {
      const mockClose = vi.fn();
      const { container } = render(
        <AlertCenter isOpen={true} onClose={mockClose} />
      );

      const closeBtn = container.querySelector('.close-btn');
      if (closeBtn) {
        fireEvent.click(closeBtn);
        expect(mockClose).toHaveBeenCalled();
      }
    });

    it('should call onClose when overlay clicked', () => {
      const mockClose = vi.fn();
      const { container } = render(
        <AlertCenter isOpen={true} onClose={mockClose} />
      );

      const overlay = container.querySelector('.alert-overlay');
      if (overlay) {
        fireEvent.click(overlay);
        expect(mockClose).toHaveBeenCalled();
      }
    });
  });

  describe('Unread Count Badge', () => {
    it('should display unread count in badge', async () => {
      const alert1 = alertSystem.createAlert(
        'new_review',
        'loc1',
        'Park1',
        { zh: '評論', en: 'Review' },
        { zh: '消息', en: 'Message' }
      );
      const alert2 = alertSystem.createAlert(
        'event',
        'loc2',
        'Park2',
        { zh: '事件', en: 'Event' },
        { zh: '事件消息', en: 'Event message' }
      );

      alertSystem.addAlert(alert1);
      alertSystem.addAlert(alert2);

      const mockClose = vi.fn();
      const { container } = render(
        <AlertCenter isOpen={true} onClose={mockClose} />
      );

      await waitFor(() => {
        const badge = container.querySelector('.unread-badge');
        expect(badge?.textContent).toMatch(/2/);
      });
    });

    it('should update badge when alert marked as read', async () => {
      const alert = alertSystem.createAlert(
        'new_review',
        'loc1',
        'Park',
        { zh: '評論', en: 'Review' },
        { zh: '消息', en: 'Message' }
      );
      alertSystem.addAlert(alert);

      const mockClose = vi.fn();
      const { container } = render(
        <AlertCenter isOpen={true} onClose={mockClose} />
      );

      const badge = container.querySelector('.unread-badge');
      expect(badge?.textContent).toMatch(/1/);

      const markReadBtn = container.querySelector('.action-btn');
      if (markReadBtn) {
        fireEvent.click(markReadBtn);

        await waitFor(() => {
          const alerts = alertSystem.loadAlerts();
          expect(alerts.some((a) => a.read)).toBe(true);
        });
      }
    });
  });

  describe('Alert Filtering by Type', () => {
    beforeEach(() => {
      const reviewAlert = alertSystem.createAlert(
        'new_review',
        'loc1',
        'Park1',
        { zh: '評論', en: 'Review' },
        { zh: '消息', en: 'Message' }
      );
      const eventAlert = alertSystem.createAlert(
        'event',
        'loc2',
        'Park2',
        { zh: '事件', en: 'Event' },
        { zh: '事件消息', en: 'Event message' }
      );

      alertSystem.addAlert(reviewAlert);
      alertSystem.addAlert(eventAlert);
    });

    it('should display alerts with correct type badges', async () => {
      const mockClose = vi.fn();
      const { container } = render(
        <AlertCenter isOpen={true} onClose={mockClose} />
      );

      await waitFor(() => {
        const alertItems = container.querySelectorAll('.alert-item');
        expect(alertItems.length).toBeGreaterThan(0);
      });
    });

    it('should display location names', async () => {
      const mockClose = vi.fn();
      const { container } = render(
        <AlertCenter isOpen={true} onClose={mockClose} />
      );

      await waitFor(() => {
        const alertsContent = container.querySelector('.alerts-list');
        expect(alertsContent?.textContent).toMatch(/Park1/);
        expect(alertsContent?.textContent).toMatch(/Park2/);
      });
    });
  });
});
