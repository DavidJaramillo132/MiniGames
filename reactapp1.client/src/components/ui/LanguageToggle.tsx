import { useI18n } from '../../i18n/LanguageContext';

function LanguageToggle() {
  const { language, setLanguage, t } = useI18n();

  return (
    <label className="fixed right-4 top-4 z-[60] flex items-center gap-2 rounded-full border border-[rgba(120,230,255,0.3)] bg-[rgba(8,18,34,0.94)] px-3 py-2 text-sm text-[#edf6ff] shadow-lg backdrop-blur-md">
      <span className="sr-only">{t('languageLabel')}</span>
      <select aria-label={t('languageLabel')} className="bg-transparent font-medium outline-none" value={language} onChange={(event) => setLanguage(event.target.value as 'en' | 'es')}>
        <option value="en">{t('english')}</option>
        <option value="es">{t('spanish')}</option>
      </select>
    </label>
  );
}

export default LanguageToggle;
