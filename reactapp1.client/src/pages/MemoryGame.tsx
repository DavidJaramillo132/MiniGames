import { HubConnection, HubConnectionBuilder, HubConnectionState, LogLevel } from '@microsoft/signalr';
import { useEffect, useRef, useState } from 'react';
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { usePresence } from '../hooks/usePresence';
import { useAuthStore } from '../store/authStore';
import { useI18n } from '../i18n/LanguageContext';
import { playMemoryTone, prepareGameAudio } from '../utils/gameAudio';

type Card = { position: number; state: 'hidden' | 'revealed' | 'claimed'; value: string | null };
type State = { isStarted: boolean; jugadoresConectados: number; gameState?: { cards: Card[]; scores: number[]; currentPlayerIndex: number; isResolving: boolean; isFinished: boolean; winnerIndex: number | null } };
type Assignment = { symbol: 'X' | 'O' };
type Result = { accepted: boolean; replayed: boolean; message?: string };

function MemoryGame() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { roomId } = useParams<{ roomId: string }>();
  const [searchParams] = useSearchParams();
  const roomName = searchParams.get('name') ?? roomId;
  const { totalOnline, gameOnline } = usePresence('memory');
  const connectionRef = useRef<HubConnection | null>(null);
  const isRoomJoinedRef = useRef(false);
  const keys = useRef(new Map<number, string>());
  const [state, setState] = useState<State | null>(null);
  const [playerIndex, setPlayerIndex] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [isRoomJoined, setIsRoomJoined] = useState(false);

  useEffect(() => {
    if (!roomId) return;
    let isDisposed = false;
    const connection = new HubConnectionBuilder().withUrl(import.meta.env.VITE_SIGNALR_HUB ?? '/gameHub', { accessTokenFactory: () => useAuthStore.getState().token ?? '' }).withAutomaticReconnect().configureLogging(LogLevel.Warning).build();
    connectionRef.current = connection;
    const onState = (next: State) => { setState(next); setMessage(next.isStarted ? t('gameInProgress') : t('waitingSecond')); };
    const onAssignment = (assignment: Assignment) => setPlayerIndex(assignment.symbol === 'X' ? 0 : 1);
    const onPlayers = (jugadoresConectados: number) => setState(current => current ? { ...current, jugadoresConectados } : current);
    const onGameStarted = () => {
      setState(current => current ? { ...current, isStarted: true } : current);
      setMessage(t('gameInProgress'));
    };
    // The in-room view is already driven by EstadoJuegoActualizado; this subscribes to global room-list broadcasts.
    const onRoomsChanged = () => {};
    const joinRoom = async () => {
      isRoomJoinedRef.current = false;
      if (!isDisposed) setIsRoomJoined(false);
      await connection.invoke('UnirseSala', roomId);
      if (!isDisposed) {
        isRoomJoinedRef.current = true;
        setIsRoomJoined(true);
      }
    };
    connection.on('EstadoJuegoActualizado', onState);
    connection.on('AsignacionJugador', onAssignment);
    connection.on('JugadoresEnSala', onPlayers);
    connection.on('JuegoIniciado', onGameStarted);
    connection.on('RoomsChanged', onRoomsChanged);
    connection.onreconnecting(() => {
      isRoomJoinedRef.current = false;
      if (!isDisposed) setIsRoomJoined(false);
    });
    connection.onreconnected(() => {
      void joinRoom().catch(() => {
        if (!isDisposed) setMessage(t('roomConnectFailed'));
      });
    });
    const startTimer = window.setTimeout(() => {
      void connection.start()
        .then(joinRoom)
        .catch(() => {
          if (!isDisposed) setMessage(t('roomConnectFailed'));
        });
    }, 0);
    return () => {
      isDisposed = true;
      window.clearTimeout(startTimer);
      isRoomJoinedRef.current = false;
      connection.off('EstadoJuegoActualizado', onState);
      connection.off('AsignacionJugador', onAssignment);
      connection.off('JugadoresEnSala', onPlayers);
      connection.off('JuegoIniciado', onGameStarted);
      connection.off('RoomsChanged', onRoomsChanged);
      connectionRef.current = null;
      void connection.stop();
    };
  }, [roomId, t]);

  const flip = async (position: number) => {
    await prepareGameAudio();
    const connection = connectionRef.current;
    const game = state?.gameState;
    if (!connection || connection.state !== HubConnectionState.Connected || !isRoomJoinedRef.current || !roomId || !game || playerIndex !== game.currentPlayerIndex || game.isResolving || game.isFinished) return;
    const key = keys.current.get(position) ?? crypto.randomUUID();
    keys.current.set(position, key);
    try {
      const result = await connection.invoke<Result>('JugarAccion', roomId, 'flip', JSON.stringify({ position }), key);
      if (result.accepted) {
        keys.current.delete(position);
        if (!result.replayed) playMemoryTone();
      } else { keys.current.delete(position); setMessage(result.message ?? t('flipRejected')); }
    } catch { setMessage(t('flipConfirmFailed')); }
  };

  if (!roomId) return <Navigate to="/game/memory" replace />;
  const game = state?.gameState;
  const isMyTurn = playerIndex === game?.currentPlayerIndex;

  return (
    <main className="min-h-screen bg-transparent text-[#f4f4f6]">
      <Navbar onlineCount={totalOnline} gameOnlineCount={gameOnline} />
      <section className="px-6 py-6 max-sm:px-4 lg:flex lg:min-h-[calc(100vh-7rem)] lg:items-center lg:py-6">
        <div className="mx-auto w-full max-w-5xl rounded-[26px] border border-white/[0.08] bg-[#111114] p-6 sm:p-8 shadow-[0_24px_70px_rgba(0,0,0,0.8)]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="font-['Rajdhani'] text-3xl sm:text-4xl font-bold uppercase tracking-[0.04em] text-[#f4f4f6]">
              Room {roomName}
            </h1>
            <div className="flex flex-wrap gap-2.5">
              <Badge variant="primary">{state?.jugadoresConectados ?? 0}/2 players</Badge>
              <Badge variant="success">You: {game?.scores[playerIndex ?? 0] ?? 0} pairs</Badge>
              {state?.jugadoresConectados === 2 && (
                <Badge variant="warning">Rival: {game?.scores[playerIndex === 0 ? 1 : 0] ?? 0} pairs</Badge>
              )}
            </div>
          </div>

          {/* Tactical Status Banner */}
          <div className="mt-5 rounded-[16px] border border-white/[0.08] bg-[#0d0d10] px-5 py-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className={`h-2.5 w-2.5 rounded-full ${
                game?.isFinished
                  ? 'bg-[#00f5a0] shadow-[0_0_10px_#00f5a0]'
                  : isMyTurn && isRoomJoined
                  ? 'bg-[#d4ff00] animate-ping shadow-[0_0_10px_#d4ff00]'
                  : 'bg-[#ffaa00]'
              }`} />
              <p className="text-sm font-bold uppercase tracking-[0.08em] text-[#f4f4f6]">
                {game?.isFinished
                  ? game.winnerIndex === null
                    ? <span className="text-[#ffaa00]">Draw match.</span>
                    : game.winnerIndex === playerIndex
                    ? <span className="text-[#00f5a0]">🎉 Victory! You found the most pairs.</span>
                    : <span className="text-[#ff3355]">Opponent won this round.</span>
                  : isMyTurn && isRoomJoined
                  ? <span className="text-[#d4ff00]">Your turn: flip a card.</span>
                  : game?.isResolving
                  ? <span className="text-[#ffaa00]">Checking pair...</span>
                  : <span className="text-[#8c8c9a]">{message}</span>}
              </p>
            </div>
            {isMyTurn && !game?.isFinished && isRoomJoined && (
              <span className="hidden sm:inline-block font-['Rajdhani'] text-xs font-bold uppercase tracking-[0.16em] text-[#d4ff00] px-2.5 py-1 rounded-full border border-[#d4ff00]/30 bg-[#d4ff00]/10">
                ACTIVE TURN
              </span>
            )}
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3.5 sm:gap-4 lg:grid-cols-4">
            {(
              game?.cards ??
              Array.from({ length: 12 }, (_, position) => ({
                position,
                state: 'hidden' as const,
                value: null,
              }))
            ).map((card) => {
              const isHidden = card.state === 'hidden';
              const isClaimed = card.state === 'claimed';
              const isRevealed = card.state === 'revealed';

              return (
                <button
                  key={card.position}
                  type="button"
                  aria-label={`Card ${card.position + 1}: ${
                    isHidden ? 'Hidden' : card.value ?? 'Revealed'
                  }`}
                  disabled={
                    !isRoomJoined ||
                    !isMyTurn ||
                    !isHidden ||
                    game?.isResolving ||
                    game?.isFinished
                  }
                  onClick={() => flip(card.position)}
                  className={`aspect-square rounded-[18px] border text-2xl sm:text-3xl font-bold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4ff00] focus-visible:ring-offset-2 focus-visible:ring-offset-[#08080a] ${
                    isClaimed
                      ? 'border-[#00f5a0] bg-[#00f5a0]/15 text-[#00f5a0] shadow-[0_0_18px_rgba(0,245,160,0.25)] opacity-85'
                      : isRevealed
                      ? 'border-[#d4ff00] bg-[#d4ff00]/15 text-[#ffffff] shadow-[0_0_24px_rgba(212,255,0,0.35)] scale-[1.02]'
                      : 'border-white/[0.08] bg-[#17171d] text-[#8c8c9a] hover:border-[#d4ff00] hover:text-[#d4ff00] hover:bg-[#1f1f27] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 shadow-[0_6px_18px_rgba(0,0,0,0.5)]'
                  }`}
                >
                  {isHidden ? (
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-[#0d0d10] font-['Rajdhani'] text-sm font-bold text-[#8c8c9a]">
                      {card.position + 1}
                    </span>
                  ) : (
                    <span className="font-['Rajdhani'] text-3xl sm:text-4xl font-bold uppercase tracking-tight text-[#f4f4f6]">
                      {card.value ?? '?'}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-8 flex justify-end">
            <Button variant="surface" onClick={() => navigate('/game/memory')}>
              Back to Memory lobby
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}

export default MemoryGame;
