import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { findMatch as requestMatch, getGameDetails, getGames } from '../services/gameService';
import { getLeaderboard } from '../services/leaderboardService';
import {
  getGameStoreState,
  setCurrentGame,
  setSelectedGame,
  subscribeToGameStore,
} from '../store/gameStore';
import type { Game, GameDetails, MatchSession } from '../types/game.types';

export function useGame() {
  const gameState = useSyncExternalStore(
    subscribeToGameStore,
    getGameStoreState,
    getGameStoreState,
  );
  const [games, setGames] = useState<Game[]>([]);
  const [details, setDetails] = useState<GameDetails | null>(null);
  const [isLobbyLoading, setIsLobbyLoading] = useState(true);
  const [isDetailsLoading, setIsDetailsLoading] = useState(true);
  const [isFindingMatch, setIsFindingMatch] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    const loadLobby = async () => {
      setIsLobbyLoading(true);
      const lobbyGames = await getGames();

      if (isCancelled) {
        return;
      }

      setGames(lobbyGames);
      setIsLobbyLoading(false);

      const currentSelection = getGameStoreState().selectedGameId;

      if (!currentSelection) {
        const fallbackGame = lobbyGames.find((game) => game.isAvailable);

        if (fallbackGame) {
          setSelectedGame(fallbackGame.id);
        }
      }
    };

    void loadLobby();

    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    let isCancelled = false;

    const loadDetails = async () => {
      if (!gameState.selectedGameId) {
        setDetails(null);
        setIsDetailsLoading(false);
        return;
      }

      setIsDetailsLoading(true);

      const [gameDetails, leaderboard] = await Promise.all([
        getGameDetails(gameState.selectedGameId),
        getLeaderboard(gameState.selectedGameId),
      ]);

      if (isCancelled) {
        return;
      }

      setDetails({
        ...gameDetails,
        leaderboard,
      });
      setIsDetailsLoading(false);
    };

    void loadDetails();

    return () => {
      isCancelled = true;
    };
  }, [gameState.selectedGameId]);

  const totalPlayersOnline = useMemo(
    () => games.reduce((sum, game) => sum + (game.playersOnline ?? 0), 0),
    [games],
  );

  const selectedGame = useMemo(
    () => games.find((game) => game.id === gameState.selectedGameId) ?? null,
    [games, gameState.selectedGameId],
  );

  const findMatch = async (): Promise<MatchSession | null> => {
    if (!gameState.selectedGameId) {
      return null;
    }

    setIsFindingMatch(true);

    try {
      const match = await requestMatch(gameState.selectedGameId);
      setCurrentGame(match.gameId, match.queuedAt);
      return match;
    } finally {
      setIsFindingMatch(false);
    }
  };

  return {
    games,
    details,
    selectedGame,
    selectedGameId: gameState.selectedGameId,
    currentGameId: gameState.currentGameId,
    queuedAt: gameState.queuedAt,
    totalPlayersOnline,
    isLobbyLoading,
    isDetailsLoading,
    isFindingMatch,
    selectGame: setSelectedGame,
    findMatch,
  };
}
