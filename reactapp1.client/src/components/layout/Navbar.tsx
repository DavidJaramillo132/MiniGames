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
    <header className="topbar">
      <div className="topbar-brand">
        <div className="logo-mark">
          <GamepadIcon />
        </div>
        <span className="topbar-brand-text">PlayHub</span>
      </div>

      <div className="presence-pill">
        <span className="presence-dot" />
        <span>{onlineCount} online</span>
      </div>

      <div className="topbar-actions">
        <div className="avatar" aria-label={user?.name ?? 'Player'}>
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
