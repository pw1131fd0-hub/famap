import { createContext } from 'react';
import type { Language } from '../types';
import type { TranslationKeys } from './index';

export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationKeys;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);
