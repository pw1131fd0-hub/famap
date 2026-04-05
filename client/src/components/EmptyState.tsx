import { Search, Heart, Filter, MapPin } from 'lucide-react';
import { useTranslation } from '../i18n/useTranslation';

interface EmptyStateProps {
  type: 'no-results' | 'no-favorites' | 'no-visited' | 'error';
  searchQuery?: string;
  selectedCategory?: string;
  onAction?: () => void;
}

export function EmptyState({ type, searchQuery, onAction }: EmptyStateProps) {
  const { language, t } = useTranslation();

  const content = {
    'no-results': {
      icon: Search,
      title: searchQuery
        ? (language === 'zh' ? `找不到「${searchQuery}」的結果` : `No results for "${searchQuery}"`)
        : (language === 'zh' ? '此地區沒有地點' : 'No locations in this area'),
      subtitle: searchQuery
        ? (language === 'zh' ? '嘗試不同的關鍵字或移除部分篩選條件' : 'Try different keywords or remove some filters')
        : (language === 'zh' ? '嘗試放大地圖或移動到其他區域' : 'Try zooming out or moving to another area'),
      action: searchQuery ? t.common.clearSearch : null,
    },
    'no-favorites': {
      icon: Heart,
      title: language === 'zh' ? '還沒有收藏' : 'No favorites yet',
      subtitle: language === 'zh' ? '點擊心形圖標來收藏喜愛的地點' : 'Tap the heart icon to save places you love',
      action: language === 'zh' ? '開始探索' : 'Start exploring',
    },
    'no-visited': {
      icon: MapPin,
      title: language === 'zh' ? '還沒有去過的地方' : 'No visited places yet',
      subtitle: language === 'zh' ? '造訪地點後會自動記錄在這裡' : 'Places you visit will be recorded here automatically',
      action: language === 'zh' ? '開始探索' : 'Start exploring',
    },
    'error': {
      icon: Filter,
      title: language === 'zh' ? '載入失敗' : 'Failed to load',
      subtitle: language === 'zh' ? '請檢查網路連線或稍後再試' : 'Please check your connection or try again',
      action: language === 'zh' ? '重試' : 'Retry',
    },
  };

  const { icon: Icon, title, subtitle, action } = content[type];

  return (
    <div className="empty-state" role="status" aria-live="polite">
      <div className="empty-state-icon">
        <Icon size={48} strokeWidth={1.5} />
      </div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-subtitle">{subtitle}</p>
      {action && onAction && (
        <button className="empty-state-action" onClick={onAction}>
          {action}
        </button>
      )}
      {type === 'no-results' && (
        <div className="empty-state-suggestions">
          <p className="empty-state-suggestions-title">
            💡 {language === 'zh' ? '建議' : 'Suggestions'}:
          </p>
          <ul>
            {language === 'zh' ? (
              <>
                <li>嘗試更廣泛的搜尋關鍵詞</li>
                <li>移除部分篩選條件</li>
                <li>放大地圖查看更多區域</li>
                <li>切換到其他城市</li>
              </>
            ) : (
              <>
                <li>Try broader search terms</li>
                <li>Remove some filters</li>
                <li>Zoom out to see more area</li>
                <li>Try a different city</li>
              </>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

// Mini empty state for inline use
export function MiniEmptyState({ message }: { message: string }) {
  return (
    <div className="mini-empty-state" role="status">
      <span>{message}</span>
    </div>
  );
}
