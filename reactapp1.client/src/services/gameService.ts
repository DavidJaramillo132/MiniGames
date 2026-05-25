import { apiFetch } from './api';
import type { Game, GameDetails, MatchSession } from '../types/game.types';
import type { LeaderboardEntry } from '../types/player.types';

// ── Room summary type (used by Game.tsx) ─────────────────────────────────────

export interface RoomSummary {
  id: string;
  name: string;
  creator: string;
  players: number;
  capacity: number;
  roomCode: string;
  gameSlug: string;
}

// ── API response types ───────────────────────────────────────────────────────

interface GameApiResponse {
  id: string;
  name: string;
  description: string;
  accentColor: string;
  playersOnline: number;
  isAvailable: boolean;
  statusLabel?: string;
}

interface RoomApiResponse {
  id: string;
  gameSlug: string;
  name: string;
  roomCode: string;
  status: string;
  capacity: number;
  currentPlayers: number;
  creator: string;
  createdAt: string;
}

// ── Games ────────────────────────────────────────────────────────────────────

export async function getGames(): Promise<Game[]> {
  const response = await apiFetch<GameApiResponse[]>('/games');

  return response.map((g) => ({
    id: g.id,
    name: g.name,
    description: g.description,
    accentColor: g.accentColor,
    playersOnline: g.playersOnline,
    isAvailable: g.isAvailable,
    statusLabel: g.statusLabel,
  }));
}

export async function getGameDetails(gameId: string): Promise<GameDetails> {
  // Build game details from the games + leaderboard endpoints
  const [games, leaderboard] = await Promise.all([
    apiFetch<GameApiResponse[]>('/games'),
    apiFetch<LeaderboardEntry[]>(`/leaderboard/${gameId}`),
  ]);

  const game = games.find((g) => g.id === gameId) ?? games[0];

  return {
    gameId: game.id,
    gameName: game.name,
    roomStatus: 'Queue open',
    updatedAt: new Date().toISOString(),
    leaderboard,
    stats: {
      gameName: game.name,
      tiles: [
        { label: 'Victories', value: '—', note: 'Login to see stats' },
        { label: 'ELO', value: '1500', note: 'Starting rating' },
        { label: 'Matches played', value: '—', note: 'Play to earn stats' },
        { label: 'Win streak', value: '—', note: 'Start playing!' },
      ],
    },
  };
}

// ── Rooms ────────────────────────────────────────────────────────────────────

export async function getRoomsForGame(gameSlug: string): Promise<RoomSummary[]> {
  const response = await apiFetch<RoomApiResponse[]>(`/rooms?gameSlug=${encodeURIComponent(gameSlug)}`);

  return response.map((r) => ({
    id: r.roomCode,
    name: r.name,
    creator: r.creator,
    players: r.currentPlayers,
    capacity: r.capacity,
    roomCode: r.roomCode,
    gameSlug: r.gameSlug,
  }));
}

export async function createRoom(
  gameSlug: string,
  name: string,
  roomCode?: string,
): Promise<RoomSummary> {
  const response = await apiFetch<RoomApiResponse>('/rooms', {
    method: 'POST',
    body: JSON.stringify({ gameSlug, name, roomCode: roomCode || undefined }),
  });

  return {
    id: response.roomCode,
    name: response.name,
    creator: response.creator,
    players: response.currentPlayers,
    capacity: response.capacity,
    roomCode: response.roomCode,
    gameSlug: response.gameSlug,
  };
}

// ── Match (kept for compatibility) ───────────────────────────────────────────

export async function findMatch(gameId: string): Promise<MatchSession> {
  // For now, just return a session stub — the real matchmaking happens
  // when the player creates/joins a room via SignalR.
  return {
    gameId,
    matchId: `${gameId}-${Date.now()}`,
    queuedAt: new Date().toISOString(),
  };
}
