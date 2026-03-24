import { X, Clock, Zap, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import {
  searchLocations,
  getSearchHistory,
  saveSearchToHistory,
  clearSearchHistory,
  generateSearchSuggestions
} from '../utils/searchUtils';
import type { Location } from '../types';
import type { SearchResult, SearchHistory } from '../utils/searchUtils';

interface EnhancedSearchPanelProps {
  locations: Location[];
  userLocation: { lat: number; lng: number };
  onSelectLocation: (location: Location, matchReason: string) => void;
  onClose: () => void;
  language: 'zh' | 'en';
}

export function EnhancedSearchPanel({
  locations,
  userLocation,
  onSelectLocation,
  onClose,
  language
}: EnhancedSearchPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [history, setHistory] = useState<SearchHistory[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);

  // Load history and suggestions on mount
  // Legitimate use: Synchronizing external data (localStorage history) with React state.
  // The effect runs on mount and when dependencies change, loading fresh data from storage.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHistory(getSearchHistory());
     
    setSuggestions(generateSearchSuggestions(locations, language));
  }, [locations, language]);

  // Perform search when query changes
  // Legitimate use: Reactive search updates - computing derived state (search results) based on query changes.
  // The effect synchronizes user input with search results, which is a derived output, not an external system.
  useEffect(() => {
    if (searchQuery.trim()) {
      const results = searchLocations(
        locations,
        searchQuery,
        userLocation,
        15 // Limit to top 15 results
      );
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSearchResults(results);
       
      setShowResults(true);
    } else {
       
      setSearchResults([]);
       
      setShowResults(false);
    }
  }, [searchQuery, locations, userLocation]);

  const handleResultClick = (result: SearchResult) => {
    saveSearchToHistory(searchQuery, searchResults.length);
    setHistory(getSearchHistory());
    onSelectLocation(result.location, result.matchReason);
    onClose();
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
  };

  const handleHistoryClick = (query: string) => {
    setSearchQuery(query);
  };

  const handleClearHistory = () => {
    clearSearchHistory();
    setHistory([]);
  };

  const labels = {
    zh: {
      search: '搜尋位置',
      results: '搜尋結果',
      recentSearches: '最近搜尋',
      suggestions: '建議搜尋',
      noResults: '無結果',
      clearHistory: '清除記錄',
      resultOf: '個結果'
    },
    en: {
      search: 'Search locations',
      results: 'Search results',
      recentSearches: 'Recent searches',
      suggestions: 'Suggestions',
      noResults: 'No results',
      clearHistory: 'Clear history',
      resultOf: 'results'
    }
  };

  const t = labels[language];

  return (
    <div className="enhanced-search-panel">
      <header className="search-header">
        <h2>{t.search}</h2>
        <button onClick={onClose} className="close-button" aria-label="Close search">
          <X size={20} />
        </button>
      </header>

      <div className="search-input-wrapper">
        <input
          type="text"
          placeholder={t.search}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input-field"
          autoFocus
          aria-label="Search locations"
        />
        {searchQuery && (
          <button
            onClick={() => {
              setSearchQuery('');
              setShowResults(false);
            }}
            className="clear-search-button"
            aria-label="Clear search"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <div className="search-content">
        {showResults && (
          <section className="search-results-section">
            <h3 className="section-title">
              {t.results}
              {searchResults.length > 0 && (
                <span className="result-count"> ({searchResults.length})</span>
              )}
            </h3>

            {searchResults.length > 0 ? (
              <ul className="search-results-list" role="listbox">
                {searchResults.map((result) => (
                  <li key={result.location.id} role="option">
                    <button
                      onClick={() => handleResultClick(result)}
                      className="search-result-item"
                    >
                      <div className="result-header">
                        <span className="result-name">
                          {language === 'zh'
                            ? result.location.name.zh
                            : result.location.name.en}
                        </span>
                        <span className="result-score">
                          {Math.round(result.relevanceScore)}%
                        </span>
                      </div>
                      <div className="result-meta">
                        <span className="result-reason">{result.matchReason}</span>
                        {result.location.averageRating && (
                          <span className="result-rating">
                            ⭐ {result.location.averageRating.toFixed(1)}
                          </span>
                        )}
                      </div>
                      <span className="result-category">
                        {language === 'zh'
                          ? getCategoryLabelZh(result.location.category)
                          : result.location.category}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-results">{t.noResults}</p>
            )}
          </section>
        )}

        {!showResults && (
          <>
            {suggestions.length > 0 && (
              <section className="suggestions-section">
                <h3 className="section-title">
                  <Zap size={16} className="section-icon" />
                  {t.suggestions}
                </h3>
                <div className="suggestions-grid">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="suggestion-button"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </section>
            )}

            {history.length > 0 && (
              <section className="history-section">
                <div className="history-header">
                  <h3 className="section-title">
                    <Clock size={16} className="section-icon" />
                    {t.recentSearches}
                  </h3>
                  <button
                    onClick={handleClearHistory}
                    className="clear-history-button"
                    title={t.clearHistory}
                    aria-label={t.clearHistory}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <ul className="history-list">
                  {history.map((item) => (
                    <li key={`${item.query}-${item.timestamp}`}>
                      <button
                        onClick={() => handleHistoryClick(item.query)}
                        className="history-item"
                      >
                        <span className="history-query">{item.query}</span>
                        <span className="history-count">
                          {item.resultCount} {t.resultOf}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function getCategoryLabelZh(category: string): string {
  const labels: Record<string, string> = {
    park: '公園',
    restaurant: '餐廳',
    nursing_room: '哺乳室',
    medical: '醫療',
    attraction: '景點',
    other: '其他'
  };
  return labels[category] || category;
}
