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

    let isDisposed = false;
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

    connection.onreconnecting(() => {
      if (!isDisposed) setStatus('reconnecting');
    });

    connection.onreconnected(() => {
      if (!isDisposed) setStatus('connected');
    });

    connection.onclose(() => {
      if (!isDisposed) setStatus('disconnected');
    });

    const startTimer = window.setTimeout(() => {
      setConnection(connection);
      void connection.start()
        .then(() => {
          if (!isDisposed) setStatus('connected');
        })
        .catch((err) => {
          if (!isDisposed) {
            setError(err instanceof Error ? err.message : 'Connection failed');
            setStatus('disconnected');
          }
        });
    }, 0);

    return () => {
      isDisposed = true;
      window.clearTimeout(stateTimer);
      window.clearTimeout(startTimer);
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
