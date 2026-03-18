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
});
