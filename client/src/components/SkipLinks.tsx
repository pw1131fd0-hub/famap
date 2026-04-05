import { useTranslation } from '../i18n/useTranslation';

export function SkipLinks() {
  const { language } = useTranslation();

  return (
    <nav className="skip-links" aria-label="Skip navigation">
      <a href="#main-content" className="skip-link">
        {language === 'zh' ? '跳到主要內容' : 'Skip to main content'}
      </a>
      <a href="#sidebar" className="skip-link">
        {language === 'zh' ? '跳到側邊欄' : 'Skip to sidebar'}
      </a>
      <a href="#search" className="skip-link">
        {language === 'zh' ? '跳到搜尋' : 'Skip to search'}
      </a>
      <a href="#map" className="skip-link">
        {language === 'zh' ? '跳到地圖' : 'Skip to map'}
      </a>
    </nav>
  );
}