import { apiFetch } from './api';
import type { LeaderboardEntry } from '../types/player.types';

export async function getLeaderboard(gameId: string): Promise<LeaderboardEntry[]> {
  return apiFetch<LeaderboardEntry[]>(`/leaderboard/${encodeURIComponent(gameId)}`);
}
