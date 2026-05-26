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
    <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-[28px] border border-[rgba(141,232,255,0.14)] bg-[linear-gradient(180deg,rgba(8,18,34,0.95),rgba(5,12,24,0.98))] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.2)]">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="inline-flex items-center gap-2.5 text-[1.8rem] font-bold tracking-[-0.04em]">
          <TrophyIcon />
          <span>Leaders - {gameName}</span>
        </div>
        <span className="rounded-full border border-[rgba(255,199,106,0.22)] bg-[rgba(255,199,106,0.08)] px-3 py-1 text-[0.78rem] uppercase tracking-[0.2em] text-[#ffd58a]">
          Top {entries.length}
        </span>
      </div>
      <div className="grid min-h-0 flex-1 gap-3 overflow-auto pr-1">
        {entries.map((entry) => (
          <div
            key={entry.rank}
            className="grid grid-cols-[44px_1fr_auto] items-center gap-4 rounded-[22px] border border-[rgba(141,232,255,0.08)] bg-[rgba(255,255,255,0.02)] px-4 py-3.5"
          >
            <span
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[rgba(141,232,255,0.12)] text-[1.05rem] font-bold"
              style={{ color: entry.rankColor }}
            >
              {entry.rank}
            </span>
            <div>
              <div className="text-[1.2rem] font-[650] leading-[1.05]">{entry.username}</div>
              <div className="text-[#d9ebff]/40">ELO {entry.elo}</div>
            </div>
            <span className="text-[1.15rem] font-bold text-[#86f0be]">{entry.wins}W</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Leaderboard;
