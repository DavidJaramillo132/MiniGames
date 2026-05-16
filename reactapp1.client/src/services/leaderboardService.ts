import { mockRequest } from './api';
import { mockGameDetailsMap } from './gameService';
import type { LeaderboardEntry } from '../types/player.types';

export async function getLeaderboard(gameId: string): Promise<LeaderboardEntry[]> {
  return mockRequest(mockGameDetailsMap[gameId]?.leaderboard ?? []);
}
