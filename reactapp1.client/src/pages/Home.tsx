import { useNavigate } from 'react-router-dom';
import GameCard from '../components/game/GameCard';
import Leaderboard from '../components/game/Leaderboard';
import StatsPanel from '../components/game/StatsPanel';
import Navbar from '../components/layout/Navbar';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import ErrorBoundary from '../components/ui/ErrorBoundary';
import { GamepadIcon, ZapIcon } from '../components/ui/Icons';
import { useGame } from '../hooks/useGame';
import { usePresence } from '../hooks/usePresence';
import { useI18n } from '../i18n/LanguageContext';
import { playTactileClickTone, prepareGameAudio } from '../utils/gameAudio';

function Home() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const {
    games,
    details,
    selectedGameId,
    isLobbyLoading,
    isDetailsLoading,
    isFindingMatch,
    selectGame,
    findMatch,
  } = useGame();
  const { totalOnline, gamesOnline } = usePresence();

  const selectedGame = games.find((game) => game.id === selectedGameId) ?? games[0] ?? null;

  const handleFindMatch = async () => {
    await prepareGameAudio();
    playTactileClickTone();
    const match = await findMatch();
    if (match) {
      navigate(`/game/${match.gameId}`);
    }
  };

  const loadingPanelClass =
    'flex min-h-[280px] flex-col items-center justify-center gap-3 rounded-[24px] border border-white/[0.08] bg-[#111114] text-[#8c8c9a] shadow-[0_20px_50px_rgba(0,0,0,0.6)]';

  return (
    <main className="min-h-screen bg-transparent text-[#f4f4f6]">
      <Navbar onlineCount={totalOnline} />

      <section className="relative mx-auto max-w-[1360px] px-6 pb-16 pt-3 max-sm:px-4">
        {isLobbyLoading ? (
          <div className={loadingPanelClass}>
            <Spinner size={32} />
            <span className="font-['Rajdhani'] text-sm font-bold uppercase tracking-wider text-[#8c8c9a]">
              {t('loadingLobby')}
            </span>
          </div>
        ) : (
          <>
            {/* ─── Hero Quick Launcher Deck ─── */}
            <section className="relative overflow-hidden rounded-[26px] border border-white/[0.08] bg-[#111114] p-6 sm:p-8 shadow-[0_24px_70px_rgba(0,0,0,0.8)]">
              <div className="flex flex-wrap items-center justify-between gap-6">
                <div className="min-w-[260px] flex-1">
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#d4ff00]/30 bg-[#d4ff00]/10 px-3 py-1 font-['Rajdhani'] text-xs font-bold uppercase tracking-[0.16em] text-[#d4ff00] mb-3">
                    <ZapIcon size={14} />
                    <span>LOBBY COMPETITIVO GLOBAL</span>
                  </div>
                  <h1 className="font-['Rajdhani'] text-[clamp(2.5rem,5vw,4rem)] font-bold uppercase leading-[0.9] tracking-[0.03em] text-[#f4f4f6]">
                    {t('chooseNext')}
                    <span className="block text-[#d4ff00]">{t('fight')}</span>
                  </h1>
                  <p className="mt-2 max-w-[520px] text-sm sm:text-base leading-relaxed text-[#8c8c9a]">
                    {t('selectGameDescription')}
                  </p>
                </div>

                {/* Tactical Matchmaker Box */}
                <div className="flex min-w-[240px] flex-col items-stretch gap-3 w-full sm:w-auto">
                  <div className="rounded-[16px] border border-white/[0.08] bg-[#0d0d10] px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="inline-flex h-11 w-11 items-center justify-center rounded-[12px] border"
                        style={{
                          color: selectedGame?.accentColor ?? '#d4ff00',
                          borderColor: `${selectedGame?.accentColor ?? '#d4ff00'}40`,
                          backgroundColor: `${selectedGame?.accentColor ?? '#d4ff00'}15`,
                        }}
                      >
                        <GamepadIcon size={22} />
                      </div>
                      <div>
                        <p className="font-['Rajdhani'] text-base font-bold uppercase tracking-wide text-[#f4f4f6]">
                          {selectedGame?.name ?? t('selectGame')}
                        </p>
                        <p className="text-xs font-medium text-[#8c8c9a]">
                          <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-[#00f5a0]" />
                          {gamesOnline[selectedGame?.id ?? ''] ?? 0} {t('players')}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button
                    className="min-h-[48px] text-sm font-bold uppercase tracking-wider"
                    isLoading={isFindingMatch}
                    onClick={handleFindMatch}
                  >
                    <ZapIcon size={18} />
                    <span>{isFindingMatch ? t('findingMatch') : t('quickMatch')}</span>
                  </Button>
                </div>
              </div>
            </section>

            {/* ─── Arenas Grid Title ─── */}
            <div className="mt-10 mb-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="h-4 w-1 rounded-full bg-[#d4ff00]" />
                <h2 className="font-['Rajdhani'] text-2xl sm:text-3xl font-bold uppercase tracking-wide text-[#f4f4f6]">
                  {t('arenas')}
                </h2>
              </div>
              <span className="font-['Rajdhani'] text-xs font-bold uppercase tracking-wider text-[#8c8c9a]">
                3 ARENAS DISPONIBLES
              </span>
            </div>

            {/* ─── Games Cartridge Deck ─── */}
            <section className="grid gap-5 xl:grid-cols-3">
              {games.map((game) => (
                <GameCard
                  key={game.id}
                  game={game}
                  isSelected={selectedGameId === game.id}
                  onSelect={selectGame}
                />
              ))}
            </section>

            {/* ─── Arena Telemetry & Podium Deck ─── */}
            <section className="mt-8 grid gap-6 xl:grid-cols-2">
              {isDetailsLoading || !details ? (
                <>
                  <div className={loadingPanelClass}>
                    <Spinner size={28} />
                    <span className="font-['Rajdhani'] text-sm font-bold uppercase tracking-wider text-[#8c8c9a]">
                      {t('loadingLeaderboard')}
                    </span>
                  </div>
                  <div className={loadingPanelClass}>
                    <Spinner size={28} />
                    <span className="font-['Rajdhani'] text-sm font-bold uppercase tracking-wider text-[#8c8c9a]">
                      {t('loadingStats')}
                    </span>
                  </div>
                </>
              ) : (
                <ErrorBoundary>
                  <Leaderboard gameName={details.gameName} entries={details.leaderboard} />
                  <StatsPanel stats={details.stats} />
                </ErrorBoundary>
              )}
            </section>
          </>
        )}
      </section>
    </main>
  );
}

export default Home;
