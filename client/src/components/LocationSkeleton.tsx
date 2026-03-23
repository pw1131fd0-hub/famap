export function LocationSkeleton() {
  return (
    <div className="location-card-skeleton">
      <div className="skeleton-header">
        <div className="skeleton skeleton-title"></div>
        <div className="skeleton skeleton-category"></div>
      </div>
      <div className="skeleton-content">
        <div className="skeleton skeleton-text"></div>
        <div className="skeleton skeleton-text skeleton-short"></div>
      </div>
      <div className="skeleton-footer">
        <div className="skeleton skeleton-button"></div>
        <div className="skeleton skeleton-button"></div>
      </div>
    </div>
  );
}

export function LocationListSkeleton() {
  return (
    <div className="location-list-skeleton">
      {Array.from({ length: 3 }).map((_, i) => (
        <LocationSkeleton key={i} />
      ))}
    </div>
  );
}
