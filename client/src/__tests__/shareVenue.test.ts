// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { shareVenue } from '../utils/shareVenue';

describe('shareVenue', () => {
  const defaultOptions = {
    venueName: 'Taipei Zoo',
    venueAddress: '111 Xinguang Rd, Wenshan District, Taipei',
    venueId: 'venue-001',
    origin: 'https://famap.app',
  };

  beforeEach(() => {
    // Reset navigator mocks between tests
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: undefined,
      writable: true,
    });
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: undefined,
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('calls navigator.share with correct data when available', async () => {
    const shareMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: shareMock,
      writable: true,
    });

    await shareVenue(defaultOptions);

    expect(shareMock).toHaveBeenCalledOnce();
    expect(shareMock).toHaveBeenCalledWith({
      title: 'Taipei Zoo',
      text: 'Taipei Zoo - 111 Xinguang Rd, Wenshan District, Taipei',
      url: 'https://famap.app?venue=venue-001',
    });
  });

  it('URL contains venue id parameter', async () => {
    const shareMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: shareMock,
      writable: true,
    });

    await shareVenue({ ...defaultOptions, venueId: 'my-special-venue' });

    const callArg = shareMock.mock.calls[0][0] as { url: string };
    expect(callArg.url).toContain('venue=my-special-venue');
  });

  it('falls back to clipboard when navigator.share is not available', async () => {
    const clipboardMock = { writeText: vi.fn().mockResolvedValue(undefined) };
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: clipboardMock,
      writable: true,
    });

    await shareVenue(defaultOptions);

    expect(clipboardMock.writeText).toHaveBeenCalledOnce();
    const writtenText = clipboardMock.writeText.mock.calls[0][0] as string;
    expect(writtenText).toContain('Taipei Zoo');
    expect(writtenText).toContain('111 Xinguang Rd, Wenshan District, Taipei');
    expect(writtenText).toContain('https://famap.app?venue=venue-001');
  });

  it('handles share cancellation (user cancels) without throwing', async () => {
    // navigator.share rejects with AbortError when user cancels
    const shareMock = vi.fn().mockRejectedValue(new DOMException('Share cancelled', 'AbortError'));
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: shareMock,
      writable: true,
    });

    // Should not throw
    await expect(shareVenue(defaultOptions)).resolves.toBeUndefined();
    expect(shareMock).toHaveBeenCalled();
  });

  it('handles clipboard error gracefully without throwing', async () => {
    const clipboardMock = { writeText: vi.fn().mockRejectedValue(new Error('Clipboard denied')) };
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: clipboardMock,
      writable: true,
    });

    // Should not throw
    await expect(shareVenue(defaultOptions)).resolves.toBeUndefined();
  });

  it('clipboard text includes newline-separated venue details', async () => {
    const clipboardMock = { writeText: vi.fn().mockResolvedValue(undefined) };
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: clipboardMock,
      writable: true,
    });

    await shareVenue(defaultOptions);

    const writtenText = clipboardMock.writeText.mock.calls[0][0] as string;
    const lines = writtenText.split('\n');
    expect(lines[0]).toBe('Taipei Zoo');
    expect(lines[1]).toBe('111 Xinguang Rd, Wenshan District, Taipei');
    expect(lines[2]).toBe('https://famap.app?venue=venue-001');
  });
});
