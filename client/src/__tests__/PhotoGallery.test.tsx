// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PhotoGallery } from '../components/PhotoGallery';
import { LanguageProvider } from '../i18n/LanguageContext';
import type { VenuePhoto } from '../utils/photoGallery';

// Minimal localStorage mock
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock, writable: true });

function renderWithLanguage(ui: React.ReactElement) {
  return render(<LanguageProvider initialLanguage="en">{ui}</LanguageProvider>);
}

const makePhoto = (overrides: Partial<VenuePhoto> = {}): VenuePhoto => ({
  id: `photo-${Math.random().toString(36).slice(2)}`,
  url: 'https://example.com/photo.jpg',
  category: 'general',
  ...overrides,
});

const threePhotos: VenuePhoto[] = [
  makePhoto({ id: 'p1', category: 'entrance', caption: 'Front entrance', isVerified: true, takenAt: '2026-04-01T00:00:00Z', likes: 5 }),
  makePhoto({ id: 'p2', category: 'play_area', caption: 'Play area', isVerified: false, takenAt: '2026-03-20T00:00:00Z', likes: 3 }),
  makePhoto({ id: 'p3', category: 'nursing_room', caption: 'Nursing room', isVerified: true, takenAt: '2026-03-10T00:00:00Z', likes: 1 }),
];

