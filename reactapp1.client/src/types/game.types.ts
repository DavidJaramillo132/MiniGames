import type { LeaderboardEntry, PlayerStats } from './player.types';

export interface Game {
  id: string;
  name: string;
  description: string;
  accentColor: string;
  playersOnline?: number;
  isAvailable: boolean;
  statusLabel?: string;
}

export interface GameInfo {
  gameId: string;
  gameName: string;
  roomStatus: string;
  updatedAt: string;
}

export interface GameDetails extends GameInfo {
  leaderboard: LeaderboardEntry[];
  stats: PlayerStats;
}

export interface MatchSession {
  gameId: string;
  matchId: string;
  queuedAt: string;
}
