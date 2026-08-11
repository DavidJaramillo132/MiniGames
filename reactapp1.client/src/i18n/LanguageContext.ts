import { createContext, useContext } from 'react';
import type { Language, TranslationKey } from './LanguageProvider';

type TranslationValues = Record<string, string | number>;

interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey, values?: TranslationValues) => string;
}

export const LanguageContext = createContext<LanguageContextValue | null>(null);

export function useI18n() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useI18n must be used within LanguageProvider.');
  return context;
}
