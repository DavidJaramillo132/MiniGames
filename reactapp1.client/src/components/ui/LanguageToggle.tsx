import { useI18n } from '../../i18n/LanguageContext';

type Language = 'en' | 'es';

const LANGUAGES: readonly Language[] = ['en', 'es'];

function LanguageToggle() {
  const { language, setLanguage, t } = useI18n();

  return (
    <div role="group" aria-label={t('languageLabel')} className="fixed right-4 top-4 z-[60] flex items-center gap-1 rounded-full border border-[rgba(120,230,255,0.3)] bg-[rgba(8,18,34,0.94)] p-1 shadow-lg backdrop-blur-md">
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
            className={`min-w-12 cursor-pointer rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#78e6ff]/50 ${
              isActive
                ? 'bg-[linear-gradient(135deg,#71e4ff_0%,#3b82f6_55%,#2646c7_100%)] text-[#02111e] shadow-[0_4px_14px_rgba(59,130,246,0.45)]'
                : 'text-[#97dafc]/70 hover:bg-[rgba(140,230,255,0.12)] hover:text-[#d7f7ff]'
            }`}
          >
            {code}
          </button>
        );
      })}
    </div>
  );
}

export default LanguageToggle;
