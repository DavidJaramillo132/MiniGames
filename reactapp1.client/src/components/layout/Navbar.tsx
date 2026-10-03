import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Button from '../ui/Button';
import { LogoutIcon, SignalIcon } from '../ui/Icons';
import { useI18n } from '../../i18n/LanguageContext';

interface NavbarProps {
  onlineCount: number;
  gameOnlineCount?: number;
}

function Navbar({ onlineCount, gameOnlineCount }: NavbarProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useI18n();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="relative z-10 mx-auto flex w-full max-w-[1360px] items-center justify-between gap-4 px-6 py-4 max-sm:px-4">
      {/* Brand */}
      <div 
        className="inline-flex cursor-pointer items-center gap-3.5 transition-transform hover:scale-[1.02]"
        onClick={() => navigate('/home')}
      >
        <img
          src="/logo.png"
          alt="PlayHub logo"
          className="h-10 w-10 rounded-[12px] border border-[#d4ff00]/40 object-cover shadow-[0_0_16px_rgba(212,255,0,0.2)]"
        />
        <div className="grid gap-0">
          <span className="font-['Rajdhani'] text-[2.1rem] font-bold leading-none tracking-[0.06em] text-[#f4f4f6] uppercase">
            PlayHub
          </span>
          <span className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-[#8c8c9a]">
            {t('competitiveLobby')}
          </span>
        </div>
      </div>

      {/* Telemetry Status Center */}
      <div className="hidden md:flex items-center gap-3">
        <div className="inline-flex items-center gap-2.5 rounded-full border border-[#00f5a0]/30 bg-[#00f5a0]/10 px-3.5 py-1 text-xs font-bold uppercase tracking-[0.14em] text-[#00f5a0] shadow-[0_0_16px_rgba(0,245,160,0.12)]">
          <span className="h-2 w-2 rounded-full bg-[#00f5a0] shadow-[0_0_8px_#00f5a0] animate-pulse" />
          <span>{t('playersOnline', { count: onlineCount })}</span>
          {gameOnlineCount !== undefined ? (
            <span className="border-l border-[#00f5a0]/30 pl-2 text-[#a3fedd]">
              {t('inThisGame', { count: gameOnlineCount })}
            </span>
          ) : null}
        </div>

        <div className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-[#111114] px-3 py-1 font-['Rajdhani'] text-xs font-semibold tracking-wider text-[#8c8c9a]">
          <SignalIcon size={14} className="text-[#d4ff00]" />
          <span>LIVE SIGNALR</span>
        </div>
      </div>

      {/* Controls & User Profile */}
      <div className="inline-flex items-center gap-2.5 sm:gap-3">
        {/* Language selector */}
        <div 
          role="group" 
          aria-label={t('languageLabel')} 
          className="flex items-center gap-0.5 rounded-full border border-white/[0.08] bg-[#111114] p-1"
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
                    ? 'bg-[#d4ff00] text-[#08080a] shadow-[0_0_10px_rgba(212,255,0,0.35)]'
                    : 'text-[#8c8c9a] hover:text-[#f4f4f6]'
                }`}
              >
                {code}
              </button>
            );
          })}
        </div>

        {/* User Badge */}
        <div
          className="inline-flex h-9 w-9 items-center justify-center rounded-[10px] border border-white/[0.12] bg-[#17171d] font-['Rajdhani'] font-bold tracking-[0.06em] text-[#d4ff00] shadow-[0_0_10px_rgba(212,255,0,0.15)]"
          aria-label={user?.name ?? t('player')}
          title={user?.name}
        >
          {user?.initials ?? 'PH'}
        </div>

        <Button variant="ghost" onClick={handleLogout} className="px-2.5 py-1.5">
          <LogoutIcon size={16} />
          <span className="hidden sm:inline">{t('logOut')}</span>
        </Button>
      </div>
    </header>
  );
}

export default Navbar;
