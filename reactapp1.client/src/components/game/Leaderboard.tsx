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
    <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-[12px] border border-[rgba(58,58,78,0.72)] bg-gradient-to-b from-[rgba(28,28,40,0.97)] to-[rgba(24,24,35,0.97)] p-[22px]">
      <div className="mb-[18px] inline-flex items-center gap-2.5 text-[1.8rem] font-bold tracking-[-0.04em]">
        <TrophyIcon />
        <span>Leaders - {gameName}</span>
      </div>
      <div className="grid min-h-0 flex-1 gap-3.5 overflow-auto pr-1">
        {entries.map((entry) => (
          <div key={entry.rank} className="grid grid-cols-[28px_1fr_auto] items-center gap-4 py-2.5">
            <span className="text-[1.6rem] font-bold" style={{ color: entry.rankColor }}>
              {entry.rank}
            </span>
            <div>
              <div className="text-[1.55rem] font-[650] leading-[1.05]">{entry.username}</div>
              <div className="text-white/35">ELO {entry.elo}</div>
            </div>
            <span className="text-[1.45rem] font-bold text-[#5dcaa5]">{entry.wins}W</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Leaderboard;
