import { useContext } from 'react';
import { LanguageContext } from '../i18n/context';

/**
 * useI18n - Simple i18n hook wrapper
 * Returns translation function and language info
 */
export const useI18n = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    return {
      t: (key: string) => key,
      isZh: true,
      language: 'zh' as const,
    };
  }

  return {
    t: (key: string) => key, // simplified for analytics - uses key directly
    isZh: context.language === 'zh',
    language: context.language,
  };
};
