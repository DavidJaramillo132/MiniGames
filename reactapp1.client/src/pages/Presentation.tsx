import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import LandingNav from '../components/layout/LandingNav';
import Spinner from '../components/ui/Spinner';
import { getGames } from '../services/gameService';
import type { Game } from '../types/game.types';

const presentationStats = [
  { value: '2,400+', label: 'Jugadores registrados' },
  { value: '18,000+', label: 'Partidas jugadas' },
  { value: '142', label: 'En linea ahora' },
  { value: '3', label: 'Juegos disponibles' },
];

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
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(83,74,183,0.13),transparent_30%),linear-gradient(180deg,rgba(17,17,24,0.95),rgba(15,15,19,1))] font-sans text-[#f5f7ff]">
      <div className="grid min-h-screen grid-rows-[auto_1fr_auto] border border-[rgba(42,42,58,0.88)] bg-gradient-to-b from-[rgba(16,16,21,0.98)] to-[rgba(14,14,19,1)]">
        <LandingNav />

        <section className="grid content-center justify-items-center gap-[30px] px-5 py-14 text-center max-sm:px-4 max-sm:py-10">
          <Badge variant="primary">Multijugador en tiempo real</Badge>

          <div className="grid max-w-[760px] gap-[18px]">
            <h1 className="m-0 text-[clamp(3.4rem,6vw,5.6rem)] leading-[0.96] font-bold tracking-[-0.07em]">
              Juega, compite y
              <span className="text-[#a8a0ff]"> sube en el ranking</span>
            </h1>
            <p className="mx-auto max-w-[660px] text-[clamp(1.15rem,2vw,1.55rem)] leading-[1.55] text-white/42">
              Una plataforma de minijuegos multijugador. Reta a jugadores de todo el mundo en
              tiempo real.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <Button variant="surface" onClick={() => navigate('/register')}>
              <PlayIcon />
              Jugar ahora
            </Button>
            <Button
              variant="surface"
              onClick={() =>
                document.getElementById('landing-games')?.scrollIntoView({ behavior: 'smooth' })
              }
            >
              <HowItWorksIcon />
              Ver como funciona
            </Button>
          </div>

          <div
            id="landing-games"
            className="mt-[18px] grid w-full max-w-[980px] gap-4 md:grid-cols-2 xl:grid-cols-3"
          >
            {isLoading ? (
              <div className="flex min-h-[160px] items-center justify-center gap-3 rounded-[12px] border border-[rgba(58,58,78,0.72)] bg-gradient-to-b from-[rgba(28,28,40,0.97)] to-[rgba(24,24,35,0.97)] text-[#f5f7ff]/68 md:col-span-2 xl:col-span-3">
                <Spinner size={28} />
                <span>Cargando minijuegos...</span>
              </div>
            ) : (
              previewGames.map((game) => (
                <article
                  key={game.id}
                  className="flex min-h-[108px] items-center gap-4 rounded-2xl border border-[rgba(58,58,78,0.85)] bg-gradient-to-b from-[rgba(31,31,45,0.95)] to-[rgba(25,25,36,0.95)] px-5 py-[18px] text-left"
                >
                  <div
                    className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                    style={{ color: game.accentColor, backgroundColor: `${game.accentColor}24` }}
                  >
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

                  <div className="grid gap-1.5">
                    <h2 className="m-0 text-[1.18rem] leading-[1.1] font-semibold">{game.name}</h2>
                    {game.isAvailable ? (
                      <p className="m-0 inline-flex items-center gap-2 text-[#f5f7ff]/46">
                        <span className="h-2 w-2 rounded-full bg-[#5dcaa5]" />
                        {game.playersOnline} jugando
                      </p>
                    ) : (
                      <p className="m-0 text-[#f09c74]">{game.statusLabel}</p>
                    )}
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

        <section className="grid gap-5 border-t border-[rgba(42,42,58,0.88)] bg-[rgba(10,10,15,0.95)] px-[30px] py-[26px] md:grid-cols-2 xl:grid-cols-4 max-sm:px-4">
          {presentationStats.map((stat) => (
            <article key={stat.label} className="grid gap-1.5 text-center">
              <strong className="text-[clamp(2rem,3vw,3rem)] leading-none font-bold tracking-[-0.04em]">
                {stat.value}
              </strong>
              <span className="text-[1.12rem] text-white/42">{stat.label}</span>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}

export default Presentation;
