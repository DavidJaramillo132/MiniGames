import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { useEffect, useMemo, useState } from 'react';
import { useAuthStore } from '../store/authStore';

type SignalRStatus = 'idle' | 'connecting' | 'connected' | 'disconnected' | 'reconnecting';

export function useSignalR(enabled = false, roomId?: string) {
  const [connection, setConnection] = useState<ReturnType<HubConnectionBuilder['build']> | null>(null);
  const hubUrl = useMemo(
    () => `${import.meta.env.VITE_SIGNALR_HUB ?? '/gameHub'}${roomId ? `?room=${roomId}` : ''}`,
    [roomId],
  );
  const [status, setStatus] = useState<SignalRStatus>(enabled ? 'connecting' : 'idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      const timer = window.setTimeout(() => {
        setStatus('idle');
        setError(null);
        setConnection(null);
      }, 0);

      return () => window.clearTimeout(timer);
    }

    const stateTimer = window.setTimeout(() => {
      setStatus('connecting');
      setError(null);
    }, 0);

    const token = useAuthStore.getState().token;

    const connection = new HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => token ?? '',
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(LogLevel.Warning)
      .build();

    const connectionTimer = window.setTimeout(() => setConnection(connection), 0);

    connection.onreconnecting(() => {
      setStatus('reconnecting');
    });

    connection.onreconnected(() => {
      setStatus('connected');
    });

    connection.onclose(() => {
      setStatus('disconnected');
    });

    connection.start()
      .then(() => setStatus('connected'))
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Connection failed');
        setStatus('disconnected');
      });

    return () => {
      window.clearTimeout(stateTimer);
      window.clearTimeout(connectionTimer);
      connection.stop().catch(() => {});
      setConnection(null);
      setStatus('idle');
    };
  }, [enabled, hubUrl]);

  return {
    connection,
    hubUrl,
    status,
    isConnected: status === 'connected',
    error,
  };
}
