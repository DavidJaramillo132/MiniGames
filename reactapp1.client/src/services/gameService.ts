import { mockRequest } from './api';
import type { Game, GameDetails, MatchSession } from '../types/game.types';

export const mockGames: Game[] = [
  {
    id: 'tic-tac-toe',
    name: 'Tic-Tac-Toe',
    description: 'Tres en raya clasico',
    accentColor: '#534AB7',
    playersOnline: 38,
    isAvailable: true,
  },
  {
    id: 'batalla-naval',
    name: 'Batalla Naval',
    description: 'Hunde la flota enemiga',
    accentColor: '#5DCAA5',
    playersOnline: 21,
    isAvailable: true,
  },
  {
    id: 'trivia',
    name: 'Trivia',
    description: 'Demuestra tu conocimiento',
    accentColor: '#b7734a',
    isAvailable: false,
    statusLabel: 'Coming soon',
  },
];

export const mockGameDetailsMap: Record<string, GameDetails> = {
  'tic-tac-toe': {
    gameId: 'tic-tac-toe',
    gameName: 'Tic-Tac-Toe',
    roomStatus: 'Queue open',
    updatedAt: new Date().toISOString(),
    leaderboard: [
      { rank: 1, username: 'nova_x', elo: 2035, wins: 121, rankColor: '#f0bf52' },
      { rank: 2, username: 'djdav', elo: 1944, wins: 110, rankColor: '#d7d9e2' },
      { rank: 3, username: 'lunaq', elo: 1898, wins: 97, rankColor: '#f08a5b' },
      { rank: 4, username: 'bytefox', elo: 1812, wins: 86, rankColor: 'rgba(255,255,255,0.36)' },
    ],
    stats: {
      gameName: 'Tic-Tac-Toe',
      tiles: [
        { label: 'Victories', value: '124', note: '+6 this week' },
        { label: 'ELO', value: '1944', note: '+32 rating gain' },
        { label: 'Matches played', value: '201', note: '62% win rate' },
        { label: 'Win streak', value: '5', note: 'ranked victories' },
      ],
    },
  },
  'batalla-naval': {
    gameId: 'batalla-naval',
    gameName: 'Batalla Naval',
    roomStatus: 'Matchmaking live',
    updatedAt: new Date().toISOString(),
    leaderboard: [
      { rank: 1, username: 'marina_k', elo: 1910, wins: 112, rankColor: '#f0bf52' },
      { rank: 2, username: 'djdav', elo: 1820, wins: 95, rankColor: '#d7d9e2' },
      { rank: 3, username: 'luc4s', elo: 1765, wins: 80, rankColor: '#f08a5b' },
      { rank: 4, username: 'carlos_gz', elo: 1720, wins: 67, rankColor: 'rgba(255,255,255,0.36)' },
    ],
    stats: {
      gameName: 'Batalla Naval',
      tiles: [
        { label: 'Victories', value: '95', note: '+3 hoy' },
        { label: 'ELO', value: '1820', note: '+45 esta semana' },
        { label: 'Partidas', value: '158', note: '60% ganadas' },
        { label: 'Racha', value: '8', note: 'victorias seguidas' },
      ],
    },
  },
};

export async function getGames(): Promise<Game[]> {
  return mockRequest(mockGames);
}

export async function getGameDetails(gameId: string): Promise<GameDetails> {
  const details = mockGameDetailsMap[gameId] ?? mockGameDetailsMap['tic-tac-toe'];
  return mockRequest({
    ...details,
    updatedAt: new Date().toISOString(),
  });
}

export async function findMatch(gameId: string): Promise<MatchSession> {
  return mockRequest({
    gameId,
    matchId: `${gameId}-${Date.now()}`,
    queuedAt: new Date().toISOString(),
  });
}
