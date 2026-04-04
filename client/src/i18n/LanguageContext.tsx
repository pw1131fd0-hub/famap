import React, { useState, type ReactNode } from 'react';
import type { Language } from '../types';
import { translations } from './index';
import { LanguageContext } from './context';

export const LanguageProvider: React.FC<{ children: ReactNode; initialLanguage?: Language }> = ({ children, initialLanguage = 'zh' }) => {
  const [language, setLanguage] = useState<Language>(initialLanguage);

  const t = translations[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
