import type { PlayerStats } from '../../types/player.types';
import { useI18n } from '../../i18n/LanguageContext';

interface StatsPanelProps {
  stats: PlayerStats;
}

function BarsIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 20V10" />
      <path d="M10 20V4" />
      <path d="M16 20v-7" />
      <path d="M22 20V8" />
    </svg>
  );
}

function StatsPanel({ stats }: StatsPanelProps) {
  const { t } = useI18n();
  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-[16px] border border-[rgba(141,232,255,0.14)] bg-[linear-gradient(180deg,rgba(8,18,34,0.95),rgba(5,12,24,0.98))] p-4 shadow-[0_24px_60px_rgba(0,0,0,0.2)]">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="inline-flex items-center gap-2 text-[1.35rem] font-bold tracking-[-0.04em]">
          <BarsIcon />
          <span>{t('myStats')}</span>
        </div>
        <span className="rounded-full border border-[rgba(120,230,255,0.22)] bg-[rgba(120,230,255,0.08)] px-2.5 py-0.5 text-[0.72rem] uppercase tracking-[0.2em] text-[#9cecff]">
          {t('personal')}
        </span>
      </div>
      <div className="grid flex-1 content-start gap-3 sm:grid-cols-2">
        {stats.tiles.map((tile) => (
          <article
            key={tile.label}
            className="rounded-[14px] border border-[rgba(141,232,255,0.1)] bg-[rgba(255,255,255,0.02)] p-3.5"
          >
            <p className="mb-2 text-[0.78rem] uppercase tracking-[0.18em] text-[#d9ebff]/50">
              {tile.label}
            </p>
            <p className="m-0 text-[1.8rem] leading-none font-bold tracking-[-0.05em] text-[#f5f7ff]">
              {tile.value}
            </p>
            <p className="mt-2 text-[0.9rem] font-semibold text-[#86f0be]">{tile.note}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default StatsPanel;
