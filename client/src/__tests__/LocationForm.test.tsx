// @vitest-environment jsdom
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

  it('prevents submit when required fields are empty', () => {
    mockOnSubmit.mockClear();
    render(
      <LanguageProvider>
        <LocationForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      </LanguageProvider>
    );

    fireEvent.click(screen.getByText(/提交/i));

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('prevents submit when only some required fields are filled', () => {
    mockOnSubmit.mockClear();
    render(
      <LanguageProvider>
        <LocationForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      </LanguageProvider>
    );

    fireEvent.change(screen.getByLabelText(/中文名稱/i), { target: { value: '公園' } });
    fireEvent.click(screen.getByText(/提交/i));

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('displays error message on submission failure', async () => {
    const errorOnSubmit = vi.fn().mockRejectedValue(new Error('API error'));
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <LanguageProvider>
        <LocationForm onSubmit={errorOnSubmit} onCancel={mockOnCancel} />
      </LanguageProvider>
    );

    fireEvent.change(screen.getByLabelText(/中文名稱/i), { target: { value: '公園' } });
    fireEvent.change(screen.getByLabelText(/英文名稱/i), { target: { value: 'Park' } });
    fireEvent.change(screen.getByLabelText(/中文地址/i), { target: { value: '地址' } });
    fireEvent.change(screen.getByLabelText(/英文地址/i), { target: { value: 'Addr' } });
    fireEvent.click(screen.getByText(/提交/i));

    await waitFor(() => {
      expect(screen.getByText(/API error/i)).toBeInTheDocument();
    });
    spy.mockRestore();
  });

  it('shows success message and calls onCancel after successful submission', async () => {
    render(
      <LanguageProvider>
        <LocationForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      </LanguageProvider>
    );

    fireEvent.change(screen.getByLabelText(/中文名稱/i), { target: { value: '公園' } });
    fireEvent.change(screen.getByLabelText(/英文名稱/i), { target: { value: 'Park' } });
    fireEvent.change(screen.getByLabelText(/中文地址/i), { target: { value: '地址' } });
    fireEvent.change(screen.getByLabelText(/英文地址/i), { target: { value: 'Addr' } });
    fireEvent.click(screen.getByText(/提交/i));

    await waitFor(() => {
      expect(screen.getByText(/Location added successfully/i)).toBeInTheDocument();
    });

    // Wait for the timeout to call onCancel
    await waitFor(() => {
      expect(mockOnCancel).toHaveBeenCalled();
    }, { timeout: 2000 });
  });

  it('disables submit button while submitting', async () => {
    const slowOnSubmit = vi.fn(async (): Promise<void> => {
      return new Promise(resolve => setTimeout(resolve, 100));
    });
    render(
      <LanguageProvider>
        <LocationForm onSubmit={slowOnSubmit} onCancel={mockOnCancel} />
      </LanguageProvider>
    );

    fireEvent.change(screen.getByLabelText(/中文名稱/i), { target: { value: '公園' } });
    fireEvent.change(screen.getByLabelText(/英文名稱/i), { target: { value: 'Park' } });
    fireEvent.change(screen.getByLabelText(/中文地址/i), { target: { value: '地址' } });
    fireEvent.change(screen.getByLabelText(/英文地址/i), { target: { value: 'Addr' } });

    const submitButton = screen.getByText(/提交/i);
    fireEvent.click(submitButton);

    expect(submitButton).toBeDisabled();

    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    }, { timeout: 2000 });
  });

  it('accepts whitespace-only input as empty field', () => {
    mockOnSubmit.mockClear();
    render(
      <LanguageProvider>
        <LocationForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      </LanguageProvider>
    );

    fireEvent.change(screen.getByLabelText(/中文名稱/i), { target: { value: '   ' } });
    fireEvent.change(screen.getByLabelText(/英文名稱/i), { target: { value: '   ' } });
    fireEvent.change(screen.getByLabelText(/中文地址/i), { target: { value: '   ' } });
    fireEvent.change(screen.getByLabelText(/英文地址/i), { target: { value: '   ' } });
    fireEvent.click(screen.getByText(/提交/i));

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });
});
