import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
import { GamepadIcon } from '../ui/Icons';
import { useI18n } from '../../i18n/LanguageContext';

function LandingNav() {
  const navigate = useNavigate();
  const { language, setLanguage, t } = useI18n();

  return (
    <header className="mx-auto flex w-full max-w-[1280px] items-center justify-between gap-5 px-6 py-6 max-sm:px-4">
      <div 
        className="inline-flex cursor-pointer items-center gap-3.5 transition-transform hover:scale-[1.02]"
        onClick={() => navigate('/')}
      >
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-[14px] border border-[#d4ff00]/40 bg-[#d4ff00]/10 text-[#d4ff00] shadow-[0_0_20px_rgba(212,255,0,0.2)]">
          <GamepadIcon size={24} />
        </div>
        <div className="grid gap-0">
          <span className="font-['Rajdhani'] text-[2.2rem] font-bold leading-none tracking-[0.06em] text-[#f4f4f6] uppercase">
            PlayHub
          </span>
          <span className="text-[0.72rem] font-bold uppercase tracking-[0.22em] text-[#8c8c9a]">
            {t('multiplayerArena')}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {/* Language selector integrated in nav */}
        <div 
          role="group" 
          aria-label={t('languageLabel')} 
          className="flex items-center gap-1 rounded-full border border-white/[0.08] bg-[#111114] p-1"
        >
          {(['en', 'es'] as const).map((code) => {
            const isActive = language === code;
            return (
              <button
                key={code}
                type="button"
                aria-pressed={isActive}
                onClick={() => setLanguage(code)}
                className={`rounded-full px-2.5 py-0.5 font-['Rajdhani'] text-xs font-bold uppercase tracking-wider transition-all ${
                  isActive
                    ? 'bg-[#d4ff00] text-[#08080a] shadow-[0_0_8px_rgba(212,255,0,0.35)]'
                    : 'text-[#8c8c9a] hover:text-[#f4f4f6]'
                }`}
              >
                {code}
              </button>
            );
          })}
        </div>

        <Button variant="surface" onClick={() => navigate('/login')}>
          {t('signIn')}
        </Button>
        <Button variant="primary" onClick={() => navigate('/register')}>
          {t('register')}
        </Button>
      </div>
    </header>
  );
}

export default LandingNav;
