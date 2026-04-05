import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Search, X, Loader } from 'lucide-react';
import { locationApi } from '../services/api';
import type { Location } from '../types';

interface QuickSearchProps {
  lang: 'zh' | 'en';
  onSelectLocation?: (location: Location) => void;
  placeholder?: string;
  className?: string;
}

const i18n = {
  zh: {
    placeholder: '搜尋地點、餐廳、公園…',
    noResults: '找不到相關地點',
    searching: '搜尋中…',
    results: (n: number) => `找到 ${n} 個地點`,
    categories: {
      park: '公園',
      nursing_room: '哺乳室',
      restaurant: '親子餐廳',
      medical: '醫療',
      attraction: '景點',
      other: '其他',
    } as Record<string, string>,
  },
  en: {
    placeholder: 'Search locations, restaurants, parks…',
    noResults: 'No locations found',
    searching: 'Searching…',
    results: (n: number) => `Found ${n} location${n !== 1 ? 's' : ''}`,
    categories: {
      park: 'Park',
      nursing_room: 'Nursing Room',
      restaurant: 'Restaurant',
      medical: 'Medical',
      attraction: 'Attraction',
      other: 'Other',
    } as Record<string, string>,
  },
};

const CATEGORY_ICONS: Record<string, string> = {
  park: '🌳',
  nursing_room: '🤱',
  restaurant: '🍽️',
  medical: '🏥',
  attraction: '🎡',
  other: '📍',
};

export const QuickSearch: React.FC<QuickSearchProps> = ({
  lang,
  onSelectLocation,
  placeholder,
  className = '',
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Location[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const t = i18n[lang];
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      setTotal(0);
      setOpen(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await locationApi.search({ q: q.trim(), page_size: 6 });
      setResults(data.items);
      setTotal(data.total);
      setOpen(true);
    } catch {
      setError(lang === 'zh' ? '搜尋失敗，請再試一次' : 'Search failed, please try again');
      setResults([]);
      setOpen(true);
    } finally {
      setLoading(false);
    }
  }, [lang]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(val), 300);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setTotal(0);
    setOpen(false);
    setError(null);
  };

  const handleSelect = (loc: Location) => {
    setQuery(loc.name[lang]);
    setOpen(false);
    onSelectLocation?.(loc);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  return (
    <div ref={containerRef} className={`quick-search${className ? ` ${className}` : ''}`} style={{ position: 'relative', width: '100%' }}>
      <div className="quick-search__input-wrap" style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: '1.5px solid #A7C7E7', borderRadius: 12, padding: '8px 12px', boxShadow: '0 2px 8px rgba(167,199,231,0.18)' }}>
        {loading
          ? <Loader size={18} color="#A7C7E7" style={{ animation: 'spin 1s linear infinite', flexShrink: 0 }} />
          : <Search size={18} color="#A7C7E7" style={{ flexShrink: 0 }} />
        }
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => { if (results.length > 0) setOpen(true); }}
          placeholder={placeholder ?? t.placeholder}
          aria-label={placeholder ?? t.placeholder}
          style={{ flex: 1, border: 'none', outline: 'none', fontSize: 15, background: 'transparent', color: '#333', fontFamily: "'Noto Sans TC', sans-serif" }}
        />
        {query && (
          <button onClick={handleClear} aria-label="Clear search" style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
            <X size={16} color="#aaa" />
          </button>
        )}
      </div>

      {open && (
        <div
          className="quick-search__dropdown"
          role="listbox"
          style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1.5px solid #A7C7E7', borderRadius: 12, marginTop: 4, zIndex: 1000, overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}
        >
          {error && (
            <div style={{ padding: '10px 14px', color: '#FF6F61', fontSize: 14 }}>{error}</div>
          )}
          {!error && results.length === 0 && !loading && (
            <div style={{ padding: '10px 14px', color: '#999', fontSize: 14 }}>{t.noResults}</div>
          )}
          {results.length > 0 && (
            <>
              <div style={{ padding: '6px 14px', fontSize: 12, color: '#999', borderBottom: '1px solid #f0f0f0' }}>
                {t.results(total)}
              </div>
              {results.map((loc) => (
                <button
                  key={loc.id}
                  role="option"
                  onClick={() => handleSelect(loc)}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 14px', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', borderBottom: '1px solid #f5f5f5', transition: 'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#f7f3ff')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                >
                  <span style={{ fontSize: 20, flexShrink: 0 }}>{CATEGORY_ICONS[loc.category] ?? '📍'}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#333', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {loc.name[lang]}
                    </div>
                    <div style={{ fontSize: 12, color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {t.categories[loc.category] ?? loc.category} · {loc.address[lang]}
                    </div>
                  </div>
                  {loc.averageRating > 0 && (
                    <span style={{ fontSize: 12, color: '#FDCB2F', fontWeight: 700, flexShrink: 0 }}>
                      ★ {loc.averageRating.toFixed(1)}
                    </span>
                  )}
                </button>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default QuickSearch;
