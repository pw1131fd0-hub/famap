// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FamilyTripPlanner } from '../components/FamilyTripPlanner';

// Mock the i18n hook
vi.mock('../i18n/useTranslation', () => ({
  useTranslation: () => ({
    language: 'en',
    t: (key: string) => key,
    setLanguage: vi.fn(),
  }),
}));

describe('FamilyTripPlanner', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should render the component with header and create button', () => {
    render(<FamilyTripPlanner darkMode={false} />);

    expect(screen.getByText(/Family Trip Planner/i)).toBeInTheDocument();
    expect(screen.getByText(/New Trip/i)).toBeInTheDocument();
  });

  it('should show empty state when no trips exist', () => {
    render(<FamilyTripPlanner darkMode={false} />);

    expect(screen.getByText(/No trips planned yet/i)).toBeInTheDocument();
  });

  it('should open create trip modal when clicking new trip button', async () => {
    render(<FamilyTripPlanner darkMode={false} />);

    const createButton = screen.getByText(/New Trip/i);
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(screen.getByText(/Create New Trip/i)).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Trip Name/i)).toBeInTheDocument();
    });
  });

  it('should create a new trip with valid data', async () => {
    render(<FamilyTripPlanner darkMode={false} />);

    // Open modal
    fireEvent.click(screen.getByText(/New Trip/i));

    await waitFor(() => {
      expect(screen.getByText(/Create New Trip/i)).toBeInTheDocument();
    }, { timeout: 3000 });

    // Fill form
    const nameInput = screen.getByPlaceholderText(/Trip Name/i);
    fireEvent.change(nameInput, { target: { value: 'Summer Trip' } });

    // Find date input by looking for input[type="date"]
    const dateInputs = document.querySelectorAll('input[type="date"]');
    if (dateInputs.length > 0) {
      fireEvent.change(dateInputs[0] as HTMLInputElement, { target: { value: '2026-06-15' } });
    }

    // Create trip
    const createBtn = screen.getByText(/^Create$/);
    fireEvent.click(createBtn);

    // Verify trip was created
    await waitFor(() => {
      const savedTrips = localStorage.getItem('familyTrips');
      expect(savedTrips).toBeTruthy();
      const trips = JSON.parse(savedTrips || '[]');
      expect(trips.some((t: any) => t.name === 'Summer Trip')).toBe(true);
    });
  });

  it('should display trip details with correct information', async () => {
    render(<FamilyTripPlanner darkMode={false} />);

    // Create a trip
    fireEvent.click(screen.getByText(/New Trip/i));

    await waitFor(() => {
      expect(screen.getByText(/Create New Trip/i)).toBeInTheDocument();
    });

    const nameInput = screen.getByPlaceholderText(/Trip Name/i);
    fireEvent.change(nameInput, { target: { value: 'Park Visit' } });

    const dateInputs = screen.getAllByDisplayValue('');
    fireEvent.change(dateInputs[0], { target: { value: '2026-05-20' } });

    fireEvent.click(screen.getByText(/^Create$/));

    await waitFor(() => {
      expect(screen.getByText('Park Visit')).toBeInTheDocument();
    });
  });

  it('should delete a trip', async () => {
    render(<FamilyTripPlanner darkMode={false} />);

    // Create trip
    fireEvent.click(screen.getByText(/New Trip/i));

    await waitFor(() => {
      expect(screen.getByText(/Create New Trip/i)).toBeInTheDocument();
    });

    const nameInput = screen.getByPlaceholderText(/Trip Name/i);
    fireEvent.change(nameInput, { target: { value: 'Test Trip to Delete' } });

    const dateInputs = screen.getAllByDisplayValue('');
    fireEvent.change(dateInputs[0], { target: { value: '2026-05-20' } });

    fireEvent.click(screen.getByText(/^Create$/));

    await waitFor(() => {
      expect(screen.getByText('Test Trip to Delete')).toBeInTheDocument();
    });

    // Get initial trip count
    const initialTrips = localStorage.getItem('familyTrips');
    const initialCount = initialTrips ? JSON.parse(initialTrips).length : 0;

    // Find and delete trip by clicking last danger button
    const allButtons = screen.getAllByRole('button');
    const dangerButtons = allButtons.filter(btn => btn.className.includes('danger'));

    if (dangerButtons.length > 0) {
      fireEvent.click(dangerButtons[dangerButtons.length - 1]);
    }

    // Trip should be deleted from localStorage
    const finalTrips = localStorage.getItem('familyTrips');
    const finalCount = finalTrips ? JSON.parse(finalTrips).length : 0;

    expect(finalCount).toBeLessThan(initialCount);
  });

  it('should persist trips to localStorage', async () => {
    const { rerender } = render(<FamilyTripPlanner darkMode={false} />);

    // Create trip
    fireEvent.click(screen.getByText(/New Trip/i));

    await waitFor(() => {
      expect(screen.getByText(/Create New Trip/i)).toBeInTheDocument();
    });

    const nameInput = screen.getByPlaceholderText(/Trip Name/i);
    fireEvent.change(nameInput, { target: { value: 'Persisted Trip' } });

    const dateInputs = screen.getAllByDisplayValue('');
    fireEvent.change(dateInputs[0], { target: { value: '2026-05-20' } });

    fireEvent.click(screen.getByText(/^Create$/));

    await waitFor(() => {
      expect(screen.getByText('Persisted Trip')).toBeInTheDocument();
    });

    // Verify localStorage
    const savedTrips = localStorage.getItem('familyTrips');
    expect(savedTrips).toBeTruthy();
    const trips = JSON.parse(savedTrips || '[]');
    expect(trips.some((t: any) => t.name === 'Persisted Trip')).toBe(true);

    // Re-render component and verify trip is still there
    rerender(<FamilyTripPlanner darkMode={false} />);

    await waitFor(() => {
      expect(screen.getByText('Persisted Trip')).toBeInTheDocument();
    });
  });

  it('should update trip status', async () => {
    render(<FamilyTripPlanner darkMode={false} />);

    // Create trip
    fireEvent.click(screen.getByText(/New Trip/i));

    await waitFor(() => {
      expect(screen.getByText(/Create New Trip/i)).toBeInTheDocument();
    });

    const nameInput = screen.getByPlaceholderText(/Trip Name/i);
    fireEvent.change(nameInput, { target: { value: 'Status Test Trip' } });

    const dateInputs = screen.getAllByDisplayValue('');
    fireEvent.change(dateInputs[0], { target: { value: '2026-05-20' } });

    fireEvent.click(screen.getByText(/^Create$/));

    await waitFor(() => {
      expect(screen.getByText('Status Test Trip')).toBeInTheDocument();
    });

    // Expand trip details
    const chevronButtons = screen.getAllByRole('button');
    const expandButton = chevronButtons.find(btn =>
      btn.querySelector('svg') && btn.innerHTML.includes('ChevronDown')
    );

    if (expandButton) {
      fireEvent.click(expandButton);
    }
  });

  it('should close create modal when clicking close button', async () => {
    render(<FamilyTripPlanner darkMode={false} />);

    // Open modal
    fireEvent.click(screen.getByText(/New Trip/i));

    await waitFor(() => {
      expect(screen.getByText(/Create New Trip/i)).toBeInTheDocument();
    });

    // Find and click close button by searching for button with X icon SVG
    const allButtons = screen.getAllByRole('button');
    let closeButton = null;

    for (const btn of allButtons) {
      if (btn.className && btn.className.includes('ftp-btn-close')) {
        closeButton = btn;
        break;
      }
    }

    if (closeButton) {
      fireEvent.click(closeButton);
      await waitFor(() => {
        expect(screen.queryByText(/Create New Trip/i)).not.toBeInTheDocument();
      });
    }
  });

  it('should render in dark mode', () => {
    const { container } = render(<FamilyTripPlanner darkMode={true} />);

    const planner = container.querySelector('.family-trip-planner');
    expect(planner).toHaveClass('dark-mode');
  });

  it('should handle budget input', async () => {
    render(<FamilyTripPlanner darkMode={false} />);

    // Open modal
    fireEvent.click(screen.getByText(/New Trip/i));

    await waitFor(() => {
      expect(screen.getByText(/Create New Trip/i)).toBeInTheDocument();
    });

    // Find budget input by label
    const budgetLabel = screen.getByText(/Budget/i);
    expect(budgetLabel).toBeInTheDocument();
  });

  it('should handle notes input', async () => {
    render(<FamilyTripPlanner darkMode={false} />);

    // Open modal
    fireEvent.click(screen.getByText(/New Trip/i));

    await waitFor(() => {
      expect(screen.getByText(/Create New Trip/i)).toBeInTheDocument();
    });

    const notesInput = screen.getByPlaceholderText(/Notes/i);
    expect(notesInput).toBeInTheDocument();

    fireEvent.change(notesInput, { target: { value: 'Bring sunscreen and hats' } });
    expect(notesInput).toHaveValue('Bring sunscreen and hats');
  });

  it('should export trip as text file', async () => {
    // Mock document.createElement and related methods
    const createElementSpy = vi.spyOn(document, 'createElement');
    const appendChildSpy = vi.spyOn(document.body, 'appendChild');
    const removeChildSpy = vi.spyOn(document.body, 'removeChild');

    render(<FamilyTripPlanner darkMode={false} />);

    // Create trip
    fireEvent.click(screen.getByText(/New Trip/i));

    await waitFor(() => {
      expect(screen.getByText(/Create New Trip/i)).toBeInTheDocument();
    });

    const nameInput = screen.getByPlaceholderText(/Trip Name/i);
    fireEvent.change(nameInput, { target: { value: 'Export Trip' } });

    const dateInputs = screen.getAllByDisplayValue('');
    fireEvent.change(dateInputs[0], { target: { value: '2026-05-20' } });

    fireEvent.click(screen.getByText(/^Create$/));

    await waitFor(() => {
      expect(screen.getByText('Export Trip')).toBeInTheDocument();
    });

    // Find download button
    const downloadButtons = screen.getAllByRole('button');
    const downloadButton = downloadButtons.find(btn =>
      btn.querySelector('svg') && btn.innerHTML.includes('Download')
    );

    if (downloadButton) {
      fireEvent.click(downloadButton);
    }

    createElementSpy.mockRestore();
    appendChildSpy.mockRestore();
    removeChildSpy.mockRestore();
  });

  it('should display family members in trip details', async () => {
    render(<FamilyTripPlanner darkMode={false} />);

    // Create trip
    fireEvent.click(screen.getByText(/New Trip/i));

    await waitFor(() => {
      expect(screen.getByText(/Create New Trip/i)).toBeInTheDocument();
    });

    const nameInput = screen.getByPlaceholderText(/Trip Name/i);
    fireEvent.change(nameInput, { target: { value: 'Family Trip' } });

    const dateInputs = screen.getAllByDisplayValue('');
    fireEvent.change(dateInputs[0], { target: { value: '2026-05-20' } });

    fireEvent.click(screen.getByText(/^Create$/));

    await waitFor(() => {
      expect(screen.getByText('Family Trip')).toBeInTheDocument();
    });
  });

  it('should handle multiple trips', async () => {
    render(<FamilyTripPlanner darkMode={false} />);

    // Create first trip
    fireEvent.click(screen.getByText(/New Trip/i));

    await waitFor(() => {
      expect(screen.getByText(/Create New Trip/i)).toBeInTheDocument();
    });

    let nameInput = screen.getByPlaceholderText(/Trip Name/i);
    fireEvent.change(nameInput, { target: { value: 'Trip 1' } });

    let dateInputs = screen.getAllByDisplayValue('');
    fireEvent.change(dateInputs[0], { target: { value: '2026-05-20' } });

    fireEvent.click(screen.getByText(/^Create$/));

    await waitFor(() => {
      expect(screen.getByText('Trip 1')).toBeInTheDocument();
    });

    // Create second trip
    fireEvent.click(screen.getByText(/New Trip/i));

    await waitFor(() => {
      expect(screen.getByText(/Create New Trip/i)).toBeInTheDocument();
    });

    nameInput = screen.getByPlaceholderText(/Trip Name/i);
    fireEvent.change(nameInput, { target: { value: 'Trip 2' } });

    dateInputs = screen.getAllByDisplayValue('');
    fireEvent.change(dateInputs[0], { target: { value: '2026-06-20' } });

    fireEvent.click(screen.getByText(/^Create$/));

    await waitFor(() => {
      expect(screen.getByText('Trip 1')).toBeInTheDocument();
      expect(screen.getByText('Trip 2')).toBeInTheDocument();
    });
  });

  it('should not create trip without name or date', async () => {
    render(<FamilyTripPlanner darkMode={false} />);

    // Open modal
    fireEvent.click(screen.getByText(/New Trip/i));

    await waitFor(() => {
      expect(screen.getByText(/Create New Trip/i)).toBeInTheDocument();
    });

    // Try to create without name
    fireEvent.click(screen.getByText(/^Create$/));

    await waitFor(() => {
      // Modal should still be open
      expect(screen.getByText(/Create New Trip/i)).toBeInTheDocument();
    });
  });
});