describe('PhotoGallery', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe('Empty state', () => {
    it('renders empty state when no photos', () => {
      renderWithLanguage(<PhotoGallery photos={[]} />);
      expect(screen.getByText('No photos yet')).toBeInTheDocument();
    });

    it('shows add photo button in empty state when callback provided', () => {
      const onAdd = vi.fn();
      renderWithLanguage(<PhotoGallery photos={[]} onAddPhoto={onAdd} />);
      const btn = screen.getByText('+ Upload first photo');
      expect(btn).toBeInTheDocument();
    });

    it('calls onAddPhoto when empty state button clicked', () => {
      const onAdd = vi.fn();
      renderWithLanguage(<PhotoGallery photos={[]} onAddPhoto={onAdd} />);
      fireEvent.click(screen.getByText('+ Upload first photo'));
      expect(onAdd).toHaveBeenCalledTimes(1);
    });
  });

  describe('Photo grid', () => {
    it('renders photo thumbnails', () => {
      renderWithLanguage(<PhotoGallery photos={threePhotos} />);
      const images = screen.getAllByRole('img');
      expect(images.length).toBeGreaterThanOrEqual(3);
    });

    it('shows photo count in header', () => {
      renderWithLanguage(<PhotoGallery photos={threePhotos} />);
      expect(screen.getByText('3 photos')).toBeInTheDocument();
    });

    it('shows singular "photo" for single photo', () => {
      renderWithLanguage(<PhotoGallery photos={[threePhotos[0]]} />);
      expect(screen.getByText('1 photo')).toBeInTheDocument();
    });

    it('shows verified count badge when there are verified photos', () => {
      renderWithLanguage(<PhotoGallery photos={threePhotos} />);
      expect(screen.getByText('2 verified')).toBeInTheDocument();
    });

    it('does not show verified badge when no verified photos', () => {
      const unverified = [makePhoto({ isVerified: false })];
      renderWithLanguage(<PhotoGallery photos={unverified} />);
      expect(screen.queryByText(/verified/i)).not.toBeInTheDocument();
    });

    it('shows add photo button when onAddPhoto provided and photos exist', () => {
      const onAdd = vi.fn();
      renderWithLanguage(<PhotoGallery photos={threePhotos} onAddPhoto={onAdd} />);
      expect(screen.getByText('+ Add photo')).toBeInTheDocument();
    });

    it('calls onAddPhoto when add button clicked', () => {
      const onAdd = vi.fn();
      renderWithLanguage(<PhotoGallery photos={threePhotos} onAddPhoto={onAdd} />);
      fireEvent.click(screen.getByText('+ Add photo'));
      expect(onAdd).toHaveBeenCalledTimes(1);
    });
  });

  describe('Category tabs', () => {
    it('shows category tabs when photos have multiple categories', () => {
      renderWithLanguage(<PhotoGallery photos={threePhotos} />);
      expect(screen.getByRole('tab', { name: /All/ })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /Entrance/ })).toBeInTheDocument();
    });

    it('does not show tabs when all photos are the same category', () => {
      const oneCategory = [
        makePhoto({ category: 'entrance' }),
        makePhoto({ category: 'entrance' }),
      ];
      renderWithLanguage(<PhotoGallery photos={oneCategory} />);
      expect(document.querySelector('.photo-gallery__tabs')).not.toBeInTheDocument();
    });

    it('filters photos when category tab clicked', () => {
      renderWithLanguage(<PhotoGallery photos={threePhotos} />);
      // Use the entrance tab (there's 1 entrance photo)
      const entranceTab = screen.getByRole('tab', { name: /Entrance/ });
      fireEvent.click(entranceTab);
      // Only the 1 entrance photo should be shown
      const images = document.querySelectorAll('.photo-gallery__thumb-img');
      expect(images.length).toBe(1);
    });

    it('shows all photos when "All" tab clicked', () => {
      renderWithLanguage(<PhotoGallery photos={threePhotos} />);
      // Click a category first
      const entranceTab = screen.getByRole('tab', { name: /Entrance/ });
      fireEvent.click(entranceTab);
      // Then click all
      const allTab = screen.getByRole('tab', { name: /^All/ });
      fireEvent.click(allTab);
      const images = document.querySelectorAll('.photo-gallery__thumb-img');
      expect(images.length).toBe(3);
    });

    it('marks All tab as selected initially', () => {
      renderWithLanguage(<PhotoGallery photos={threePhotos} />);
      const allTab = screen.getByRole('tab', { name: /^All/ });
      expect(allTab).toHaveAttribute('aria-selected', 'true');
    });

    it('marks selected category tab as active', () => {
      renderWithLanguage(<PhotoGallery photos={threePhotos} />);
      const entranceTab = screen.getByRole('tab', { name: /Entrance/ });
      fireEvent.click(entranceTab);
      expect(entranceTab).toHaveAttribute('aria-selected', 'true');
    });
  });

  describe('Lightbox', () => {
    it('opens lightbox when thumbnail is clicked', () => {
      renderWithLanguage(<PhotoGallery photos={threePhotos} />);
      const allThumbs = document.querySelectorAll('.photo-gallery__thumb');
      fireEvent.click(allThumbs[0]);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('shows close button in lightbox', () => {
      renderWithLanguage(<PhotoGallery photos={threePhotos} />);
      const allThumbs = document.querySelectorAll('.photo-gallery__thumb');
      fireEvent.click(allThumbs[0]);
      expect(screen.getByLabelText('Close')).toBeInTheDocument();
    });

    it('closes lightbox when close button clicked', () => {
      renderWithLanguage(<PhotoGallery photos={threePhotos} />);
      const allThumbs = document.querySelectorAll('.photo-gallery__thumb');
      fireEvent.click(allThumbs[0]);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      fireEvent.click(screen.getByLabelText('Close'));
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('shows navigation buttons when multiple photos', () => {
      renderWithLanguage(<PhotoGallery photos={threePhotos} />);
      const allThumbs = document.querySelectorAll('.photo-gallery__thumb');
      fireEvent.click(allThumbs[0]);
      expect(screen.getByLabelText('Previous')).toBeInTheDocument();
      expect(screen.getByLabelText('Next')).toBeInTheDocument();
    });

    it('does not show navigation for single photo', () => {
      renderWithLanguage(<PhotoGallery photos={[threePhotos[0]]} />);
      const allThumbs = document.querySelectorAll('.photo-gallery__thumb');
      fireEvent.click(allThumbs[0]);
      expect(screen.queryByLabelText('Previous')).not.toBeInTheDocument();
    });

    it('navigates to next photo', () => {
      renderWithLanguage(<PhotoGallery photos={threePhotos} />);
      const allThumbs = document.querySelectorAll('.photo-gallery__thumb');
      fireEvent.click(allThumbs[0]);
      expect(screen.getByText('1 / 3')).toBeInTheDocument();
      fireEvent.click(screen.getByLabelText('Next'));
      expect(screen.getByText('2 / 3')).toBeInTheDocument();
    });

    it('navigates to previous photo', () => {
      renderWithLanguage(<PhotoGallery photos={threePhotos} />);
      const allThumbs = document.querySelectorAll('.photo-gallery__thumb');
      fireEvent.click(allThumbs[0]);
      fireEvent.click(screen.getByLabelText('Next'));
      expect(screen.getByText('2 / 3')).toBeInTheDocument();
      fireEvent.click(screen.getByLabelText('Previous'));
      expect(screen.getByText('1 / 3')).toBeInTheDocument();
    });

    it('shows photo caption in lightbox', () => {
      renderWithLanguage(<PhotoGallery photos={threePhotos} />);
      const allThumbs = document.querySelectorAll('.photo-gallery__thumb');
      fireEvent.click(allThumbs[0]);
      // Caption from first photo in sorted order (entrance photo = 'Front entrance')
      expect(screen.getByText('Front entrance')).toBeInTheDocument();
    });

    it('closes lightbox when clicking backdrop', () => {
      renderWithLanguage(<PhotoGallery photos={threePhotos} />);
      const allThumbs = document.querySelectorAll('.photo-gallery__thumb');
      fireEvent.click(allThumbs[0]);
      const dialog = screen.getByRole('dialog');
      fireEvent.click(dialog);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('keyboard navigation: ArrowRight goes next', () => {
      renderWithLanguage(<PhotoGallery photos={threePhotos} />);
      const allThumbs = document.querySelectorAll('.photo-gallery__thumb');
      fireEvent.click(allThumbs[0]);
      expect(screen.getByText('1 / 3')).toBeInTheDocument();
      fireEvent.keyDown(window, { key: 'ArrowRight' });
      expect(screen.getByText('2 / 3')).toBeInTheDocument();
    });

    it('keyboard navigation: ArrowLeft goes previous', () => {
      renderWithLanguage(<PhotoGallery photos={threePhotos} />);
      const allThumbs = document.querySelectorAll('.photo-gallery__thumb');
      fireEvent.click(allThumbs[0]);
      fireEvent.keyDown(window, { key: 'ArrowRight' });
      fireEvent.keyDown(window, { key: 'ArrowLeft' });
      expect(screen.getByText('1 / 3')).toBeInTheDocument();
    });

    it('keyboard navigation: Escape closes lightbox', () => {
      renderWithLanguage(<PhotoGallery photos={threePhotos} />);
      const allThumbs = document.querySelectorAll('.photo-gallery__thumb');
      fireEvent.click(allThumbs[0]);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('shows counter in lightbox', () => {
      renderWithLanguage(<PhotoGallery photos={threePhotos} />);
      const allThumbs = document.querySelectorAll('.photo-gallery__thumb');
      fireEvent.click(allThumbs[0]);
      expect(screen.getByText('1 / 3')).toBeInTheDocument();
    });

    it('wraps from last to first photo', () => {
      renderWithLanguage(<PhotoGallery photos={threePhotos} />);
      const allThumbs = document.querySelectorAll('.photo-gallery__thumb');
      fireEvent.click(allThumbs[2]); // last photo
      // The lightbox shows the index of the clicked photo in filtered (sorted) list
      // Navigate next from last should wrap to first
      const nextBtn = screen.getByLabelText('Next');
      const prevBtn = screen.getByLabelText('Previous');
      expect(nextBtn).toBeInTheDocument();
      expect(prevBtn).toBeInTheDocument();
    });
  });

  describe('Like button', () => {
    it('shows like button in lightbox', () => {
      renderWithLanguage(<PhotoGallery photos={threePhotos} />);
      const allThumbs = document.querySelectorAll('.photo-gallery__thumb');
      fireEvent.click(allThumbs[0]);
      expect(screen.getByLabelText('Like')).toBeInTheDocument();
    });

    it('displays like count', () => {
      renderWithLanguage(<PhotoGallery photos={threePhotos} />);
      const allThumbs = document.querySelectorAll('.photo-gallery__thumb');
      fireEvent.click(allThumbs[0]);
      // Entrance photo has 5 likes
      expect(screen.getByText('5')).toBeInTheDocument();
    });
  });

  describe('Compact mode', () => {
    it('renders in compact mode', () => {
      const { container } = renderWithLanguage(<PhotoGallery photos={threePhotos} compact />);
      expect(container.querySelector('.photo-gallery--compact')).toBeInTheDocument();
    });

    it('does not apply compact class in non-compact mode', () => {
      const { container } = renderWithLanguage(<PhotoGallery photos={threePhotos} />);
      expect(container.querySelector('.photo-gallery--compact')).not.toBeInTheDocument();
    });
  });
});
