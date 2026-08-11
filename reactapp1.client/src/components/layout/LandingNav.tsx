import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
import { useI18n } from '../../i18n/LanguageContext';

function GamepadIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#f8f8ff" strokeWidth="1.9">
      <path d="M7 10h10a4 4 0 0 1 3.9 4.9l-.6 2.6a2.4 2.4 0 0 1-3.8 1.3L13.8 17h-3.6l-2.7 1.8a2.4 2.4 0 0 1-3.8-1.3L3.1 15A4 4 0 0 1 7 10Z" />
      <path d="M8 13v4" />
      <path d="M6 15h4" />
      <path d="M16 14h.01" />
      <path d="M18 16h.01" />
    </svg>
  );
}

function LandingNav() {
  const navigate = useNavigate();
  const { t } = useI18n();

  return (
    <header className="mx-auto flex w-full max-w-[1280px] items-center justify-between gap-5 px-6 py-6 max-[900px]:flex-col max-[900px]:items-stretch max-sm:px-4">
      <div className="inline-flex items-center gap-3">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-[rgba(120,230,255,0.28)] bg-[linear-gradient(135deg,rgba(120,230,255,0.22),rgba(77,163,255,0.18))] shadow-[0_14px_40px_rgba(69,154,255,0.2)]">
          <GamepadIcon />
        </div>
        <div className="grid gap-0.5">
          <span className="font-['Rajdhani'] text-[2.2rem] font-bold leading-none tracking-[0.08em] text-[#f6fbff] uppercase">
            PlayHub
          </span>
          <span className="text-[0.78rem] uppercase tracking-[0.26em] text-[#97dafc]/70">
            {t('multiplayerArena')}
          </span>
        </div>
      </div>

      <div className="inline-flex items-center gap-3 max-[900px]:w-full">
        <Button className="max-[900px]:flex-1" variant="surface" onClick={() => navigate('/login')}>
          {t('signIn')}
        </Button>
        <Button className="max-[900px]:flex-1" variant="surface" onClick={() => navigate('/register')}>
          {t('register')}
        </Button>
      </div>
    </header>
  );
}

export default LandingNav;
