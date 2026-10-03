import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import LandingNav from '../components/layout/LandingNav';
import Spinner from '../components/ui/Spinner';
import { 
  GamepadIcon, 
  ZapIcon, 
  TrophyIcon, 
  ArrowRightIcon, 
  ClockIcon, 
  UsersIcon, 
  ShieldIcon, 
  SignalIcon 
} from '../components/ui/Icons';
import { getGames } from '../services/gameService';
import type { Game } from '../types/game.types';
import { useI18n } from '../i18n/LanguageContext';
import { playTicTacToeTone, playVictoryTone, prepareGameAudio } from '../utils/gameAudio';

function Presentation() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Live Interactive Duel Simulator inside Hero (Monochrome Stealth + Hyper-Accent: Volt X vs Stark White O)
  const [simBoard, setSimBoard] = useState<(string | null)[]>(() => [
    null, null, null,
    null, 'O', null,
    null, null, null,
  ]);
  const [simStatus, setSimStatus] = useState<string>('Haz tu jugada con X');

  useEffect(() => {
    let isCancelled = false;
    const loadGames = async () => {
      setIsLoading(true);
      const lobbyGames = await getGames();
      if (!isCancelled) {
        setGames(lobbyGames);
        setIsLoading(false);
      }
    };
    void loadGames();
    return () => {
      isCancelled = true;
    };
  }, []);

  const previewGames = useMemo(() => games.slice(0, 3), [games]);

  const handleSimMove = async (index: number) => {
    if (simBoard[index] !== null) return;
    await prepareGameAudio();
    playTicTacToeTone();

    const next = [...simBoard];
    next[index] = 'X';
    setSimBoard(next);
    setSimStatus('Rival calculando respuesta...');

    // Simulate instant real-time response from opponent
    setTimeout(() => {
      setSimBoard((current) => {
        const openIndices = current
          .map((val, idx) => (val === null ? idx : null))
          .filter((val): val is number => val !== null);

        if (openIndices.length > 0) {
          const rivalIdx = openIndices[Math.floor(Math.random() * openIndices.length)];
          const updated = [...current];
          updated[rivalIdx] = 'O';
          playTicTacToeTone();
          setSimStatus('Tu turno: haz clic en una casilla');
          return updated;
        } else {
          playVictoryTone();
          setSimStatus('¡Duelo de prueba completado!');
          return current;
        }
      });
    }, 380);
  };

  const handleResetSim = () => {
    setSimBoard([null, null, null, null, 'O', null, null, null, null]);
    setSimStatus('Haz tu jugada con X');
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-transparent text-[#f4f4f6]">
      <LandingNav />

      {/* ─── Hero Command Center ─── */}
      <section className="relative mx-auto w-full max-w-[1280px] px-6 pt-6 pb-12 max-sm:px-4">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          {/* Left Column: Proposition & Action */}
          <div className="grid gap-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#d4ff00]/30 bg-[#d4ff00]/10 px-3.5 py-1 text-xs font-bold uppercase tracking-[0.16em] text-[#d4ff00] w-fit">
              <SignalIcon size={14} />
              <span>SALA MULTIJUGADOR EN VIVO</span>
            </div>

            <div className="grid gap-4">
              <h1 className="font-['Rajdhani'] text-[clamp(3.8rem,8.5vw,6.5rem)] font-bold uppercase leading-[0.88] tracking-[0.02em] text-[#f4f4f6]">
                {t('playLoud')}
                <span className="block text-[#d4ff00] drop-shadow-[0_0_35px_rgba(212,255,0,0.35)]">
                  {t('climbHarder')}
                </span>
              </h1>
              <p className="max-w-[580px] text-lg sm:text-xl leading-relaxed text-[#8c8c9a]">
                {t('presentationDescription')}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Button onClick={() => navigate('/register')} className="min-h-[50px] px-7 text-base">
                <span>{t('compete')}</span>
                <ArrowRightIcon size={18} />
              </Button>
              <Button
                variant="surface"
                onClick={() =>
                  document.getElementById('landing-games')?.scrollIntoView({ behavior: 'smooth' })
                }
                className="min-h-[50px] px-6 text-base"
              >
                <GamepadIcon size={18} />
                <span>{t('viewArenas')}</span>
              </Button>
            </div>

            {/* Live Telemetry Pill */}
            <div className="flex flex-wrap items-center gap-6 pt-3 text-xs font-semibold text-[#8c8c9a]">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#00f5a0] shadow-[0_0_8px_#00f5a0] animate-pulse" />
                <span className="text-[#f4f4f6] font-bold">142</span> jugadores compitiendo ahora
              </div>
              <div className="flex items-center gap-2">
                <ClockIcon size={15} className="text-[#d4ff00]" />
                <span>Latencia promedio: <strong className="text-[#d4ff00]">12ms</strong></span>
              </div>
            </div>
          </div>

          {/* Right Column: Live Interactive Duel Simulator */}
          <div className="relative">
            <div className="relative rounded-[26px] border border-white/[0.08] bg-[#111114]/95 p-6 sm:p-7 shadow-[0_24px_70px_rgba(0,0,0,0.8)]">
              {/* Header */}
              <div className="flex items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-[#d4ff00] animate-ping" />
                  <span className="font-['Rajdhani'] text-sm font-bold uppercase tracking-[0.16em] text-[#d4ff00]">
                    PROBADOR EN VIVO DE MOTOR
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleResetSim}
                  className="font-['Rajdhani'] text-xs font-bold uppercase tracking-wider text-[#8c8c9a] hover:text-[#f4f4f6] transition-colors"
                >
                  Reiniciar tablero
                </button>
              </div>

              {/* Status readout */}
              <p className="mt-4 text-center font-['Rajdhani'] text-sm font-bold uppercase tracking-wide text-[#f4f4f6]">
                {simStatus}
              </p>

              {/* Interactive 3x3 Micro-Arena */}
              <div className="mt-4 grid grid-cols-3 gap-3">
                {simBoard.map((val, idx) => (
                  <button
                    key={`sim-${idx}`}
                    type="button"
                    onClick={() => handleSimMove(idx)}
                    disabled={val !== null}
                    className={`aspect-square rounded-[16px] border text-3xl font-bold transition-all duration-150 flex items-center justify-center ${
                      val === 'X'
                        ? 'border-[#d4ff00] bg-[#d4ff00]/15 text-[#d4ff00] shadow-[0_0_20px_rgba(212,255,0,0.35)]'
                        : val === 'O'
                        ? 'border-white/40 bg-white/10 text-[#ffffff] shadow-[0_0_20px_rgba(255,255,255,0.25)]'
                        : 'border-white/[0.08] bg-[#0d0d10] text-[#8c8c9a] hover:border-[#d4ff00]/50 hover:bg-[#d4ff00]/5 active:scale-95'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>

              {/* Protocol Spec Footnote */}
              <div className="mt-5 rounded-[14px] border border-white/[0.08] bg-[#08080a]/90 px-4 py-2.5 flex items-center justify-between text-xs text-[#8c8c9a]">
                <span>Hub: <strong className="text-[#f4f4f6]">/gameHub</strong></span>
                <span className="text-[#00f5a0] font-bold">● SIGNALR WEBSOCKET</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Streaming Telemetry Ribbon ─── */}
      <section className="border-y border-white/[0.08] bg-[#0d0d10]/90 py-3.5 overflow-hidden">
        <div className="mx-auto flex w-full max-w-[1280px] items-center justify-between gap-8 px-6 text-xs font-bold uppercase tracking-[0.18em] text-[#8c8c9a] max-sm:px-4">
          <div className="flex items-center gap-2 text-[#d4ff00]">
            <ZapIcon size={14} />
            <span>SINCRONIZACIÓN FULL-DUPLEX</span>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-[#f4f4f6]">
            <TrophyIcon size={14} />
            <span>ALGORITMO DE ELO EN TIEMPO REAL</span>
          </div>
          <div className="hidden md:flex items-center gap-2 text-[#00f5a0]">
            <ShieldIcon size={14} />
            <span>AUTENTICACIÓN SEGURA JWT</span>
          </div>
          <div className="flex items-center gap-2 text-[#d4ff00]">
            <UsersIcon size={14} />
            <span>EMPAREJAMIENTO 1V1 INSTANTÁNEO</span>
          </div>
        </div>
      </section>

      {/* ─── The Competitive Protocol ─── */}
      <section className="relative mx-auto w-full max-w-[1280px] px-6 py-16 max-sm:px-4">
        <div className="text-center max-w-[640px] mx-auto mb-12">
          <h2 className="font-['Rajdhani'] text-[clamp(2.4rem,5vw,3.5rem)] font-bold uppercase tracking-[0.03em] text-[#f4f4f6]">
            ARQUITECTURA DE COMBATE
          </h2>
          <p className="mt-2 text-sm text-[#8c8c9a]">
            Diseñado para eliminar cualquier fricción entre el jugador y la victoria.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-[22px] border border-white/[0.08] bg-[#111114] p-7 flex flex-col justify-between">
            <div>
              <div className="h-12 w-12 rounded-[14px] border border-[#d4ff00]/30 bg-[#d4ff00]/10 text-[#d4ff00] flex items-center justify-center mb-6">
                <ZapIcon size={24} />
              </div>
              <h3 className="font-['Rajdhani'] text-2xl font-bold uppercase tracking-wide text-[#f4f4f6]">
                Cero Descargas
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-[#8c8c9a]">
                Todo el motor corre en el navegador mediante React 19 y Web Audio API. Acceso inmediato a cualquier duelo con un solo clic.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/[0.08] text-xs font-mono text-[#d4ff00]">
              LATENCIA: &lt;15MS
            </div>
          </div>

          <div className="rounded-[22px] border border-white/[0.08] bg-[#111114] p-7 flex flex-col justify-between">
            <div>
              <div className="h-12 w-12 rounded-[14px] border border-white/20 bg-white/[0.06] text-[#f4f4f6] flex items-center justify-center mb-6">
                <UsersIcon size={24} />
              </div>
              <h3 className="font-['Rajdhani'] text-2xl font-bold uppercase tracking-wide text-[#f4f4f6]">
                Rivales en Vivo
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-[#8c8c9a]">
                Hub centralizado SignalR que empareja contendientes en tiempo real, sincroniza estados de turnos y previene jugadas fuera de orden.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/[0.08] text-xs font-mono text-[#8c8c9a]">
              HUB: MULTIPLAYER SIGNALR
            </div>
          </div>

          <div className="rounded-[22px] border border-white/[0.08] bg-[#111114] p-7 flex flex-col justify-between">
            <div>
              <div className="h-12 w-12 rounded-[14px] border border-[#d4ff00]/30 bg-[#d4ff00]/10 text-[#d4ff00] flex items-center justify-center mb-6">
                <TrophyIcon size={24} />
              </div>
              <h3 className="font-['Rajdhani'] text-2xl font-bold uppercase tracking-wide text-[#f4f4f6]">
                Prestigio &amp; Ranking
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-[#8c8c9a]">
                Cada victoria se registra en el podio global de la plataforma. Analiza tu porcentaje de victorias y escala hacia los primeros puestos.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/[0.08] text-xs font-mono text-[#d4ff00]">
              METRIC: ELO COMPETITIVO
            </div>
          </div>
        </div>
      </section>

      {/* ─── The Game Arenas Roster ─── */}
      <section
        id="landing-games"
        className="relative mx-auto w-full max-w-[1280px] px-6 pb-20 pt-6 max-sm:px-4"
      >
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="font-['Rajdhani'] text-[clamp(2.4rem,5vw,3.5rem)] font-bold uppercase tracking-[0.03em] text-[#f4f4f6]">
              {t('chooseArena')}
            </h2>
            <p className="mt-1 text-sm text-[#8c8c9a]">
              {t('gamesDescription')}
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex min-h-[220px] items-center justify-center gap-3 rounded-[24px] border border-white/[0.08] bg-[#111114] text-[#8c8c9a]">
            <Spinner size={28} />
            <span>{t('loadingGames')}</span>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {previewGames.map((game) => (
              <article
                key={game.id}
                className="group relative overflow-hidden rounded-[24px] border border-white/[0.08] bg-[#111114] p-6 flex flex-col justify-between transition-all duration-200 hover:border-[#d4ff00] hover:shadow-[0_16px_40px_rgba(212,255,0,0.18)]"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="h-12 w-12 rounded-[14px] border border-white/[0.12] bg-[#17171d] text-[#d4ff00] flex items-center justify-center">
                      <GamepadIcon size={24} />
                    </div>
                    <span className="font-['Rajdhani'] text-xs font-bold uppercase tracking-wider text-[#00f5a0] bg-[#00f5a0]/10 border border-[#00f5a0]/30 px-3 py-1 rounded-full">
                      DISPONIBLE
                    </span>
                  </div>

                  <h3 className="font-['Rajdhani'] text-2xl font-bold uppercase tracking-wide text-[#f4f4f6] group-hover:text-[#d4ff00] transition-colors">
                    {game.name}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#8c8c9a]">
                    {game.description}
                  </p>
                </div>

                <div className="mt-6 pt-5 border-t border-white/[0.08]">
                  <div className="flex items-center justify-between text-xs text-[#8c8c9a] mb-4">
                    <span>Formato: <strong className="text-[#f4f4f6]">1 vs 1 Duelo</strong></span>
                    <span>Duración: <strong className="text-[#f4f4f6]">~2 min</strong></span>
                  </div>
                  <Button fullWidth onClick={() => navigate('/register')}>
                    Entrar a Combatir
                  </Button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* ─── Platform Terminal Footer ─── */}
      <footer className="border-t border-white/[0.08] bg-[#08080a] py-8 text-xs text-[#8c8c9a]">
        <div className="mx-auto flex w-full max-w-[1280px] flex-wrap items-center justify-between gap-4 px-6 max-sm:px-4">
          <div className="flex items-center gap-3">
            <span className="font-['Rajdhani'] text-lg font-bold uppercase tracking-wider text-[#f4f4f6]">
              PlayHub Arena
            </span>
            <span className="text-white/[0.15]">|</span>
            <span>Real-time Multiplayer Minigames</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#00f5a0]" />
            <span className="font-mono text-[#00f5a0]">SIGNALR RUNNING</span>
          </div>
        </div>
      </footer>
    </main>
  );
}

export default Presentation;
