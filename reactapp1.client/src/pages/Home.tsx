import { useNavigate } from 'react-router-dom';
import GameCard from '../components/game/GameCard';
import Leaderboard from '../components/game/Leaderboard';
import StatsPanel from '../components/game/StatsPanel';
import Navbar from '../components/layout/Navbar';
import Button from '../components/ui/Button';
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

  return (
    <main className="page-shell home-layout">
      <div className="home-shell">
        <Navbar onlineCount={totalPlayersOnline} />

        <section className="home-content">
          <h1 className="section-heading">Minigames</h1>

          {isLobbyLoading ? (
            <div className="panel-card loading-card">
              <span className="spinner" />
              <span>Loading lobby...</span>
            </div>
          ) : (
            <>
              <div className="games-grid">
                {games.map((game) => (
                  <GameCard
                    key={game.id}
                    game={game}
                    isSelected={selectedGameId === game.id}
                    onSelect={selectGame}
                  />
                ))}
              </div>

              <div className="find-match-wrap">
                <Button fullWidth isLoading={isFindingMatch} onClick={handleFindMatch}>
                  {isFindingMatch ? 'Finding match...' : 'Find match'}
                </Button>
              </div>

              <div className="details-grid">
                {isDetailsLoading || !details ? (
                  <>
                    <div className="panel-card loading-card">
                      <span className="spinner" />
                      <span>Loading leaderboard...</span>
                    </div>
                    <div className="panel-card loading-card">
                      <span className="spinner" />
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
