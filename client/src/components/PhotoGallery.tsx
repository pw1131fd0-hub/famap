import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, X, ZoomIn, CheckCircle, Heart } from 'lucide-react';
import type { VenuePhoto, PhotoCategory } from '../utils/photoGallery';
import {
  filterPhotosByCategory,
  sortPhotos,
  getAvailableCategories,
  computePhotoStats,
  nextPhotoIndex,
  prevPhotoIndex,
  getRelativeDateLabel,
  PHOTO_CATEGORY_LABELS,
} from '../utils/photoGallery';
import { useTranslation } from '../i18n/useTranslation';

interface PhotoGalleryProps {
  photos: VenuePhoto[];
  locationName?: string;
  /** Compact mode shows fewer photos with smaller grid */
  compact?: boolean;
  /** Called when user wants to add a photo */
  onAddPhoto?: () => void;
}

export function PhotoGallery({ photos, locationName, compact = false, onAddPhoto }: PhotoGalleryProps) {
  const { language } = useTranslation();
  const [activeCategory, setActiveCategory] = useState<PhotoCategory | 'all'>('all');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [likedPhotos, setLikedPhotos] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('likedPhotos');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  const sortedPhotos = sortPhotos(photos);
  const filteredPhotos = filterPhotosByCategory(sortedPhotos, activeCategory);
  const availableCategories = getAvailableCategories(photos);
  const stats = computePhotoStats(photos);

  const isZh = language === 'zh';

  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
  }, []);

  const goNext = useCallback(() => {
    setLightboxIndex((i) => nextPhotoIndex(i, filteredPhotos.length));
  }, [filteredPhotos.length]);

  const goPrev = useCallback(() => {
    setLightboxIndex((i) => prevPhotoIndex(i, filteredPhotos.length));
  }, [filteredPhotos.length]);

  const toggleLike = useCallback((photoId: string) => {
    setLikedPhotos((prev) => {
      const next = new Set(prev);
      if (next.has(photoId)) {
        next.delete(photoId);
      } else {
        next.add(photoId);
      }
      try {
        localStorage.setItem('likedPhotos', JSON.stringify([...next]));
      } catch {
        // ignore storage errors
      }
      return next;
    });
  }, []);

  // Keyboard navigation in lightbox
  useEffect(() => {
    if (!lightboxOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goNext();
      else if (e.key === 'ArrowLeft') goPrev();
      else if (e.key === 'Escape') closeLightbox();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lightboxOpen, goNext, goPrev, closeLightbox]);

  if (photos.length === 0) {
    return (
      <div className="photo-gallery photo-gallery--empty">
        <div className="photo-gallery__empty-state">
          <p>{isZh ? '尚無照片' : 'No photos yet'}</p>
          {onAddPhoto && (
            <button
              className="photo-gallery__add-btn"
              onClick={onAddPhoto}
              type="button"
            >
              {isZh ? '+ 上傳第一張照片' : '+ Upload first photo'}
            </button>
          )}
        </div>
      </div>
    );
  }

  const currentLightboxPhoto = filteredPhotos[lightboxIndex];

  return (
    <div className={`photo-gallery${compact ? ' photo-gallery--compact' : ''}`}>
      {/* Header */}
      <div className="photo-gallery__header">
        <span className="photo-gallery__count">
          {isZh ? `${stats.total} 張照片` : `${stats.total} photo${stats.total !== 1 ? 's' : ''}`}
        </span>
        {stats.verifiedCount > 0 && (
          <span className="photo-gallery__verified-badge">
            <CheckCircle size={12} />
            {isZh
              ? `${stats.verifiedCount} 張已驗證`
              : `${stats.verifiedCount} verified`}
          </span>
        )}
        {onAddPhoto && (
          <button
            className="photo-gallery__add-btn"
            onClick={onAddPhoto}
            type="button"
          >
            {isZh ? '+ 新增照片' : '+ Add photo'}
          </button>
        )}
      </div>

      {/* Category filter tabs */}
      {availableCategories.length > 1 && (
        <div className="photo-gallery__tabs" role="tablist">
          <button
            role="tab"
            aria-selected={activeCategory === 'all'}
            className={`photo-gallery__tab${activeCategory === 'all' ? ' photo-gallery__tab--active' : ''}`}
            onClick={() => setActiveCategory('all')}
            type="button"
          >
            {PHOTO_CATEGORY_LABELS.all[language]}
            <span className="photo-gallery__tab-count">{stats.total}</span>
          </button>
          {availableCategories.map((cat) => (
            <button
              key={cat}
              role="tab"
              aria-selected={activeCategory === cat}
              className={`photo-gallery__tab${activeCategory === cat ? ' photo-gallery__tab--active' : ''}`}
              onClick={() => setActiveCategory(cat)}
              type="button"
            >
              {PHOTO_CATEGORY_LABELS[cat][language]}
              <span className="photo-gallery__tab-count">{stats.byCategory[cat]}</span>
            </button>
          ))}
        </div>
      )}

      {/* Photo grid */}
      <div className={`photo-gallery__grid${compact ? ' photo-gallery__grid--compact' : ''}`}>
        {filteredPhotos.map((photo, index) => (
          <div
            key={photo.id}
            className="photo-gallery__thumb"
            onClick={() => openLightbox(index)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && openLightbox(index)}
            aria-label={photo.caption || (isZh ? `照片 ${index + 1}` : `Photo ${index + 1}`)}
          >
            <img
              src={photo.url}
              alt={photo.caption || (isZh ? `地點照片` : `Venue photo`)}
              className="photo-gallery__thumb-img"
              loading="lazy"
            />
            {photo.isVerified && (
              <span className="photo-gallery__verified-dot" title={isZh ? '已驗證' : 'Verified'}>
                <CheckCircle size={14} />
              </span>
            )}
            <div className="photo-gallery__thumb-overlay">
              <ZoomIn size={20} />
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxOpen && currentLightboxPhoto && (
        <div
          className="photo-gallery__lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={isZh ? '照片檢視' : 'Photo viewer'}
          onClick={closeLightbox}
        >
          <div
            className="photo-gallery__lightbox-inner"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              className="photo-gallery__lightbox-close"
              onClick={closeLightbox}
              aria-label={isZh ? '關閉' : 'Close'}
              type="button"
            >
              <X size={24} />
            </button>

            {/* Navigation */}
            {filteredPhotos.length > 1 && (
              <>
                <button
                  className="photo-gallery__lightbox-nav photo-gallery__lightbox-nav--prev"
                  onClick={goPrev}
                  aria-label={isZh ? '上一張' : 'Previous'}
                  type="button"
                >
                  <ChevronLeft size={32} />
                </button>
                <button
                  className="photo-gallery__lightbox-nav photo-gallery__lightbox-nav--next"
                  onClick={goNext}
                  aria-label={isZh ? '下一張' : 'Next'}
                  type="button"
                >
                  <ChevronRight size={32} />
                </button>
              </>
            )}

            {/* Main image */}
            <div className="photo-gallery__lightbox-img-wrap">
              <img
                src={currentLightboxPhoto.url}
                alt={currentLightboxPhoto.caption || ''}
                className="photo-gallery__lightbox-img"
              />
            </div>

            {/* Photo info footer */}
            <div className="photo-gallery__lightbox-footer">
              <div className="photo-gallery__lightbox-meta">
                {currentLightboxPhoto.caption && (
                  <p className="photo-gallery__lightbox-caption">
                    {currentLightboxPhoto.caption}
                  </p>
                )}
                <div className="photo-gallery__lightbox-details">
                  <span className="photo-gallery__lightbox-category">
                    {PHOTO_CATEGORY_LABELS[currentLightboxPhoto.category][language]}
                  </span>
                  {currentLightboxPhoto.takenAt && (
                    <span className="photo-gallery__lightbox-date">
                      {getRelativeDateLabel(currentLightboxPhoto.takenAt, language)}
                    </span>
                  )}
                  {currentLightboxPhoto.contributorName && (
                    <span className="photo-gallery__lightbox-contributor">
                      {isZh ? '由 ' : 'by '}
                      {currentLightboxPhoto.contributorName}
                    </span>
                  )}
                  {currentLightboxPhoto.isVerified && (
                    <span className="photo-gallery__lightbox-verified">
                      <CheckCircle size={14} />
                      {isZh ? '已驗證' : 'Verified'}
                    </span>
                  )}
                </div>
              </div>
              <div className="photo-gallery__lightbox-actions">
                <button
                  className={`photo-gallery__like-btn${likedPhotos.has(currentLightboxPhoto.id) ? ' photo-gallery__like-btn--active' : ''}`}
                  onClick={() => toggleLike(currentLightboxPhoto.id)}
                  type="button"
                  aria-label={isZh ? '讚' : 'Like'}
                >
                  <Heart
                    size={18}
                    fill={likedPhotos.has(currentLightboxPhoto.id) ? 'currentColor' : 'none'}
                  />
                  <span>{(currentLightboxPhoto.likes ?? 0) + (likedPhotos.has(currentLightboxPhoto.id) ? 1 : 0)}</span>
                </button>
              </div>
              <span className="photo-gallery__lightbox-counter">
                {lightboxIndex + 1} / {filteredPhotos.length}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PhotoGallery;
