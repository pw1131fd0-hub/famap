import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { LocationForm } from '../components/LocationForm';
import { LanguageProvider } from '../i18n/LanguageContext';

describe('LocationForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  it('renders correctly', () => {
    render(
      <LanguageProvider>
        <LocationForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      </LanguageProvider>
    );
    // Use t.common.addLocation (assuming it's 'Add New Location' or '新增地點')
    // We can use partial match or check for specific labels
    expect(screen.getByLabelText(/中文名稱/i)).toBeInTheDocument();
  });

  it('calls onSubmit with form data when submitted', async () => {
    render(
      <LanguageProvider>
        <LocationForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      </LanguageProvider>
    );

    fireEvent.change(screen.getByLabelText(/中文名稱/i), { target: { value: '公園' } });
    fireEvent.change(screen.getByLabelText(/英文名稱/i), { target: { value: 'Park' } });
    fireEvent.change(screen.getByLabelText(/中文地址/i), { target: { value: '地址' } });
    fireEvent.change(screen.getByLabelText(/英文地址/i), { target: { value: 'Addr' } });
    fireEvent.change(screen.getByLabelText(/中文描述/i), { target: { value: '描述' } });
    fireEvent.change(screen.getByLabelText(/英文描述/i), { target: { value: 'Desc' } });

    const checkbox = screen.getByLabelText(/尿布台/i);
    fireEvent.click(checkbox);

    fireEvent.click(screen.getByText(/提交/i));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(expect.objectContaining({
        description: { zh: '描述', en: 'Desc' },
        facilities: expect.arrayContaining(['changing_table'])
      }));
    });
  });

  it('calls onCancel when cancel button is clicked', () => {
    render(
      <LanguageProvider>
        <LocationForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      </LanguageProvider>
    );

    fireEvent.click(screen.getByText(/取消/i));
    expect(mockOnCancel).toHaveBeenCalled();
  });
});
