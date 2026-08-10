import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Button from '../ui/Button';

interface NavbarProps {
  onlineCount: number;
  gameOnlineCount?: number;
}

function Navbar({ onlineCount, gameOnlineCount }: NavbarProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="mx-auto grid w-full max-w-[1360px] grid-cols-[1fr_auto_1fr] items-center gap-3 px-6 py-6 max-[900px]:grid-cols-1 max-[900px]:justify-items-start max-sm:px-4">
      <div className="inline-flex justify-self-start items-center gap-3">
        <img
          src="/logo.png"
          alt="PlayHub logo"
          className="h-12 w-12 rounded-2xl border border-[rgba(120,230,255,0.28)] object-cover shadow-[0_14px_40px_rgba(69,154,255,0.2)]"
        />
        <div className="grid gap-0.5">
          <span className="font-['Rajdhani'] text-[2.2rem] font-bold leading-none tracking-[0.08em] text-[#f6fbff] uppercase">
            PlayHub
          </span>
          <span className="text-[0.78rem] uppercase tracking-[0.26em] text-[#97dafc]/70">
            Competitive Lobby
          </span>
        </div>
      </div>

      <div className="inline-flex items-center gap-3 rounded-full border border-[rgba(134,240,190,0.28)] bg-[rgba(134,240,190,0.10)] px-4 py-2 text-[1rem] text-[#d9fef1] shadow-[0_0_24px_rgba(134,240,190,0.06)]">
        <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-[#86f0be] shadow-[0_0_0_4px_rgba(134,240,190,0.2),0_0_16px_rgba(134,240,190,0.15)]" />
        <span className="font-medium">{onlineCount} players online</span>
        {gameOnlineCount !== undefined ? (
          <span className="border-l border-[#86f0be]/25 pl-3 text-sm text-[#c6ffee]/70">
            {gameOnlineCount} in this game
          </span>
        ) : null}
      </div>

      <div className="inline-flex justify-self-end items-center gap-3 max-[900px]:justify-self-start">
        <div
          className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-[rgba(120,230,255,0.24)] bg-[linear-gradient(135deg,rgba(120,230,255,0.18),rgba(255,123,99,0.18))] font-bold tracking-[0.06em] text-[#f8fdff]"
          aria-label={user?.name ?? 'Player'}
        >
          {user?.initials ?? 'PH'}
        </div>
        <Button variant="ghost" onClick={handleLogout}>
          Log out
        </Button>
      </div>
    </header>
  );
}

export default Navbar;
