// this file is son of game.tsx
import type { LeaderboardEntry } from '../../types/player.types';
interface LeaderboardProps {
  gameName: string;
  entries: LeaderboardEntry[];
}

function TrophyIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#f0bf52" strokeWidth="1.8">
      <path d="M8 4h8v3a4 4 0 0 1-8 0V4Z" />
      <path d="M6 6H4a2 2 0 0 0 2 2" />
      <path d="M18 6h2a2 2 0 0 1-2 2" />
      <path d="M12 11v5" />
      <path d="M8.5 20h7" />
      <path d="M9 16h6" />
    </svg>
  );
}

function Leaderboard({ entries }: LeaderboardProps) {
  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-[16px] border border-[rgba(141,232,255,0.14)] bg-[linear-gradient(180deg,rgba(8,18,34,0.95),rgba(5,12,24,0.98))] p-4 shadow-[0_24px_60px_rgba(0,0,0,0.2)]">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="inline-flex items-center gap-2 text-[1.35rem] font-bold tracking-[-0.04em]">
          <TrophyIcon />
          <span>Clasificación general</span>
        </div>
        <span className="rounded-full border border-[rgba(255,199,106,0.22)] bg-[rgba(255,199,106,0.08)] px-2.5 py-0.5 text-[0.72rem] uppercase tracking-[0.2em] text-[#ffd58a]">
          Top {entries.length}
        </span>
      </div>
      <div className="grid min-h-0 flex-1 gap-2 overflow-auto pr-1">
        {entries.map((entry) => (
          <div
            key={entry.rank}
            className="grid grid-cols-[36px_1fr_auto] items-center gap-3 rounded-[12px] border border-[rgba(141,232,255,0.08)] bg-[rgba(255,255,255,0.02)] px-3 py-2.5"
          >
            <span
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[rgba(141,232,255,0.12)] text-[0.9rem] font-bold"
              style={{ color: entry.rankColor }}
            >
              {entry.rank}
            </span>
            <div>
              <div className="text-[1rem] font-[650] leading-[1.05] text-[#f5f7ff]">{entry.username}</div>
              <div className="text-sm text-[#d9ebff]/55">ELO {entry.elo}</div>
            </div>
            <span className="text-[1rem] font-bold text-[#86f0be]">{entry.wins}W</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Leaderboard;
