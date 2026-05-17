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
    <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-[12px] border border-[rgba(58,58,78,0.72)] bg-gradient-to-b from-[rgba(28,28,40,0.97)] to-[rgba(24,24,35,0.97)] p-[22px]">
      <div className="mb-[18px] inline-flex items-center gap-2.5 text-[1.8rem] font-bold tracking-[-0.04em]">
        <BarsIcon />
        <span>My stats - {stats.gameName}</span>
      </div>
      <div className="grid flex-1 content-start gap-3.5 sm:grid-cols-2">
        {stats.tiles.map((tile) => (
          <article
            key={tile.label}
            className="rounded-[8px] border border-[rgba(42,42,58,0.8)] bg-[rgba(17,17,25,0.82)] p-4"
          >
            <p className="mb-2.5 text-white/30">{tile.label}</p>
            <p className="m-0 text-[2.3rem] leading-none font-bold">{tile.value}</p>
            <p className="mt-2 text-[1.05rem] font-semibold text-[#5dcaa5]">{tile.note}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default StatsPanel;
