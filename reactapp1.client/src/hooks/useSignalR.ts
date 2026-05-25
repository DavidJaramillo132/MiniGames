import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { useEffect, useMemo, useRef, useState } from 'react';

type SignalRStatus = 'idle' | 'connecting' | 'connected';

export function useSignalR(enabled = false, roomId?: string) {
  const connectionRef = useRef<ReturnType<HubConnectionBuilder['build']> | null>(null);
  const hubUrl = useMemo(
    () => `${import.meta.env.VITE_SIGNALR_HUB ?? '/gameHub'}${roomId ? `?room=${roomId}` : ''}`,
    [roomId],
  );
  const [status, setStatus] = useState<SignalRStatus>(enabled ? 'connecting' : 'idle');

  useEffect(() => {
    if (!enabled) {
      setStatus('idle');
      connectionRef.current = null;
      return;
    }

    setStatus('connecting');

    // Prepara la conexión para el backend real, mientras mantenemos un flujo mockeado en frontend.
    connectionRef.current = new HubConnectionBuilder()
      .withUrl(hubUrl)
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Warning)
      .build();

    const timer = window.setTimeout(() => {
      setStatus('connected');
    }, 500);

    return () => {
      window.clearTimeout(timer);
      connectionRef.current = null;
      setStatus('idle');
    };
  }, [enabled, hubUrl]);

  return {
    connection: connectionRef.current,
    hubUrl,
    status,
    isConnected: status === 'connected',
  };
}
