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
    <header className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 border-b border-[#2a2a3a] px-6 py-[18px] max-[900px]:grid-cols-1 max-[900px]:justify-items-start">
      <div className="inline-flex justify-self-start items-center gap-3">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[rgba(83,74,183,0.95)] to-[rgba(120,111,230,0.95)] shadow-[0_12px_30px_rgba(83,74,183,0.35)]">
          <GamepadIcon />
        </div>
        <span className="text-[1.95rem] font-bold tracking-[-0.04em]">PlayHub</span>
      </div>

      <div className="inline-flex items-center gap-2.5 text-[1.1rem] text-[#f5f7ff]/68">
        <span className="h-2.5 w-2.5 rounded-full bg-[#5dcaa5] shadow-[0_0_0_4px_rgba(93,202,165,0.14)]" />
        <span>{onlineCount} online</span>
      </div>

      <div className="inline-flex justify-self-end items-center gap-3 max-[900px]:justify-self-start">
        <div
          className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[rgba(83,74,183,0.92)] to-[rgba(111,101,219,0.88)] font-bold tracking-[0.02em]"
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
