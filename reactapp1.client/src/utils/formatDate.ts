import type { Language } from '../i18n/LanguageProvider';

export function formatDate(input: string | Date, language: Language = window.localStorage.getItem('playhub-language') === 'es' ? 'es' : 'en') {
  const date = typeof input === 'string' ? new Date(input) : input;

  return new Intl.DateTimeFormat(language === 'es' ? 'es-EC' : 'en-US', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}
