import type { LeaderboardEntry } from '../../types/player.types';
import { useI18n } from '../../i18n/LanguageContext';
import { TrophyIcon } from '../ui/Icons';

interface LeaderboardProps {
  gameName: string;
  entries: LeaderboardEntry[];
}

function Leaderboard({ entries }: LeaderboardProps) {
  const { t } = useI18n();

  return (
    <section className="flex h-full min-h-[380px] flex-col overflow-hidden rounded-[24px] border border-white/[0.08] bg-[#111114] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
      <div className="mb-5 flex items-center justify-between gap-3 pb-3 border-b border-white/[0.08]">
        <div className="inline-flex items-center gap-2.5 font-['Rajdhani'] text-2xl font-bold uppercase tracking-wide text-[#f4f4f6]">
          <TrophyIcon size={24} className="text-[#d4ff00]" />
          <span>{t('leaderboard')}</span>
        </div>
        <span className="rounded-full border border-[#d4ff00]/30 bg-[#d4ff00]/10 px-3 py-1 font-['Rajdhani'] text-xs font-bold uppercase tracking-wider text-[#d4ff00]">
          TOP {entries.length} GUILD
        </span>
      </div>

      <div className="grid min-h-0 flex-1 gap-2.5 overflow-auto pr-1">
        {entries.map((entry) => {
          const isGold = entry.rank === 1;
          const isSilver = entry.rank === 2;
          const isBronze = entry.rank === 3;

          const rankColor = isGold
            ? '#d4ff00'
            : isSilver
            ? '#e4e4e7'
            : isBronze
            ? '#a1a1aa'
            : '#8c8c9a';

          const rankBorder = isGold
            ? 'rgba(212,255,0,0.45)'
            : isSilver
            ? 'rgba(228,228,231,0.3)'
            : isBronze
            ? 'rgba(161,161,170,0.3)'
            : 'rgba(255,255,255,0.08)';

          const rankBg = isGold
            ? 'rgba(212,255,0,0.12)'
            : isSilver
            ? 'rgba(228,228,231,0.08)'
            : isBronze
            ? 'rgba(161,161,170,0.08)'
            : 'rgba(255,255,255,0.02)';

          return (
            <div
              key={entry.rank}
              className="grid grid-cols-[40px_1fr_auto] items-center gap-3.5 rounded-[16px] border border-white/[0.08] bg-[#0d0d10] px-4 py-3 transition-all hover:border-white/[0.22] hover:bg-[#15151a]"
            >
              <span
                className="inline-flex h-9 w-9 items-center justify-center rounded-[10px] border font-['Rajdhani'] text-lg font-bold"
                style={{
                  color: rankColor,
                  borderColor: rankBorder,
                  backgroundColor: rankBg,
                }}
              >
                {entry.rank}
              </span>
              <div>
                <div className="font-['Rajdhani'] text-lg font-bold uppercase tracking-wide text-[#f4f4f6]">
                  {entry.username}
                </div>
                <div className="text-xs font-semibold text-[#8c8c9a]">
                  ELO <strong className="text-[#d4ff00]">{entry.elo}</strong>
                </div>
              </div>
              <span className="rounded-full border border-[#00f5a0]/30 bg-[#00f5a0]/10 px-3 py-1 font-['Rajdhani'] text-xs font-bold uppercase tracking-wider text-[#00f5a0]">
                {t('wins', { count: entry.wins })}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default Leaderboard;
