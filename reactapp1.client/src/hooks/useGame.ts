import { useEffect, useMemo, useState } from 'react';
import { findMatch as requestMatch, getGameDetails, getGames } from '../services/gameService';
import { getLeaderboard, getMyStats } from '../services/leaderboardService';
import { useGameStore } from '../store/gameStore';
import type { Game, GameDetails, MatchSession } from '../types/game.types';

export function useGame() {
  const { selectedGameId, currentGameId, queuedAt, setSelectedGame, setCurrentGame } = useGameStore();
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

      if (isCancelled) { return; }

      setGames(lobbyGames);
      setIsLobbyLoading(false);

      const currentSelection = useGameStore.getState().selectedGameId;

      if (!currentSelection) {
        const fallbackGame = lobbyGames.find((game) => game.isAvailable);
        if (fallbackGame) { setSelectedGame(fallbackGame.id); }
      }
    };

    void loadLobby();

    return () => { isCancelled = true; };
  }, [setSelectedGame]);

  useEffect(() => {
    let isCancelled = false;

    const loadDetails = async () => {
      if (!selectedGameId) {
        setDetails(null);
        setIsDetailsLoading(false);
        return;
      }

      setIsDetailsLoading(true);

      try {
        const [gameDetails, leaderboard, stats] = await Promise.all([
          getGameDetails(selectedGameId),
          getLeaderboard(selectedGameId),
          getMyStats(selectedGameId),
        ]);

        if (isCancelled) { return; }

        setDetails({
          ...gameDetails,
          leaderboard,
          stats: { ...stats, gameName: gameDetails.gameName },
        });
      } catch (error) {
        console.error('Failed to load game details:', error);
        if (!isCancelled) { setDetails(null); }
      } finally {
        if (!isCancelled) { setIsDetailsLoading(false); }
      }
    };

    void loadDetails();

    return () => { isCancelled = true; };
  }, [selectedGameId]);

  const totalPlayersOnline = useMemo(
    () => games.reduce((sum, game) => sum + (game.playersOnline ?? 0), 0),
    [games],
  );

  const selectedGame = useMemo(
    () => games.find((game) => game.id === selectedGameId) ?? null,
    [games, selectedGameId],
  );

  const findMatch = async (): Promise<MatchSession | null> => {
    if (!selectedGameId) { return null; }

    setIsFindingMatch(true);

    try {
      const match = await requestMatch(selectedGameId);
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
    selectedGameId,
    currentGameId,
    queuedAt,
    totalPlayersOnline,
    isLobbyLoading,
    isDetailsLoading,
    isFindingMatch,
    selectGame: setSelectedGame,
    findMatch,
  };
}