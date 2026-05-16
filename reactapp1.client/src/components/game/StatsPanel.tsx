import type { PlayerStats } from '../../types/player.types';

interface StatsPanelProps {
  stats: PlayerStats;
}

function BarsIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 20V10" />
      <path d="M10 20V4" />
      <path d="M16 20v-7" />
      <path d="M22 20V8" />
    </svg>
  );
}

function StatsPanel({ stats }: StatsPanelProps) {
  return (
    <section className="panel-card page-shell">
      <div className="panel-header">
        <BarsIcon />
        <span>My stats - {stats.gameName}</span>
      </div>
      <div className="stats-grid">
        {stats.tiles.map((tile) => (
          <article key={tile.label} className="stat-card">
            <p className="stat-label">{tile.label}</p>
            <p className="stat-value">{tile.value}</p>
            <p className="stat-note">{tile.note}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default StatsPanel;
