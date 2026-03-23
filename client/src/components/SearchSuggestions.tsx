import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import type { Location } from '../types';

interface SearchSuggestionsProps {
  query: string;
  locations: Location[];
  language: string;
  onSelectSuggestion: (location: Location) => void;
  onClearQuery: () => void;
}

export function SearchSuggestions({
  query,
  locations,
  language,
  onSelectSuggestion,
}: SearchSuggestionsProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const filteredSuggestions = query.trim() ? locations.filter(loc => {
    const query_lower = query.toLowerCase();
    return (
      loc.name.zh.toLowerCase().includes(query_lower) ||
      loc.name.en.toLowerCase().includes(query_lower) ||
      loc.address.zh?.toLowerCase().includes(query_lower) ||
      loc.address.en?.toLowerCase().includes(query_lower)
    );
  }).slice(0, 5) : [];

  useEffect(() => {
    setShowSuggestions(query.trim().length > 0 && filteredSuggestions.length > 0);
    setSelectedIndex(-1);
  }, [query, filteredSuggestions.length]);

  if (!showSuggestions) return null;

  return (
    <div className="search-suggestions">
      {filteredSuggestions.map((loc, idx) => (
        <button
          key={loc.id}
          className={`suggestion-item ${idx === selectedIndex ? 'selected' : ''}`}
          onClick={() => {
            onSelectSuggestion(loc);
            setShowSuggestions(false);
          }}
          onMouseEnter={() => setSelectedIndex(idx)}
        >
          <Search size={14} className="suggestion-icon" />
          <div className="suggestion-content">
            <div className="suggestion-name">
              {loc.name[language as keyof typeof loc.name]}
            </div>
            <div className="suggestion-address">
              {loc.address[language as keyof typeof loc.address]}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
