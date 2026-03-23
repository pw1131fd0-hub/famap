import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ReviewForm } from '../components/ReviewForm';
import { LanguageProvider } from '../i18n/LanguageContext';

describe('ReviewForm', () => {
  const mockOnSubmit = vi.fn();

  it('renders correctly', () => {
    render(
      <LanguageProvider>
        <ReviewForm onSubmit={mockOnSubmit} />
      </LanguageProvider>
    );
    expect(screen.getByText(/撰寫評論/i)).toBeInTheDocument();
  });

  it('calls onSubmit when form is filled and submitted', async () => {
    render(
      <LanguageProvider>
        <ReviewForm onSubmit={mockOnSubmit} />
      </LanguageProvider>
    );

    fireEvent.change(screen.getByLabelText(/您的名稱/i), { target: { value: 'User' } });
    fireEvent.change(screen.getByLabelText(/評論內容/i), { target: { value: 'Great!' } });

    fireEvent.click(screen.getByText(/提交/i));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        rating: 5,
        comment: 'Great!',
        userName: 'User'
      });
    });
  });

  it('handles rating change', () => {
    render(
      <LanguageProvider>
        <ReviewForm onSubmit={mockOnSubmit} />
      </LanguageProvider>
    );
    const select = screen.getByLabelText(/評分/i);
    fireEvent.change(select, { target: { value: '4' } });
    expect(select).toHaveValue('4');
  });

  it('handles submission error', async () => {
    const errorOnSubmit = vi.fn().mockRejectedValue(new Error('Failed'));
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <LanguageProvider>
        <ReviewForm onSubmit={errorOnSubmit} />
      </LanguageProvider>
    );

    fireEvent.change(screen.getByLabelText(/您的名稱/i), { target: { value: 'User' } });
    fireEvent.change(screen.getByLabelText(/評論內容/i), { target: { value: 'Great!' } });
    fireEvent.click(screen.getByText(/提交/i));

    await waitFor(() => {
      expect(errorOnSubmit).toHaveBeenCalled();
      expect(spy).toHaveBeenCalled();
    });
    spy.mockRestore();
  });

  it('prevents submit when name field is empty', async () => {
    mockOnSubmit.mockClear();
    render(
      <LanguageProvider>
        <ReviewForm onSubmit={mockOnSubmit} />
      </LanguageProvider>
    );

    fireEvent.change(screen.getByLabelText(/評論內容/i), { target: { value: 'Great!' } });
    fireEvent.click(screen.getByText(/提交/i));

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('prevents submit when comment field is empty', async () => {
    mockOnSubmit.mockClear();
    render(
      <LanguageProvider>
        <ReviewForm onSubmit={mockOnSubmit} />
      </LanguageProvider>
    );

    fireEvent.change(screen.getByLabelText(/您的名稱/i), { target: { value: 'User' } });
    fireEvent.click(screen.getByText(/提交/i));

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('displays error message on submission failure', async () => {
    const errorOnSubmit = vi.fn().mockRejectedValue(new Error('Network error'));
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <LanguageProvider>
        <ReviewForm onSubmit={errorOnSubmit} />
      </LanguageProvider>
    );

    fireEvent.change(screen.getByLabelText(/您的名稱/i), { target: { value: 'User' } });
    fireEvent.change(screen.getByLabelText(/評論內容/i), { target: { value: 'Great!' } });
    fireEvent.click(screen.getByText(/提交/i));

    await waitFor(() => {
      expect(screen.getByText(/Network error/i)).toBeInTheDocument();
    });
    spy.mockRestore();
  });

  it('shows success message and clears form on successful submission', async () => {
    render(
      <LanguageProvider>
        <ReviewForm onSubmit={mockOnSubmit} />
      </LanguageProvider>
    );

    fireEvent.change(screen.getByLabelText(/您的名稱/i), { target: { value: 'User' } });
    fireEvent.change(screen.getByLabelText(/評論內容/i), { target: { value: 'Great!' } });
    fireEvent.click(screen.getByText(/提交/i));

    await waitFor(() => {
      expect(screen.getByText(/Review submitted successfully/i)).toBeInTheDocument();
    });

    // Form should be cleared
    expect((screen.getByLabelText(/您的名稱/i) as HTMLInputElement).value).toBe('');
    expect((screen.getByLabelText(/評論內容/i) as HTMLTextAreaElement).value).toBe('');
  });

  it('disables submit button while submitting', async () => {
    const slowOnSubmit = vi.fn(() => new Promise(resolve => setTimeout(resolve, 100)));
    render(
      <LanguageProvider>
        <ReviewForm onSubmit={slowOnSubmit} />
      </LanguageProvider>
    );

    fireEvent.change(screen.getByLabelText(/您的名稱/i), { target: { value: 'User' } });
    fireEvent.change(screen.getByLabelText(/評論內容/i), { target: { value: 'Great!' } });

    const submitButton = screen.getByText(/提交/i);
    fireEvent.click(submitButton);

    expect(submitButton).toBeDisabled();

    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
  });
});
