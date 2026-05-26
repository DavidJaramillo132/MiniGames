import { apiFetch } from './api';
import type { LeaderboardEntry, PlayerStats } from '../types/player.types';

export async function getLeaderboard(gameId: string): Promise<LeaderboardEntry[]> {
  return apiFetch<LeaderboardEntry[]>(`/leaderboard/${encodeURIComponent(gameId)}`);
}

export async function getMyStats(gameId: string): Promise<PlayerStats> {
  return apiFetch<PlayerStats>(`/leaderboard/${encodeURIComponent(gameId)}/me`);
}
