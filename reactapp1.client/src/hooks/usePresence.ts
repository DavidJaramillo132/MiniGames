import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';

interface PresenceSnapshot {
  totalOnline: number;
  games: Record<string, number>;
}

const emptySnapshot: PresenceSnapshot = { totalOnline: 0, games: {} };

export function usePresence(gameId?: string) {
  const [snapshot, setSnapshot] = useState<PresenceSnapshot>(emptySnapshot);

  useEffect(() => {
    let isDisposed = false;
    const connection = new HubConnectionBuilder()
      .withUrl(import.meta.env.VITE_PRESENCE_HUB ?? '/presenceHub', {
        accessTokenFactory: () => useAuthStore.getState().token ?? '',
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(LogLevel.Warning)
      .build();

    const handlePresenceUpdated = (nextSnapshot: PresenceSnapshot) => {
      if (!isDisposed) {
        setSnapshot(nextSnapshot);
      }
    };

    const setCurrentGame = async () => {
      if (connection.state === 'Connected') {
        await connection.invoke('SetGame', gameId ?? null);
      }
    };

    connection.on('PresenceUpdated', handlePresenceUpdated);
    connection.onreconnected(() => {
      void setCurrentGame();
    });

    void connection.start()
      .then(setCurrentGame)
      .catch((error: unknown) => {
        if (!isDisposed) {
          console.error('Failed to connect to presence hub:', error);
        }
      });

    return () => {
      isDisposed = true;
      connection.off('PresenceUpdated', handlePresenceUpdated);
      void connection.stop();
      setSnapshot(emptySnapshot);
    };
  }, [gameId]);

  return {
    totalOnline: snapshot.totalOnline,
    gameOnline: gameId ? snapshot.games[gameId] ?? 0 : 0,
    gamesOnline: snapshot.games,
  };
}
