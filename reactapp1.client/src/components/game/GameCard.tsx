import type { ReactNode } from 'react';
import Badge from '../ui/Badge';
import type { Game } from '../../types/game.types';
import { useI18n } from '../../i18n/LanguageContext';
import { playTactileClickTone, prepareGameAudio } from '../../utils/gameAudio';
import { GamepadIcon } from '../ui/Icons';

interface GameCardProps {
  game: Game;
  isSelected: boolean;
  onSelect: (gameId: string) => void;
}

const iconByGameId: Record<string, ReactNode> = {
  'tic-tac-toe': (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M8 7L16 17" />
      <path d="M16 7L8 17" />
      <circle cx="12" cy="12" r="9" />
    </svg>
  ),
  trivia: (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9.5 9a2.5 2.5 0 1 1 4.4 1.6c-.7.8-1.9 1.5-1.9 2.9" />
      <path d="M12 17h.01" />
      <circle cx="12" cy="12" r="10" />
    </svg>
  ),
  memory: (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="8" height="8" rx="2" />
      <rect x="13" y="3" width="8" height="8" rx="2" />
      <rect x="3" y="13" width="8" height="8" rx="2" />
      <rect x="13" y="13" width="8" height="8" rx="2" />
    </svg>
  ),
};

function GameCard({ game, isSelected, onSelect }: GameCardProps) {
  const { t } = useI18n();
  const isDisabled = !game.isAvailable;
  const accentColor = game.accentColor || '#d4ff00';

  const handleClick = async () => {
    if (isDisabled) return;
    await prepareGameAudio();
    playTactileClickTone();
    onSelect(game.id);
  };

  return (
    <button
      type="button"
      className={`group relative overflow-hidden rounded-[22px] border p-6 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4ff00] focus-visible:ring-offset-2 focus-visible:ring-offset-[#08080a] ${
        isDisabled
          ? 'cursor-not-allowed opacity-50 border-white/[0.04] bg-[#0d0d10]'
          : isSelected
          ? 'border-[#d4ff00] bg-[#17171d] shadow-[0_0_24px_rgba(212,255,0,0.2)]'
          : 'border-white/[0.08] bg-[#111114] hover:border-white/[0.22] hover:bg-[#15151a] shadow-[0_8px_24px_rgba(0,0,0,0.5)]'
      }`}
      onClick={handleClick}
      disabled={isDisabled}
    >
      <div className="mb-5 flex items-start justify-between gap-3">
        <div
          className="inline-flex h-12 w-12 items-center justify-center rounded-[14px] border transition-transform duration-200 group-hover:scale-105"
          style={{
            color: accentColor,
            backgroundColor: `${accentColor}18`,
            borderColor: `${accentColor}40`,
          }}
        >
          {iconByGameId[game.id] ?? <GamepadIcon size={24} />}
        </div>
        <span
          className={`rounded-full px-3 py-1 font-['Rajdhani'] text-xs font-bold uppercase tracking-wider ${
            isSelected
              ? 'border border-[#d4ff00]/40 bg-[#d4ff00]/15 text-[#d4ff00]'
              : 'border border-white/[0.08] bg-[#0d0d10] text-[#8c8c9a]'
          }`}
        >
          {isSelected ? t('selected') : t('arena')}
        </span>
      </div>

      <h2 className="font-['Rajdhani'] text-2xl font-bold uppercase tracking-wide text-[#f4f4f6] group-hover:text-[#d4ff00] transition-colors">
        {game.name}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-[#8c8c9a] line-clamp-2">
        {game.description}
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/[0.08]">
        {game.isAvailable ? (
          <Badge variant="success">
            {t('playingNow', { count: game.playersOnline ?? 0 })}
          </Badge>
        ) : (
          <Badge variant="warning" isStatic>
            {game.statusLabel}
          </Badge>
        )}

        <span className="font-['Rajdhani'] text-xs font-bold uppercase tracking-wider text-[#d4ff00]">
          {isSelected ? 'ARENA SELECCIONADA' : 'SELECCIONAR'}
        </span>
      </div>
    </button>
  );
}

export default GameCard;
