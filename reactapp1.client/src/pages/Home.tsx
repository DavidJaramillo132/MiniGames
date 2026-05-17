import { useNavigate } from 'react-router-dom';
import GameCard from '../components/game/GameCard';
import Leaderboard from '../components/game/Leaderboard';
import StatsPanel from '../components/game/StatsPanel';
import Navbar from '../components/layout/Navbar';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import { useGame } from '../hooks/useGame';

function Home() {
  const navigate = useNavigate();
  const {
    games,
    details,
    selectedGameId,
    totalPlayersOnline,
    isLobbyLoading,
    isDetailsLoading,
    isFindingMatch,
    selectGame,
    findMatch,
  } = useGame();

  const handleFindMatch = async () => {
    const match = await findMatch();

    if (match) {
      navigate(`/game/${match.gameId}`);
    }
  };
  const appShellClass =
    'min-h-screen w-full overflow-x-hidden border-y border-[#2a2a3a] bg-gradient-to-b from-[rgba(20,20,28,0.98)] to-[rgba(15,15,19,0.98)]';
  const loadingPanelClass =
    'flex min-h-[320px] flex-col items-center justify-center gap-3 rounded-[12px] border border-[rgba(58,58,78,0.72)] bg-gradient-to-b from-[rgba(28,28,40,0.97)] to-[rgba(24,24,35,0.97)] text-[#f5f7ff]/68';

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(83,74,183,0.12),transparent_30%),#0f0f13] font-sans text-[#f5f7ff]">
      <div className={appShellClass}>
        <Navbar onlineCount={totalPlayersOnline} />

        <section className="px-6 pb-8 pt-7 max-sm:px-4">
          <h1 className="mb-5 text-base uppercase tracking-[0.14em] text-white/52">Minigames</h1>

          {isLobbyLoading ? (
            <div className={loadingPanelClass}>
              <Spinner size={28} />
              <span>Loading lobby...</span>
            </div>
          ) : (
            <>
              <div className="grid gap-[18px] xl:grid-cols-3">
                {games.map((game) => (
                  <GameCard
                    key={game.id}
                    game={game}
                    isSelected={selectedGameId === game.id}
                    onSelect={selectGame}
                  />
                ))}
              </div>

              <div className="mt-5">
                <Button fullWidth isLoading={isFindingMatch} onClick={handleFindMatch}>
                  {isFindingMatch ? 'Finding match...' : 'Find match'}
                </Button>
              </div>

              <div className="mt-9 grid gap-[18px] xl:grid-cols-2">
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
                  <>
                    <Leaderboard gameName={details.gameName} entries={details.leaderboard} />
                    <StatsPanel stats={details.stats} />
                  </>
                )}
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}

export default Home;
