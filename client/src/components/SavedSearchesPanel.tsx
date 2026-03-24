import { X, Copy, Trash2, Star } from 'lucide-react';
import { useState } from 'react';
import {
  deleteSavedSearch,
  recordSearchUsage,
  duplicateSavedSearch,
  getSortedSearches
} from '../utils/savedSearches';
import type { SavedSearch } from '../utils/savedSearches';

interface SavedSearchesPanelProps {
  onClose: () => void;
  onSelectSearch: (search: SavedSearch) => void;
  language: 'zh' | 'en';
}

export function SavedSearchesPanel({
  onClose,
  onSelectSearch,
  language
}: SavedSearchesPanelProps) {
  const [searches, setSearches] = useState<SavedSearch[]>(getSortedSearches('recent'));
  const [sortBy, setSortBy] = useState<'recent' | 'frequency' | 'created'>('recent');

  const labels = {
    zh: {
      savedSearches: '保存的搜尋',
      noSearches: '還沒有保存的搜尋',
      recent: '最近',
      frequency: '常用',
      created: '建立時間',
      duplicate: '複製',
      delete: '刪除',
      sortBy: '排序方式',
      timesUsed: '次',
      createdOn: '建立於',
      lastUsed: '最後使用'
    },
    en: {
      savedSearches: 'Saved Searches',
      noSearches: 'No saved searches yet',
      recent: 'Recent',
      frequency: 'Frequency',
      created: 'Created',
      duplicate: 'Duplicate',
      delete: 'Delete',
      sortBy: 'Sort by',
      timesUsed: 'times',
      createdOn: 'Created on',
      lastUsed: 'Last used'
    }
  };

  const t = labels[language];

  const handleSelectSearch = (search: SavedSearch) => {
    recordSearchUsage(search.id);
    setSearches(getSortedSearches(sortBy));
    onSelectSearch(search);
  };

  const handleDeleteSearch = (id: string) => {
    if (confirm(language === 'zh' ? '確認刪除此搜尋?' : 'Confirm delete this search?')) {
      deleteSavedSearch(id);
      setSearches(getSortedSearches(sortBy));
    }
  };

  const handleDuplicateSearch = (search: SavedSearch) => {
    const newName = language === 'zh' ? `${search.name} (複製)` : `${search.name} (Copy)`;
    duplicateSavedSearch(search.id, newName);
    setSearches(getSortedSearches(sortBy));
  };

  const handleSortChange = (newSort: typeof sortBy) => {
    setSortBy(newSort);
    setSearches(getSortedSearches(newSort));
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(language === 'zh' ? 'zh-TW' : 'en-US');
  };

  return (
    <div className="saved-searches-panel">
      <header className="search-header">
        <h2>{t.savedSearches}</h2>
        <button onClick={onClose} className="close-button" aria-label="Close">
          <X size={20} />
        </button>
      </header>

      <div className="searches-controls">
        <div className="sort-controls">
          <label>{t.sortBy}:</label>
          <div className="sort-buttons">
            <button
              className={`sort-btn ${sortBy === 'recent' ? 'active' : ''}`}
              onClick={() => handleSortChange('recent')}
            >
              {t.recent}
            </button>
            <button
              className={`sort-btn ${sortBy === 'frequency' ? 'active' : ''}`}
              onClick={() => handleSortChange('frequency')}
            >
              {t.frequency}
            </button>
            <button
              className={`sort-btn ${sortBy === 'created' ? 'active' : ''}`}
              onClick={() => handleSortChange('created')}
            >
              {t.created}
            </button>
          </div>
        </div>
      </div>

      <div className="searches-list-wrapper">
        {searches.length > 0 ? (
          <ul className="searches-list">
            {searches.map((search) => (
              <li key={search.id} className="search-item">
                <button
                  className="search-item-content"
                  onClick={() => handleSelectSearch(search)}
                >
                  <div className="search-item-header">
                    <span className="search-item-name">{search.name}</span>
                    {search.usageCount > 0 && (
                      <span className="search-item-badge">
                        <Star size={12} /> {search.usageCount}
                      </span>
                    )}
                  </div>
                  <div className="search-item-query">{search.query}</div>
                  <div className="search-item-meta">
                    <span className="meta-info">
                      {language === 'zh' ? '建立於' : 'Created'}: {formatDate(search.createdAt)}
                    </span>
                    {search.lastUsed && (
                      <span className="meta-info">
                        {language === 'zh' ? '最後使用' : 'Last used'}: {formatDate(search.lastUsed)}
                      </span>
                    )}
                  </div>
                </button>

                <div className="search-item-actions">
                  <button
                    className="action-btn duplicate"
                    onClick={() => handleDuplicateSearch(search)}
                    title={t.duplicate}
                    aria-label={t.duplicate}
                  >
                    <Copy size={16} />
                  </button>
                  <button
                    className="action-btn delete"
                    onClick={() => handleDeleteSearch(search.id)}
                    title={t.delete}
                    aria-label={t.delete}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="no-searches">
            <p>{t.noSearches}</p>
          </div>
        )}
      </div>
    </div>
  );
}
