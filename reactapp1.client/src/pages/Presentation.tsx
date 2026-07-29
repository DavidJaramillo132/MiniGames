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
  { value: '3', label: 'Arenas activas' },
];

const featurePillars = [
  {
    title: 'Partidas rapidas',
    copy: 'Entra al lobby, elige modo y empieza a competir en segundos.',
  },
  {
    title: 'Rivales reales',
    copy: 'Salas, matchmaking y enfrentamientos con otros jugadores en vivo.',
  },
  {
    title: 'Progreso visible',
    copy: 'Rankings, historial y estadisticas que convierten cada partida en avance.',
  },
];

const competitiveLoop = [
  'Elige un minijuego con identidad propia',
  'Compite en vivo contra otros jugadores',
  'Sube tu ELO y mejora tu perfil',
];

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M8 6l10 6-10 6V6Z" />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 4h7v7H4z" />
      <path d="M13 4h7v7h-7z" />
      <path d="M4 13h7v7H4z" />
      <path d="M13 13h7v7h-7z" />
    </svg>
  );
}

function getGameLabel(gameId: string) {
  if (gameId === 'tic-tac-toe') {
    return 'Duelo 1v1';
  }

  if (gameId === 'trivia') {
    return 'Ritmo rapido';
  }

  if (gameId === 'memory') {
    return 'Parejas 1v1';
  }

  return 'Tiempo real';
}

