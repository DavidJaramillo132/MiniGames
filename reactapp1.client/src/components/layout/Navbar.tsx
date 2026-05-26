import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Button from '../ui/Button';

interface NavbarProps {
  onlineCount: number;
}

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

function Navbar({ onlineCount }: NavbarProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="mx-auto grid w-full max-w-[1360px] grid-cols-[1fr_auto_1fr] items-center gap-3 px-6 py-6 max-[900px]:grid-cols-1 max-[900px]:justify-items-start max-sm:px-4">
      <div className="inline-flex justify-self-start items-center gap-3">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-[rgba(120,230,255,0.28)] bg-[linear-gradient(135deg,rgba(120,230,255,0.22),rgba(77,163,255,0.18))] shadow-[0_14px_40px_rgba(69,154,255,0.2)]">
          <GamepadIcon />
        </div>
        <div className="grid gap-0.5">
          <span className="font-['Rajdhani'] text-[2.2rem] font-bold leading-none tracking-[0.08em] text-[#f6fbff] uppercase">
            PlayHub
          </span>
          <span className="text-[0.78rem] uppercase tracking-[0.26em] text-[#97dafc]/70">
            Competitive Lobby
          </span>
        </div>
      </div>

      <div className="inline-flex items-center gap-2.5 rounded-full border border-[rgba(134,240,190,0.24)] bg-[rgba(134,240,190,0.08)] px-4 py-2 text-[1rem] text-[#d9fef1]">
        <span className="h-2.5 w-2.5 rounded-full bg-[#86f0be] shadow-[0_0_0_4px_rgba(134,240,190,0.12)]" />
        <span>{onlineCount} players online</span>
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
