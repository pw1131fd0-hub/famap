import { X, Lightbulb, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from '../i18n/useTranslation';

interface Tip {
  id: string;
  titleZh: string;
  titleEn: string;
  descriptionZh: string;
  descriptionEn: string;
  category: 'getting-started' | 'features' | 'tips' | 'safety';
  priority: number; // Lower = higher priority
  dismissible: boolean;
}

const TIPS: Tip[] = [
  {
    id: 'welcome',
    titleZh: '歡迎使用親子地圖',
    titleEn: 'Welcome to FamMap',
    descriptionZh: '親子地圖幫助您發現台灣最適合家庭的地點。開始探索吧！',
    descriptionEn: 'FamMap helps you discover family-friendly locations in Taiwan. Let\'s explore!',
    category: 'getting-started',
    priority: 1,
    dismissible: true,
  },
  {
    id: 'search-feature',
    titleZh: '快速搜尋',
    titleEn: 'Smart Search',
    descriptionZh: '使用搜尋功能快速找到您想要的地點。支持按名稱、類別或設施篩選。',
    descriptionEn: 'Use the search feature to quickly find locations you need. Filter by name, category, or facilities.',
    category: 'features',
    priority: 2,
    dismissible: true,
  },
  {
    id: 'family-profile',
    titleZh: '家庭檔案',
    titleEn: 'Family Profile',
    descriptionZh: '建立您的家庭檔案，包括孩子年齡和特殊需求，獲得更個性化的推薦。',
    descriptionEn: 'Create your family profile with children ages and special needs for personalized recommendations.',
    category: 'features',
    priority: 3,
    dismissible: true,
  },
  {
    id: 'saved-places',
    titleZh: '儲存最愛',
    titleEn: 'Save Favorites',
    descriptionZh: '點擊心形圖標儲存您喜愛的地點，方便下次快速查找。',
    descriptionEn: 'Click the heart icon to save favorite locations for quick access later.',
    category: 'features',
    priority: 4,
    dismissible: true,
  },
  {
    id: 'route-planning',
    titleEn: 'Route Planning',
    titleZh: '路線規劃',
    descriptionZh: '規劃您的家庭郊遊路線，包括多個景點和停留時間建議。',
    descriptionEn: 'Plan your family outing routes with multiple locations and timing suggestions.',
    category: 'features',
    priority: 5,
    dismissible: true,
  },
  {
    id: 'crowdedness-info',
    titleZh: '擁擠程度',
    titleEn: 'Crowdedness Info',
    descriptionZh: '查看其他家長提供的即時擁擠程度報告，選擇最佳訪問時間。',
    descriptionEn: 'Check real-time crowdedness reports from other parents to choose the best time to visit.',
    category: 'tips',
    priority: 6,
    dismissible: true,
  },
];

interface SmartTipsPanelProps {
  visible: boolean;
  onClose: () => void;
}

export function SmartTipsPanel({ visible, onClose }: SmartTipsPanelProps) {
  const { language } = useTranslation();
  const [dismissedTips, setDismissedTips] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('dismissedTips');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  const activeTips = TIPS.filter(tip => !dismissedTips.has(tip.id))
    .sort((a, b) => a.priority - b.priority);

  const handleDismissTip = (tipId: string) => {
    const updated = new Set(dismissedTips);
    updated.add(tipId);
    setDismissedTips(updated);
    localStorage.setItem('dismissedTips', JSON.stringify(Array.from(updated)));
  };

  if (!visible || activeTips.length === 0) {
    return null;
  }

  const currentTip = activeTips[0];
  const title = language === 'zh' ? currentTip.titleZh : currentTip.titleEn;
  const description = language === 'zh' ? currentTip.descriptionZh : currentTip.descriptionEn;

  const categoryColors: Record<string, string> = {
    'getting-started': '#FF6F61',
    'features': '#A7C7E7',
    'tips': '#FDFD96',
    'safety': '#FF6F61',
  };

  return (
    <div className="smart-tips-panel">
      <div
        className="smart-tips-content"
        style={{ borderLeftColor: categoryColors[currentTip.category] }}
      >
        <div className="smart-tips-header">
          <div className="smart-tips-icon">
            <Lightbulb size={20} color={categoryColors[currentTip.category]} />
          </div>
          <h3>{title}</h3>
          <button
            onClick={onClose}
            className="smart-tips-close"
            aria-label="Close tips"
          >
            <X size={20} />
          </button>
        </div>
        <p className="smart-tips-description">{description}</p>
        <div className="smart-tips-footer">
          <button
            onClick={() => handleDismissTip(currentTip.id)}
            className="smart-tips-dismiss"
          >
            {language === 'zh' ? '收起' : 'Got it'}
            <ChevronRight size={16} />
          </button>
          <div className="smart-tips-progress">
            {activeTips.length > 1 && (
              <span>
                {TIPS.filter(t => dismissedTips.has(t.id)).length + 1} / {TIPS.length}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
