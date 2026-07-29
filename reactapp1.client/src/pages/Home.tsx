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
              <section className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
                <article className="overflow-hidden rounded-[34px] border border-[rgba(141,232,255,0.16)] bg-[linear-gradient(135deg,rgba(8,18,34,0.96),rgba(6,14,28,0.96))] p-7 shadow-[0_28px_90px_rgba(0,0,0,0.22)]">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="grid gap-3">
                      <span className="text-[0.82rem] uppercase tracking-[0.26em] text-[#97dafc]/68">Lobby central</span>
                      <h1 className="font-['Rajdhani'] text-[clamp(3.2rem,6vw,5.2rem)] font-bold uppercase leading-[0.9] tracking-[0.05em]">
                        Choose the next
                        <span className="block text-[#78e6ff]">fight.</span>
                      </h1>
                      <p className="max-w-[700px] text-[1.02rem] leading-7 text-[#d6e8f8]/68">
                        Select a game, check your rank, and jump into a match. The lobby works as a main arena: clear, fast, and focused on competing.
                      </p>
                    </div>

                    <div className="rounded-[24px] border border-[rgba(134,240,190,0.18)] bg-[rgba(134,240,190,0.08)] px-4 py-3 text-right">
                      <div className="text-[0.78rem] uppercase tracking-[0.22em] text-[#c6ffee]/64">Active pulse</div>
                       <div className="mt-2 text-[1.8rem] font-bold text-[#f6fffb]">{totalOnline}</div>
                      <div className="text-sm text-[#c6ffee]/68">players online</div>
                    </div>
                  </div>

                  <div className="mt-7 grid gap-4 md:grid-cols-[1fr_auto]">
                    <div className="rounded-[28px] border border-[rgba(120,230,255,0.14)] bg-[rgba(255,255,255,0.03)] p-5">
                      <div className="flex items-center gap-3">
                        <div
                          className="inline-flex h-[52px] w-[52px] items-center justify-center rounded-[18px] border"
                          style={{
                            color: selectedGame?.accentColor ?? '#78e6ff',
                            borderColor: `${selectedGame?.accentColor ?? '#78e6ff'}55`,
                            backgroundColor: `${selectedGame?.accentColor ?? '#78e6ff'}20`,
                          }}
                        >
                          <ArenaIcon />
                        </div>
                        <div>
                          <p className="text-[0.78rem] uppercase tracking-[0.2em] text-[#d6e8f8]/44">Selected game</p>
                          <h2 className="mt-1 text-[1.7rem] font-bold tracking-[-0.04em]">
                            {selectedGame?.name ?? 'No game selected'}
                          </h2>
                        </div>
                      </div>
                      <p className="mt-4 text-sm leading-7 text-[#d6e8f8]/62">
                        {selectedGame?.description ?? 'Choose a game to see stats, rooms, and matchmaking.'}
                      </p>
                    </div>

                    <Button className="min-h-[100%] min-w-[220px]" isLoading={isFindingMatch} onClick={handleFindMatch}>
                      <BoltIcon />
                      {isFindingMatch ? 'Finding match...' : 'Quick match'}
                    </Button>
                  </div>
                </article>

                <aside className="grid gap-4">
                  <article className="rounded-[30px] border border-[rgba(141,232,255,0.14)] bg-[linear-gradient(180deg,rgba(8,18,34,0.95),rgba(5,12,24,0.98))] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.2)]">
                    <p className="text-[0.82rem] uppercase tracking-[0.24em] text-[#97dafc]/62">Session focus</p>
                    <h2 className="mt-2 text-[1.7rem] font-bold tracking-[-0.04em]">
                      {selectedGame?.name ?? 'Ready to play'}
                    </h2>
                    <p className="mt-3 text-sm leading-7 text-[#d6e8f8]/62">
                      {selectedGame?.isAvailable
                         ? `${gamesOnline[selectedGame.id] ?? 0} players are active in this arena.`
                        : selectedGame?.statusLabel ?? 'Select an arena to continue.'}
                    </p>
                  </article>

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                    <article className="rounded-[26px] border border-[rgba(255,199,106,0.16)] bg-[rgba(255,199,106,0.07)] p-5">
                      <p className="text-[0.78rem] uppercase tracking-[0.2em] text-[#ffd9a0]/60">Ranked energy</p>
                      <p className="mt-2 text-[1.5rem] font-semibold leading-tight text-[#fff7eb]">
                        Check the leaderboard and push your next streak.
                      </p>
                    </article>

                    <article className="rounded-[26px] border border-[rgba(134,240,190,0.16)] bg-[rgba(134,240,190,0.07)] p-5">
                      <p className="text-[0.78rem] uppercase tracking-[0.2em] text-[#c6ffee]/60">Fast loop</p>
                      <p className="mt-2 text-[1.5rem] font-semibold leading-tight text-[#effff8]">
                        Select, enter, and play with no friction.
                      </p>
                    </article>
                  </div>
                </aside>
              </section>

              <section className="mt-6 grid gap-5 xl:grid-cols-3">
                {games.map((game) => (
                  <GameCard
                    key={game.id}
                    game={game}
                    isSelected={selectedGameId === game.id}
                    onSelect={selectGame}
                  />
                ))}
              </section>

              <section className="mt-6 grid gap-5 xl:grid-cols-2">
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
