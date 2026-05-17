import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';

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

  return (
    <header className="flex items-center justify-between gap-5 border-b border-[rgba(42,42,58,0.88)] px-7 py-[18px] max-[900px]:flex-col max-[900px]:items-stretch max-sm:px-4">
      <div className="inline-flex items-center gap-3">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[rgba(83,74,183,0.95)] to-[rgba(120,111,230,0.95)] shadow-[0_12px_30px_rgba(83,74,183,0.35)]">
          <GamepadIcon />
        </div>
        <span className="text-[1.95rem] font-bold tracking-[-0.04em]">PlayHub</span>
      </div>

      <div className="inline-flex items-center gap-3 max-[900px]:w-full">
        <Button className="max-[900px]:flex-1" variant="surface" onClick={() => navigate('/login')}>
          Iniciar sesion
        </Button>
        <Button className="max-[900px]:flex-1" variant="surface" onClick={() => navigate('/register')}>
          Registrarse
        </Button>
      </div>
    </header>
  );
}

export default LandingNav;
