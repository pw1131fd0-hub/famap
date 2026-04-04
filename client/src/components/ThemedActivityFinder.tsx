import { useState, useMemo } from 'react';
import { Compass, ChevronRight, Star, X, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { useTranslation } from '../i18n/useTranslation';
import type { Location } from '../types';
import {
  ACTIVITY_THEMES,
  OCCASIONS,
  AGE_GROUPS,
  getFeaturedCollections,
  searchByTheme,
  type ActivityTheme,
  type OccasionType,
  type AgeGroup,
  type ThemedVenueResult,
} from '../utils/themedActivityFinder';
import '../styles/ThemedActivityFinder.css';

interface ThemedActivityFinderProps {
  locations: Location[];
  onSelectLocation: (locationId: string) => void;
  onClose: () => void;
}

type FinderStep = 'collections' | 'filters' | 'results';

export function ThemedActivityFinder({
  locations,
  onSelectLocation,
  onClose,
}: ThemedActivityFinderProps) {
  const { language } = useTranslation();
  const [step, setStep] = useState<FinderStep>('collections');
  const [selectedTheme, setSelectedTheme] = useState<ActivityTheme | undefined>();
  const [selectedOccasion, setSelectedOccasion] = useState<OccasionType | undefined>();
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<AgeGroup | undefined>();

  const isChinese = language === 'zh';

  const searchResults = useMemo(() => {
    if (step !== 'results') return null;
    return searchByTheme(locations, {
      theme: selectedTheme,
      occasion: selectedOccasion,
      ageGroup: selectedAgeGroup,
      maxResults: 15,
    });
  }, [step, locations, selectedTheme, selectedOccasion, selectedAgeGroup]);

  function handleCollectionSelect(searchParams: {
    theme?: ActivityTheme;
    occasion?: OccasionType;
    ageGroup?: AgeGroup;
  }) {
    setSelectedTheme(searchParams.theme);
    setSelectedOccasion(searchParams.occasion);
    setSelectedAgeGroup(searchParams.ageGroup);
    setStep('results');
  }

  function handleSearch() {
    setStep('results');
  }

  function handleReset() {
    setSelectedTheme(undefined);
    setSelectedOccasion(undefined);
    setSelectedAgeGroup(undefined);
    setStep('collections');
  }

  const featuredCollections = getFeaturedCollections();

  return (
    <div className="themed-finder" role="dialog" aria-modal="true" aria-label={isChinese ? '主題活動探索' : 'Themed Activity Finder'}>
      {/* Header */}
      <div className="themed-finder__header">
        <div className="themed-finder__header-left">
          {step !== 'collections' && (
            <button
              className="themed-finder__back-btn"
              onClick={() => setStep(step === 'results' ? 'filters' : 'collections')}
              aria-label={isChinese ? '返回' : 'Back'}
            >
              <ArrowLeft size={18} />
            </button>
          )}
          <Compass size={20} className="themed-finder__header-icon" />
          <h2 className="themed-finder__title">
            {isChinese ? '主題活動探索' : 'Themed Activity Finder'}
          </h2>
        </div>
        <button
          className="themed-finder__close-btn"
          onClick={onClose}
          aria-label={isChinese ? '關閉' : 'Close'}
        >
          <X size={20} />
        </button>
      </div>

      {/* Step indicator */}
      <div className="themed-finder__steps">
        {['collections', 'filters', 'results'].map((s, i) => (
          <div
            key={s}
            className={`themed-finder__step ${step === s ? 'themed-finder__step--active' : ''} ${
              ['collections', 'filters', 'results'].indexOf(step) > i ? 'themed-finder__step--done' : ''
            }`}
          >
            <span className="themed-finder__step-num">{i + 1}</span>
            <span className="themed-finder__step-label">
              {isChinese
                ? ['精選主題', '細化篩選', '探索結果'][i]
                : ['Collections', 'Filters', 'Results'][i]}
            </span>
          </div>
        ))}
      </div>

      <div className="themed-finder__body">
        {/* Step 1: Featured Collections */}
        {step === 'collections' && (
          <div className="themed-finder__collections">
            <p className="themed-finder__subtitle">
              {isChinese
                ? '選擇精選主題，快速找到合適景點'
                : 'Pick a curated collection to find the perfect venue fast'}
            </p>
            <div className="themed-finder__collection-grid">
              {featuredCollections.map(col => (
                <button
                  key={col.id}
                  className="themed-finder__collection-card"
                  onClick={() => handleCollectionSelect(col.searchParams)}
                >
                  <span className="themed-finder__collection-icon">{col.icon}</span>
                  <div className="themed-finder__collection-info">
                    <span className="themed-finder__collection-name">
                      {isChinese ? col.label.zh : col.label.en}
                    </span>
                    <span className="themed-finder__collection-desc">
                      {isChinese ? col.description.zh : col.description.en}
                    </span>
                  </div>
                  <ChevronRight size={16} className="themed-finder__collection-arrow" />
                </button>
              ))}
            </div>
            <div className="themed-finder__divider">
              <span>{isChinese ? '或者自訂篩選' : 'Or customize your search'}</span>
            </div>
            <button
              className="themed-finder__custom-btn"
              onClick={() => setStep('filters')}
            >
              {isChinese ? '自訂篩選條件' : 'Custom Filters'}
              <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* Step 2: Filters */}
        {step === 'filters' && (
          <div className="themed-finder__filters">
            <p className="themed-finder__subtitle">
              {isChinese ? '選擇任意組合，不限制必須全選' : 'Mix and match — no need to select all'}
            </p>

            {/* Activity Theme */}
            <div className="themed-finder__filter-group">
              <h3 className="themed-finder__filter-title">
                {isChinese ? '活動主題' : 'Activity Theme'}
              </h3>
              <div className="themed-finder__filter-chips">
                {ACTIVITY_THEMES.map(theme => (
                  <button
                    key={theme.id}
                    className={`themed-finder__chip ${selectedTheme === theme.id ? 'themed-finder__chip--active' : ''}`}
                    onClick={() =>
                      setSelectedTheme(prev => (prev === theme.id ? undefined : theme.id))
                    }
                  >
                    <span>{theme.icon}</span>
                    <span>{isChinese ? theme.label.zh : theme.label.en}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Occasion */}
            <div className="themed-finder__filter-group">
              <h3 className="themed-finder__filter-title">
                {isChinese ? '出遊場合' : 'Occasion'}
              </h3>
              <div className="themed-finder__filter-chips">
                {OCCASIONS.map(occ => (
                  <button
                    key={occ.id}
                    className={`themed-finder__chip ${selectedOccasion === occ.id ? 'themed-finder__chip--active' : ''}`}
                    onClick={() =>
                      setSelectedOccasion(prev => (prev === occ.id ? undefined : occ.id))
                    }
                  >
                    <span>{occ.icon}</span>
                    <span>{isChinese ? occ.label.zh : occ.label.en}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Age Group */}
            <div className="themed-finder__filter-group">
              <h3 className="themed-finder__filter-title">
                {isChinese ? '孩子年齡' : 'Child Age Group'}
              </h3>
              <div className="themed-finder__filter-chips">
                {AGE_GROUPS.map(ag => (
                  <button
                    key={ag.id}
                    className={`themed-finder__chip ${selectedAgeGroup === ag.id ? 'themed-finder__chip--active' : ''}`}
                    onClick={() =>
                      setSelectedAgeGroup(prev => (prev === ag.id ? undefined : ag.id))
                    }
                  >
                    <span>{ag.icon}</span>
                    <span>{isChinese ? ag.label.zh : ag.label.en}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              className="themed-finder__search-btn"
              onClick={handleSearch}
              disabled={!selectedTheme && !selectedOccasion && !selectedAgeGroup}
            >
              {isChinese ? '開始探索' : 'Find Venues'}
              <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* Step 3: Results */}
        {step === 'results' && searchResults && (
          <div className="themed-finder__results">
            {/* Active filters */}
            <div className="themed-finder__active-filters">
              {searchResults.appliedFilters.map(filter => (
                <span key={filter} className="themed-finder__active-filter-tag">
                  {filter}
                </span>
              ))}
              <span className="themed-finder__result-count">
                {isChinese
                  ? `找到 ${searchResults.totalMatched} 個景點`
                  : `${searchResults.totalMatched} venues found`}
              </span>
            </div>

            {searchResults.results.length === 0 ? (
              <div className="themed-finder__empty">
                <AlertCircle size={40} />
                <p>
                  {isChinese
                    ? '找不到符合條件的景點，請試著放寬篩選條件。'
                    : 'No venues match these filters. Try relaxing your criteria.'}
                </p>
                <button className="themed-finder__reset-btn" onClick={handleReset}>
                  {isChinese ? '重新搜尋' : 'Start Over'}
                </button>
              </div>
            ) : (
              <div className="themed-finder__result-list">
                {searchResults.results.map((result, index) => (
                  <ThemedVenueCard
                    key={result.location.id}
                    result={result}
                    rank={index + 1}
                    isChinese={isChinese}
                    onSelect={() => {
                      onSelectLocation(result.location.id);
                      onClose();
                    }}
                  />
                ))}
              </div>
            )}

            <button className="themed-finder__reset-btn themed-finder__reset-btn--bottom" onClick={handleReset}>
              {isChinese ? '重新搜尋' : 'New Search'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Venue Card Sub-component ─────────────────────────────────────────────────

interface ThemedVenueCardProps {
  result: ThemedVenueResult;
  rank: number;
  isChinese: boolean;
  onSelect: () => void;
}

function ThemedVenueCard({ result, rank, isChinese, onSelect }: ThemedVenueCardProps) {
  const { location, totalScore, matchReasons, warnings, highlights } = result;
  const name = isChinese ? location.name.zh : location.name.en;
  const address = isChinese ? location.address.zh : location.address.en;

  const scoreColor =
    totalScore >= 75 ? '#4caf50' : totalScore >= 50 ? '#ff9800' : '#9e9e9e';

  return (
    <div className="themed-venue-card" onClick={onSelect} role="button" tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onSelect()}
    >
      <div className="themed-venue-card__rank">#{rank}</div>

      <div className="themed-venue-card__main">
        <div className="themed-venue-card__header">
          <h3 className="themed-venue-card__name">{name}</h3>
          <div
            className="themed-venue-card__score"
            style={{ color: scoreColor }}
            title={isChinese ? '匹配分數' : 'Match score'}
          >
            {totalScore}%
          </div>
        </div>

        <p className="themed-venue-card__address">{address}</p>

        {/* Rating */}
        <div className="themed-venue-card__rating">
          <Star size={13} fill="#FFB300" stroke="#FFB300" />
          <span>{location.averageRating.toFixed(1)}</span>
          <span className="themed-venue-card__category">
            · {location.category.replace('_', ' ')}
          </span>
        </div>

        {/* Match reasons */}
        {matchReasons.length > 0 && (
          <div className="themed-venue-card__reasons">
            {matchReasons.map((reason, i) => (
              <span key={i} className="themed-venue-card__reason">
                <CheckCircle size={11} />
                {isChinese ? reason.zh : reason.en}
              </span>
            ))}
          </div>
        )}

        {/* Warnings */}
        {warnings.length > 0 && (
          <div className="themed-venue-card__warnings">
            {warnings.map((warning, i) => (
              <span key={i} className="themed-venue-card__warning">
                <AlertCircle size={11} />
                {isChinese ? warning.zh : warning.en}
              </span>
            ))}
          </div>
        )}

        {/* Facility highlights */}
        {highlights.length > 0 && (
          <div className="themed-venue-card__highlights">
            {highlights.map(h => (
              <span key={h} className="themed-venue-card__highlight-tag">
                {h.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        )}
      </div>

      <ChevronRight size={16} className="themed-venue-card__arrow" />
    </div>
  );
}
