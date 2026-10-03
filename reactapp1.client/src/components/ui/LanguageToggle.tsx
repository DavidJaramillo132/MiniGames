import { useLocation } from 'react-router-dom';
import { useI18n } from '../../i18n/LanguageContext';

type Language = 'en' | 'es';

const LANGUAGES: readonly Language[] = ['en', 'es'];

function LanguageToggle() {
  const { language, setLanguage, t } = useI18n();
  const location = useLocation();

  // Show floating widget only on standalone auth pages without a navbar
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  if (!isAuthPage) return null;

  return (
    <aside
      aria-label={t('languageLabel')}
      className="fixed right-5 top-5 z-50 flex items-center gap-1 rounded-full border border-white/[0.08] bg-[#111114]/95 p-1 shadow-[0_8px_24px_rgba(0,0,0,0.6)] backdrop-blur-md"
    >
      <span className="sr-only">{t('languageLabel')}</span>
      {LANGUAGES.map((code) => {
        const isActive = language === code;
        const label = code === 'en' ? t('english') : t('spanish');
        return (
          <button
            key={code}
            type="button"
            aria-pressed={isActive}
            aria-label={label}
            title={label}
            onClick={() => setLanguage(code)}
            className={`min-w-8 cursor-pointer rounded-full px-2.5 py-0.5 font-['Rajdhani'] text-xs font-bold uppercase tracking-wider transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4ff00] ${
              isActive
                ? 'bg-[#d4ff00] text-[#08080a] shadow-[0_0_8px_rgba(212,255,0,0.4)]'
                : 'text-[#8c8c9a] hover:bg-white/[0.06] hover:text-[#f4f4f6]'
            }`}
          >
            {code}
          </button>
        );
      })}
    </aside>
  );
}

export default LanguageToggle;
