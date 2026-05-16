import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { getGames } from '../services/gameService';
import type { Game } from '../types/game.types';

const presentationStats = [
  { value: '2,400+', label: 'Jugadores registrados' },
  { value: '18,000+', label: 'Partidas jugadas' },
  { value: '142', label: 'En linea ahora' },
  { value: '3', label: 'Juegos disponibles' },
];

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

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M8 6l10 6-10 6V6Z" />
    </svg>
  );
}

function HowItWorksIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 3v18" />
      <path d="M3 12h18" />
      <path d="M7 7l10 10" />
    </svg>
  );
}

function Presentation() {
  const navigate = useNavigate();
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;

    const loadGames = async () => {
      setIsLoading(true);
      const lobbyGames = await getGames();

      if (isCancelled) {
        return;
      }

      setGames(lobbyGames);
      setIsLoading(false);
    };

    void loadGames();

    return () => {
      isCancelled = true;
    };
  }, []);

  const previewGames = useMemo(() => games.slice(0, 3), [games]);

  return (
    <main className="page-shell landing-page">
      <div className="landing-shell">
        <header className="landing-header">
          <div className="topbar-brand">
            <div className="logo-mark">
              <GamepadIcon />
            </div>
            <span className="topbar-brand-text">PlayHub</span>
          </div>

          <div className="landing-header-actions">
            <Button variant="surface" onClick={() => navigate('/login')}>
              Iniciar sesion
            </Button>
            <Button variant="surface" onClick={() => navigate('/register')}>
              Registrarse
            </Button>
          </div>
        </header>

        <section className="landing-hero">
          <Badge variant="primary">Multijugador en tiempo real</Badge>

          <div className="landing-copy">
            <h1 className="landing-title">
              Juega, compite y
              <span className="landing-title-accent"> sube en el ranking</span>
            </h1>
            <p className="landing-subtitle">
              Una plataforma de minijuegos multijugador. Reta a jugadores de todo el mundo en
              tiempo real.
            </p>
          </div>

          <div className="landing-actions">
            <Button variant="surface" onClick={() => navigate('/register')}>
              <PlayIcon />
              <span>Jugar ahora</span>
            </Button>
            <Button
              variant="surface"
              onClick={() =>
                document.getElementById('landing-games')?.scrollIntoView({ behavior: 'smooth' })
              }
            >
              <HowItWorksIcon />
              <span>Ver como funciona</span>
            </Button>
          </div>

          <div id="landing-games" className="landing-game-strip">
            {isLoading ? (
              <div className="panel-card loading-card">
                <span className="spinner" />
                <span>Cargando minijuegos...</span>
              </div>
            ) : (
              previewGames.map((game) => (
                <article
                  key={game.id}
                  className="landing-game-card"
                  style={{ ['--card-accent' as string]: game.accentColor }}
                >
                  <div className="landing-game-icon">
                    {game.id === 'tic-tac-toe' ? (
                      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.9">
                        <path d="M8 7L16 17" />
                        <path d="M16 7L8 17" />
                        <circle cx="12" cy="12" r="9" />
                      </svg>
                    ) : game.id === 'batalla-naval' ? (
                      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M4 16h16" />
                        <path d="M7 16l2-8h6l2 8" />
                        <path d="M11 8V4h2" />
                        <path d="M3 18c1.2 1.1 2.5 1.6 3.9 1.6 1.4 0 2.8-.5 4.1-1.6 1.3 1.1 2.6 1.6 4 1.6s2.7-.5 4-1.6" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M9.5 9a2.5 2.5 0 1 1 4.4 1.6c-.7.8-1.9 1.5-1.9 2.9" />
                        <path d="M12 17h.01" />
                        <path d="M12 2v2" />
                        <path d="M12 20v2" />
                        <path d="M4.9 4.9l1.4 1.4" />
                        <path d="M17.7 17.7l1.4 1.4" />
                        <path d="M2 12h2" />
                        <path d="M20 12h2" />
                      </svg>
                    )}
                  </div>

                  <div className="landing-game-info">
                    <h2>{game.name}</h2>
                    {game.isAvailable ? (
                      <p>
                        <span className="landing-online-dot" />
                        {game.playersOnline} jugando
                      </p>
                    ) : (
                      <p className="is-warning">{game.statusLabel}</p>
                    )}
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

        <section className="landing-stats">
          {presentationStats.map((stat) => (
            <article key={stat.label} className="landing-stat">
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}

export default Presentation;
