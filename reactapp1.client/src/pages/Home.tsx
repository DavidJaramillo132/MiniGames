import { useNavigate } from 'react-router-dom';
import GameCard from '../components/game/GameCard';
import Leaderboard from '../components/game/Leaderboard';
import StatsPanel from '../components/game/StatsPanel';
import Navbar from '../components/layout/Navbar';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import ErrorBoundary from '../components/ui/ErrorBoundary';
import { useGame } from '../hooks/useGame';
import { usePresence } from '../hooks/usePresence';

function ArenaIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.9">
      <path d="M4 7h16" />
      <path d="M7 4v16" />
      <path d="M17 4v16" />
      <path d="M4 17h16" />
    </svg>
  );
}

function BoltIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.9">
      <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />
    </svg>
  );
}

function Home() {
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
    const match = await findMatch();
    if (match) { navigate(`/game/${match.gameId}`); }
  };

  const loadingPanelClass =
    'flex min-h-[320px] flex-col items-center justify-center gap-3 rounded-[30px] border border-[rgba(141,232,255,0.14)] bg-[linear-gradient(180deg,rgba(8,18,34,0.95),rgba(5,12,24,0.98))] text-[#d6e8f8]/68 shadow-[0_24px_60px_rgba(0,0,0,0.2)]';

  return (
    <main className="min-h-screen bg-transparent text-[#edf6ff]">
      <div className="relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(120,230,255,0.12),transparent_26%),radial-gradient(circle_at_80%_18%,rgba(255,123,99,0.08),transparent_20%)]" />

        <Navbar onlineCount={totalOnline} />

        <section className="relative mx-auto max-w-[1360px] px-6 pb-10 pt-2 max-sm:px-4">
          {isLobbyLoading ? (
            <div className={loadingPanelClass}>
              <Spinner size={28} />
              <span>Loading lobby...</span>
            </div>
          ) : (
            <>
              <section className="min-h-[240px]">
                <article className="flex h-full overflow-hidden rounded-[34px] border border-[rgba(141,232,255,0.16)] bg-[linear-gradient(135deg,rgba(8,18,34,0.96),rgba(6,14,28,0.96))] p-5 shadow-[0_28px_90px_rgba(0,0,0,0.22)]">
                  <div className="flex w-full flex-wrap items-center justify-between gap-6">
                    <div className="min-w-[240px] flex-1">
                      <span className="text-[0.78rem] uppercase tracking-[0.26em] text-[#97dafc]/68">Lobby central</span>
                      <h1 className="mt-1 font-['Rajdhani'] text-[clamp(2rem,4vw,2.8rem)] font-bold uppercase leading-[0.9] tracking-[0.05em]">
                        Choose the next
                        <span className="block text-[#78e6ff]">fight.</span>
                      </h1>
                      <p className="mt-2 max-w-[480px] text-[0.92rem] leading-6 text-[#d6e8f8]/68">
                        Select a game, check your rank, and jump into a match.
                      </p>
                    </div>

                    <div className="flex min-w-[200px] flex-col items-stretch gap-3">
                      <div className="rounded-[16px] border border-[rgba(120,230,255,0.12)] bg-[rgba(255,255,255,0.02)] px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="inline-flex h-[40px] w-[40px] items-center justify-center rounded-[12px] border"
                            style={{
                              color: selectedGame?.accentColor ?? '#78e6ff',
                              borderColor: `${selectedGame?.accentColor ?? '#78e6ff'}55`,
                              backgroundColor: `${selectedGame?.accentColor ?? '#78e6ff'}20`,
                            }}
                          >
                            <ArenaIcon />
                          </div>
                          <div>
                            <p className="text-[0.95rem] font-bold">{selectedGame?.name ?? 'Select a game'}</p>
                            <p className="text-xs text-[#d6e8f8]/62">
                              <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-[#86f0be]" />
                              {gamesOnline[selectedGame?.id ?? ''] ?? 0} jugadores
                            </p>
                          </div>
                        </div>
                      </div>

                      <Button
                        className="min-h-[48px] shadow-[0_0_28px_rgba(59,130,246,0.35)] transition-all duration-200 hover:scale-[1.02]"
                        isLoading={isFindingMatch}
                        onClick={handleFindMatch}
                      >
                        <BoltIcon />
                        {isFindingMatch ? 'Finding match...' : 'Quick match'}
                      </Button>
                    </div>
                  </div>
                </article>
              </section>

              <div className="mt-10 flex items-center gap-3">
                <div className="h-px flex-1 bg-[linear-gradient(90deg,rgba(141,232,255,0.15),transparent)]" />
                <span className="text-[0.72rem] uppercase tracking-[0.28em] text-[#97dafc]/36">arenas</span>
                <div className="h-px flex-1 bg-[linear-gradient(270deg,rgba(141,232,255,0.15),transparent)]" />
              </div>

              <section className="min-h-[300px] mt-5 grid gap-4 xl:grid-cols-3">
                {games.map((game) => (
                  <GameCard
                    key={game.id}
                    game={game}
                    isSelected={selectedGameId === game.id}
                    onSelect={selectGame}
                  />
                ))}
              </section>

              <section className="min-h-[240px] mt-6 grid gap-5 xl:grid-cols-2">
                {isDetailsLoading || !details ? (
                  <>
                    <div className={loadingPanelClass}>
                      <Spinner size={28} />
                      <span>Loading leaderboard...</span>
                    </div>
                    <div className={loadingPanelClass}>
                      <Spinner size={28} />
                      <span>Loading your stats...</span>
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
      </div>
    </main>
  );
}

export default Home;
