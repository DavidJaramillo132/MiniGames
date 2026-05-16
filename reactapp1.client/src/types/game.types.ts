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

export interface GameDetails {
  gameId: string;
  gameName: string;
  roomStatus: string;
  updatedAt: string;
  leaderboard: LeaderboardEntry[];
  stats: PlayerStats;
}

export interface MatchSession {
  gameId: string;
  matchId: string;
  queuedAt: string;
}
