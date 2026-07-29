import { apiFetch } from './api';
import { useAuthStore } from '../store/authStore';
import type { LeaderboardEntry, PlayerStats } from '../types/player.types';

export async function getLeaderboard(gameId: string): Promise<LeaderboardEntry[]> {
  try {
    return await apiFetch<LeaderboardEntry[]>(`/leaderboard/${encodeURIComponent(gameId)}`);
  } catch {
    return [];
  }
}

const DEFAULT_STATS: PlayerStats = {
  gameName: '',
  tiles: [
    { label: 'Victories', value: '0', note: 'No matches yet' },
    { label: 'Matches played', value: '0', note: 'Play to earn stats' },
  ],
};

export async function getMyStats(gameId: string): Promise<PlayerStats> {
  const token = useAuthStore.getState().token;

  if (!token) {
    return { ...DEFAULT_STATS, gameName: gameId };
  }

  try {
    return await apiFetch<PlayerStats>(`/leaderboard/${encodeURIComponent(gameId)}/me`);
  } catch {
    return { ...DEFAULT_STATS, gameName: gameId };
  }
}