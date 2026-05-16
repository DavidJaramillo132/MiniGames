import type { LeaderboardEntry } from '../../types/player.types';

interface LeaderboardProps {
  gameName: string;
  entries: LeaderboardEntry[];
}

function TrophyIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#f0bf52" strokeWidth="1.8">
      <path d="M8 4h8v3a4 4 0 0 1-8 0V4Z" />
      <path d="M6 6H4a2 2 0 0 0 2 2" />
      <path d="M18 6h2a2 2 0 0 1-2 2" />
      <path d="M12 11v5" />
      <path d="M8.5 20h7" />
      <path d="M9 16h6" />
    </svg>
  );
}

function Leaderboard({ gameName, entries }: LeaderboardProps) {
  return (
    <section className="panel-card page-shell">
      <div className="panel-header">
        <TrophyIcon />
        <span>Leaders - {gameName}</span>
      </div>
      <div className="leaderboard-list">
        {entries.map((entry) => (
          <div key={entry.rank} className="leaderboard-row">
            <span className="leaderboard-rank" style={{ color: entry.rankColor }}>
              {entry.rank}
            </span>
            <div>
              <div className="leaderboard-name">{entry.username}</div>
              <div className="leaderboard-meta">ELO {entry.elo}</div>
            </div>
            <span className="leaderboard-wins">{entry.wins}W</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Leaderboard;