function renderGameIcon(game: Game) {
  if (game.id === 'tic-tac-toe') {
    return (
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.9">
        <path d="M8 7L16 17" />
        <path d="M16 7L8 17" />
        <circle cx="12" cy="12" r="9" />
      </svg>
    );
  }

  if (game.id === 'memory') {
    return (
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
        <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
        <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
        <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M9.5 9a2.5 2.5 0 1 1 4.4 1.6c-.7.8-1.9 1.5-1.9 2.9" />
      <path d="M12 17h.01" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="M4.9 4.9l1.4 1.4" />
      <path d="M17.7 17.7l1.4 1.4" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
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
    <main className="min-h-screen overflow-x-hidden bg-transparent text-[#edf6ff]">
      <div className="relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(120,230,255,0.16),transparent_22%),radial-gradient(circle_at_80%_15%,rgba(255,123,99,0.14),transparent_18%),radial-gradient(circle_at_50%_55%,rgba(77,163,255,0.1),transparent_28%)]" />

        <LandingNav />

        <section className="relative mx-auto grid w-full max-w-[1280px] gap-8 px-6 pb-10 pt-4 lg:grid-cols-[1.2fr_0.8fr] lg:items-center max-sm:px-4">
          <div className="grid gap-7">
            <Badge variant="primary">Multiplayer minigames in real time</Badge>

            <div className="grid max-w-[760px] gap-5">
              <h1 className="font-['Rajdhani'] text-[clamp(4.2rem,10vw,8rem)] font-bold uppercase leading-[0.88] tracking-[0.04em] text-[#f6fbff]">
                Play loud.
                <span className="block text-[#78e6ff]">Climb harder.</span>
              </h1>
              <p className="max-w-[640px] text-[clamp(1.08rem,2vw,1.3rem)] leading-8 text-[#d6e8f8]/72">
                PlayHub convierte minijuegos competitivos en una experiencia con identidad:
                salas en vivo, rivales reales, estadisticas claras y una interfaz que empuja a
                jugar otra vez.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Button onClick={() => navigate('/register')}>
                <PlayIcon />
                Entrar a competir
              </Button>
              <Button
                variant="surface"
                onClick={() =>
                  document.getElementById('landing-games')?.scrollIntoView({ behavior: 'smooth' })
                }
              >
                <GridIcon />
                Ver arenas
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {featurePillars.map((pillar) => (
                <article
                  key={pillar.title}
                  className="rounded-[26px] border border-[rgba(141,232,255,0.14)] bg-[rgba(6,16,30,0.62)] p-5 backdrop-blur-md"
                >
                  <h2 className="text-[1.08rem] font-semibold text-[#f6fbff]">{pillar.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-[#d6e8f8]/62">{pillar.copy}</p>
                </article>
              ))}
            </div>
          </div>

          <aside className="relative">
            <div className="absolute inset-8 rounded-full bg-[rgba(120,230,255,0.12)] blur-3xl" />
            <div className="relative overflow-hidden rounded-[34px] border border-[rgba(141,232,255,0.18)] bg-[linear-gradient(180deg,rgba(8,18,34,0.9),rgba(4,10,20,0.96))] p-6 shadow-[0_28px_90px_rgba(0,0,0,0.28)]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[0.8rem] uppercase tracking-[0.24em] text-[#97dafc]/62">
                    Live pulse
                  </p>
                  <h2 className="mt-2 text-[1.9rem] font-bold tracking-[-0.04em]">
                    Arena preview
                  </h2>
                </div>
                <span className="rounded-full border border-[rgba(134,240,190,0.26)] bg-[rgba(134,240,190,0.08)] px-3 py-1.5 text-xs uppercase tracking-[0.18em] text-[#86f0be]">
                  142 online
                </span>
              </div>

              <div className="mt-6 grid gap-4">
                {competitiveLoop.map((step, index) => (
                  <div
                    key={step}
                    className="grid grid-cols-[40px_1fr] items-center gap-4 rounded-[22px] border border-[rgba(141,232,255,0.12)] bg-[rgba(255,255,255,0.03)] px-4 py-3"
                  >
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[rgba(120,230,255,0.12)] text-sm font-bold text-[#90ebff]">
                      0{index + 1}
                    </span>
                    <span className="text-[#ebf6ff]">{step}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 grid gap-3 rounded-[26px] border border-[rgba(255,123,99,0.14)] bg-[linear-gradient(135deg,rgba(255,123,99,0.1),rgba(255,199,106,0.08))] p-5">
                <p className="text-[0.8rem] uppercase tracking-[0.24em] text-[#ffd8b1]/68">
                  Seasonal focus
                </p>
                <p className="text-[1.4rem] font-semibold leading-tight text-[#fff7ef]">
                  Gana una posicion en el top semanal y desbloquea insignias visibles.
                </p>
              </div>
            </div>
          </aside>
        </section>

        <section className="relative mx-auto w-full max-w-[1280px] px-6 py-6 max-sm:px-4">
          <div className="grid gap-4 rounded-[30px] border border-[rgba(141,232,255,0.14)] bg-[rgba(5,13,24,0.72)] px-5 py-5 backdrop-blur-md md:grid-cols-2 xl:grid-cols-4">
            {presentationStats.map((stat) => (
              <article key={stat.label} className="rounded-[22px] border border-[rgba(141,232,255,0.08)] bg-[rgba(255,255,255,0.02)] px-5 py-4">
                <strong className="font-['Rajdhani'] text-[clamp(2.4rem,4vw,3.5rem)] leading-none font-bold uppercase tracking-[0.05em] text-[#f7fbff]">
                  {stat.value}
                </strong>
                <p className="mt-2 text-sm uppercase tracking-[0.18em] text-[#d6e8f8]/48">
                  {stat.label}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section
          id="landing-games"
          className="relative mx-auto grid w-full max-w-[1280px] gap-6 px-6 pb-16 pt-10 max-sm:px-4"
        >
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[0.82rem] uppercase tracking-[0.24em] text-[#97dafc]/68">
                Game selection
              </p>
              <h2 className="mt-2 font-['Rajdhani'] text-[3rem] font-bold uppercase tracking-[0.06em] text-[#f6fbff]">
                Choose your arena
              </h2>
            </div>
            <p className="max-w-[520px] text-[#d6e8f8]/62">
              Cada juego tiene ritmo, color y tension propia. El objetivo no es solo jugar, sino
              volver porque tu perfil, tu ranking y tus resultados importan.
            </p>
          </div>

          {isLoading ? (
            <div className="flex min-h-[220px] items-center justify-center gap-3 rounded-[30px] border border-[rgba(141,232,255,0.14)] bg-[rgba(5,13,24,0.78)] text-[#d6e8f8]/68">
              <Spinner size={28} />
              <span>Cargando minijuegos...</span>
            </div>
          ) : (
            <div className="grid gap-5 lg:grid-cols-3">
              {previewGames.map((game) => (
                <article
                  key={game.id}
                  className="relative overflow-hidden rounded-[30px] border border-[rgba(141,232,255,0.14)] bg-[linear-gradient(180deg,rgba(8,18,34,0.95),rgba(5,12,24,0.98))] p-6"
                >
                  <div
                    className="absolute right-4 top-4 h-24 w-24 rounded-full blur-3xl"
                    style={{ backgroundColor: `${game.accentColor}40` }}
                  />

                  <div
                    className="relative inline-flex h-14 w-14 items-center justify-center rounded-[20px] border"
                    style={{
                      color: game.accentColor,
                      borderColor: `${game.accentColor}55`,
                      backgroundColor: `${game.accentColor}20`,
                    }}
                  >
                    {renderGameIcon(game)}
                  </div>

                  <div className="relative mt-6 flex items-center justify-between gap-3">
                    <h3 className="text-[1.7rem] font-bold tracking-[-0.04em]">{game.name}</h3>
                    <span className="text-[0.75rem] uppercase tracking-[0.24em] text-[#d6e8f8]/48">
                      {getGameLabel(game.id)}
                    </span>
                  </div>

                  <p className="relative mt-3 text-sm leading-7 text-[#d6e8f8]/62">
                    {game.description}
                  </p>

                  <div className="relative mt-6 flex flex-wrap items-center gap-3">
                    {game.isAvailable ? (
                      <Badge variant="success">{game.playersOnline} jugando</Badge>
                    ) : (
                      <Badge variant="warning" isStatic>
                        {game.statusLabel}
                      </Badge>
                    )}
                    <span className="text-sm uppercase tracking-[0.18em] text-[#d6e8f8]/40">
                      {game.isAvailable ? 'Ready now' : 'Coming next'}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default Presentation;
