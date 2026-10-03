import type { PlayerStats } from '../../types/player.types';
import { useI18n } from '../../i18n/LanguageContext';
import { ZapIcon } from '../ui/Icons';

interface StatsPanelProps {
  stats: PlayerStats;
}

function StatsPanel({ stats }: StatsPanelProps) {
  const { t } = useI18n();

  return (
    <section className="flex h-full min-h-[380px] flex-col overflow-hidden rounded-[24px] border border-white/[0.08] bg-[#111114] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
      <div className="mb-5 flex items-center justify-between gap-3 pb-3 border-b border-white/[0.08]">
        <div className="inline-flex items-center gap-2.5 font-['Rajdhani'] text-2xl font-bold uppercase tracking-wide text-[#f4f4f6]">
          <ZapIcon size={24} className="text-[#d4ff00]" />
          <span>{t('myStats')}</span>
        </div>
        <span className="rounded-full border border-[#d4ff00]/30 bg-[#d4ff00]/10 px-3 py-1 font-['Rajdhani'] text-xs font-bold uppercase tracking-wider text-[#d4ff00]">
          {t('personal')}
        </span>
      </div>

      <div className="grid flex-1 content-start gap-4 sm:grid-cols-2">
        {stats.tiles.map((tile) => (
          <article
            key={tile.label}
            className="rounded-[16px] border border-white/[0.08] bg-[#0d0d10] p-5 transition-all hover:border-white/[0.22] hover:bg-[#15151a]"
          >
            <p className="mb-2 font-['Rajdhani'] text-xs font-bold uppercase tracking-wider text-[#8c8c9a]">
              {tile.label}
            </p>
            <p className="m-0 font-['Rajdhani'] text-4xl leading-none font-bold text-[#f4f4f6]">
              {tile.value}
            </p>
            <p className="mt-3 font-['Rajdhani'] text-xs font-bold uppercase tracking-wider text-[#00f5a0]">
              {tile.note}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default StatsPanel;
