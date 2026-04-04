import { useState, useEffect, useCallback } from 'react';
import { CheckSquare, Square, Package, RotateCcw, ChevronDown } from 'lucide-react';
import type { Category } from '../types';
import {
  generatePackingList,
  saveChecklistState,
  loadChecklistState,
  clearChecklistState,
  type ChecklistItem,
  type PackingList,
} from '../utils/packingChecklist';

interface SmartPackingChecklistProps {
  locationId: string;
  venueCategory: Category;
  childAgeMonths?: number;
  language: 'zh' | 'en';
}

interface SectionProps {
  title: string;
  items: ChecklistItem[];
  checkedIds: Set<string>;
  onToggle: (id: string) => void;
  language: 'zh' | 'en';
  defaultOpen?: boolean;
}

function ChecklistSection({ title, items, checkedIds, onToggle, language, defaultOpen = true }: SectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const checked = items.filter(i => checkedIds.has(i.id)).length;

  if (items.length === 0) return null;

  return (
    <div className="packing-section">
      <button
        className="packing-section-header"
        onClick={() => setIsOpen(o => !o)}
        aria-expanded={isOpen}
      >
        <span className="packing-section-title">{title}</span>
        <span className="packing-section-meta">
          {checked}/{items.length}
          <span
            className="packing-section-chevron"
            style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
          >
            <ChevronDown size={14} />
          </span>
        </span>
      </button>
      {isOpen && (
        <ul className="packing-item-list" role="list">
          {items.map(item => {
            const isChecked = checkedIds.has(item.id);
            return (
              <li key={item.id} className={`packing-item ${isChecked ? 'checked' : ''}`}>
                <button
                  className="packing-item-btn"
                  onClick={() => onToggle(item.id)}
                  aria-checked={isChecked}
                  role="checkbox"
                  aria-label={language === 'zh' ? item.nameZh : item.nameEn}
                >
                  {isChecked
                    ? <CheckSquare size={16} className="packing-icon checked" />
                    : <Square size={16} className="packing-icon" />
                  }
                  <span className="packing-emoji" aria-hidden="true">{item.emoji}</span>
                  <span className="packing-name">
                    {language === 'zh' ? item.nameZh : item.nameEn}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export function SmartPackingChecklist({
  locationId,
  venueCategory,
  childAgeMonths,
  language,
}: SmartPackingChecklistProps) {
  const [list, setList] = useState<PackingList>({ essential: [], recommended: [], optional: [] });
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const generated = generatePackingList(venueCategory, childAgeMonths);
    setList(generated);
    const saved = loadChecklistState(locationId);
    setCheckedIds(saved);
  }, [locationId, venueCategory, childAgeMonths]);

  const handleToggle = useCallback((id: string) => {
    setCheckedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      saveChecklistState(locationId, next);
      return next;
    });
  }, [locationId]);

  const handleReset = useCallback(() => {
    setCheckedIds(new Set());
    clearChecklistState(locationId);
  }, [locationId]);

  const totalItems = list.essential.length + list.recommended.length + list.optional.length;
  const totalChecked = Array.from(checkedIds).filter(id =>
    [...list.essential, ...list.recommended, ...list.optional].some(i => i.id === id)
  ).length;

  const isZh = language === 'zh';

  const labels = {
    title: isZh ? '出發前準備清單' : 'Packing Checklist',
    essential: isZh ? '必備物品' : 'Essential',
    recommended: isZh ? '建議攜帶' : 'Recommended',
    optional: isZh ? '視需求攜帶' : 'Optional',
    reset: isZh ? '重置清單' : 'Reset',
    progress: isZh ? `已勾選 ${totalChecked}/${totalItems} 項` : `${totalChecked}/${totalItems} items checked`,
    allDone: isZh ? '全部準備好了！出發！' : 'All packed! Let\'s go!',
    expand: isZh ? '展開清單' : 'Show Checklist',
    collapse: isZh ? '收起清單' : 'Hide Checklist',
  };

  return (
    <div className="smart-packing-checklist" data-testid="smart-packing-checklist">
      <button
        className="packing-header-toggle"
        onClick={() => setIsExpanded(e => !e)}
        aria-expanded={isExpanded}
      >
        <span className="packing-header-left">
          <Package size={16} aria-hidden="true" />
          <span className="packing-header-title">{labels.title}</span>
        </span>
        <span className="packing-header-right">
          {totalItems > 0 && (
            <span className={`packing-progress-badge ${totalChecked === totalItems ? 'complete' : ''}`}>
              {totalChecked === totalItems && totalItems > 0 ? '✓' : `${totalChecked}/${totalItems}`}
            </span>
          )}
          <ChevronDown
            size={14}
            style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
          />
        </span>
      </button>

      {isExpanded && (
        <div className="packing-body">
          {totalChecked === totalItems && totalItems > 0 ? (
            <p className="packing-all-done">{labels.allDone}</p>
          ) : (
            <p className="packing-progress-text">{labels.progress}</p>
          )}

          <ChecklistSection
            title={labels.essential}
            items={list.essential}
            checkedIds={checkedIds}
            onToggle={handleToggle}
            language={language}
            defaultOpen={true}
          />
          <ChecklistSection
            title={labels.recommended}
            items={list.recommended}
            checkedIds={checkedIds}
            onToggle={handleToggle}
            language={language}
            defaultOpen={true}
          />
          <ChecklistSection
            title={labels.optional}
            items={list.optional}
            checkedIds={checkedIds}
            onToggle={handleToggle}
            language={language}
            defaultOpen={false}
          />

          {totalChecked > 0 && (
            <button className="packing-reset-btn" onClick={handleReset} aria-label={labels.reset}>
              <RotateCcw size={13} />
              {labels.reset}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
