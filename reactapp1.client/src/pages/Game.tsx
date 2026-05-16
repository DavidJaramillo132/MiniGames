import { useEffect } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Navbar from '../components/layout/Navbar';
import Leaderboard from '../components/game/Leaderboard';
import StatsPanel from '../components/game/StatsPanel';
import { useGame } from '../hooks/useGame';
import { useSignalR } from '../hooks/useSignalR';
import { formatDate } from '../utils/formatDate';

function Game() {
  const navigate = useNavigate();
  const { gameId } = useParams<{ gameId: string }>();
  const { totalPlayersOnline, details, selectedGame, isDetailsLoading, selectGame } = useGame();
  const { status, hubUrl } = useSignalR(Boolean(gameId), gameId);

  useEffect(() => {
    if (gameId) {
      selectGame(gameId);
    }
  }, [gameId, selectGame]);

  if (!gameId) {
    return <Navigate to="/home" replace />;
  }

  return (
    <main className="page-shell home-layout">
      <div className="home-shell">
        <Navbar onlineCount={totalPlayersOnline} />

        <section className="game-content">
          {isDetailsLoading || !details || !selectedGame ? (
            <div className="panel-card loading-card">
              <span className="spinner" />
              <span>Loading match room...</span>
            </div>
          ) : (
            <div className="game-page-grid">
              <section className="panel-card match-card">
                <div className="match-meta">
                  <div className="section-heading">Game Room</div>
                  <h1 className="match-title">{details.gameName}</h1>
                  <p className="match-copy">{selectedGame.description}</p>
                </div>

                <div className="match-status-row">
                  <Badge variant="success">{details.roomStatus}</Badge>
                  <Badge variant="primary">{status}</Badge>
                </div>

                <div className="info-list">
                  <div className="info-item">
                    <span className="info-label">Players online</span>
                    <strong>{selectedGame.playersOnline ?? 0}</strong>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Last sync</span>
                    <strong>{formatDate(details.updatedAt)}</strong>
                  </div>
                  <div className="info-item">
                    <span className="info-label">SignalR hub</span>
                    <strong>{hubUrl}</strong>
                  </div>
                </div>

                <Button variant="surface" onClick={() => navigate('/home')}>
                  Back to lobby
                </Button>
              </section>

              <div className="details-grid" style={{ marginTop: 0 }}>
                <Leaderboard gameName={details.gameName} entries={details.leaderboard} />
                <StatsPanel stats={details.stats} />
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default Game;
