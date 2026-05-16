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
  'batalla-naval': (
    <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 16h16" />
      <path d="M7 16l2-8h6l2 8" />
      <path d="M11 8V4h2" />
      <path d="M3 18c1.2 1.1 2.5 1.6 3.9 1.6 1.4 0 2.8-.5 4.1-1.6 1.3 1.1 2.6 1.6 4 1.6s2.7-.5 4-1.6" />
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
};

function GameCard({ game, isSelected, onSelect }: GameCardProps) {
  const isDisabled = !game.isAvailable;

  return (
    <button
      type="button"
      className={`game-card${isSelected ? ' is-selected' : ''}${isDisabled ? ' is-disabled' : ''}`}
      style={{ ['--card-accent' as string]: game.accentColor }}
      onClick={() => {
        if (!isDisabled) {
          onSelect(game.id);
        }
      }}
      disabled={isDisabled}
    >
      <div className="game-icon">{iconByGameId[game.id]}</div>
      <h2 className="game-title">{game.name}</h2>
      <p className="game-description">{game.description}</p>
      {game.isAvailable ? (
        <Badge variant="success">{game.playersOnline} jugando</Badge>
      ) : (
        <Badge variant="warning" isStatic>
          {game.statusLabel}
        </Badge>
      )}
    </button>
  );
}

export default GameCard;
