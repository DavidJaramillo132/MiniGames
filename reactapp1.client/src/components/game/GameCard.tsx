import type { ReactNode } from 'react';
import Badge from '../ui/Badge';
import type { Game } from '../../types/game.types';

interface GameCardProps {
  game: Game;
  isSelected: boolean;
  onSelect: (gameId: string) => void;
}

const iconByGameId: Record<string, ReactNode> = {
  'tic-tac-toe': (
    <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.9">
      <path d="M8 7L16 17" />
      <path d="M16 7L8 17" />
      <circle cx="12" cy="12" r="9" />
    </svg>
  ),

  trivia: (
    <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M9.5 9a2.5 2.5 0 1 1 4.4 1.6c-.7.8-1.9 1.5-1.9 2.9" />
      <path d="M12 17h.01" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="M4.9 4.9l1.4 1.4" />
      <path d="M17.7 17.7l1.4 1.4" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="M4.9 19.1l1.4-1.4" />
      <path d="M17.7 6.3l1.4-1.4" />
    </svg>
  ),
  memory: (
    <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
    </svg>
  ),
};

function GameCard({ game, isSelected, onSelect }: GameCardProps) {
  const isDisabled = !game.isAvailable;
  const accentBackground = `${game.accentColor}20`;

  return (
    <button
      type="button"
      className="group relative overflow-hidden rounded-[28px] border p-6 text-left text-[#edf6ff] transition duration-200 enabled:hover:-translate-y-1 disabled:cursor-not-allowed"
      style={{
        borderColor: isSelected ? game.accentColor : 'rgba(141,232,255,0.14)',
        backgroundImage:
          'radial-gradient(circle at top right, rgba(255,255,255,0.06), transparent 26%), linear-gradient(180deg, rgba(8,18,34,0.96), rgba(5,12,24,0.96))',
        boxShadow: isSelected
          ? `0 0 0 1px ${game.accentColor} inset, 0 24px 60px ${game.accentColor}22`
          : '0 20px 50px rgba(0,0,0,0.22)',
        opacity: isDisabled ? 0.62 : 1,
      }}
      onClick={() => {
        if (!isDisabled) {
          onSelect(game.id);
        }
      }}
      disabled={isDisabled}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-1"
        style={{ background: `linear-gradient(90deg, transparent, ${game.accentColor}, transparent)` }}
      />

      <div className="mb-6 flex items-start justify-between gap-3">
        <div
          className="inline-flex h-[60px] w-[60px] items-center justify-center rounded-[20px] border"
          style={{
            color: game.accentColor,
            backgroundColor: accentBackground,
            borderColor: `${game.accentColor}55`,
            boxShadow: `0 10px 30px ${game.accentColor}24`,
          }}
        >
          {iconByGameId[game.id]}
        </div>
        <span className="rounded-full border border-[rgba(141,232,255,0.14)] bg-[rgba(255,255,255,0.03)] px-3 py-1.5 text-[0.72rem] uppercase tracking-[0.24em] text-[#d6e8f8]/66">
          {isSelected ? 'Selected' : 'Arena'}
        </span>
      </div>

      <div
        className="absolute right-5 top-16 h-24 w-24 rounded-full opacity-40 blur-3xl transition duration-200 group-hover:opacity-60"
        style={{ backgroundColor: `${game.accentColor}44` }}
      />

      <h2 className="relative z-10 m-0 text-[2.1rem] font-bold tracking-[-0.05em]">{game.name}</h2>
      <p className="relative z-10 mb-6 mt-2 max-w-[28rem] text-[0.98rem] leading-7 text-[#d6e8f8]/62">
        {game.description}
      </p>

      <div className="relative z-10 flex flex-wrap items-center gap-3">
        {game.isAvailable ? (
          <Badge variant="success">{game.playersOnline} jugando ahora</Badge>
        ) : (
          <Badge variant="warning" isStatic>
            {game.statusLabel}
          </Badge>
        )}

        <span className="text-sm uppercase tracking-[0.2em] text-[#d6e8f8]/46">
          {isDisabled ? 'Coming soon' : 'Ready for match'}
        </span>
      </div>
    </button>
  );
}

export default GameCard;
