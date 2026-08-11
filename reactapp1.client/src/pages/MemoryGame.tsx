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
  const keys = useRef(new Map<number, string>());
  const [state, setState] = useState<State | null>(null);
  const [playerIndex, setPlayerIndex] = useState<number | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!roomId) return;
    const connection = new HubConnectionBuilder().withUrl(import.meta.env.VITE_SIGNALR_HUB ?? '/gameHub', { accessTokenFactory: () => useAuthStore.getState().token ?? '' }).withAutomaticReconnect().configureLogging(LogLevel.Warning).build();
    connectionRef.current = connection;
    const onState = (next: State) => { setState(next); setMessage(next.isStarted ? t('gameInProgress') : t('waitingSecond')); };
    const onAssignment = (assignment: Assignment) => setPlayerIndex(assignment.symbol === 'X' ? 0 : 1);
    connection.on('EstadoJuegoActualizado', onState);
    connection.on('AsignacionJugador', onAssignment);
    void connection.start().then(() => connection.invoke('UnirseSala', roomId)).catch(() => setMessage(t('roomConnectFailed')));
    return () => { connection.off('EstadoJuegoActualizado', onState); connection.off('AsignacionJugador', onAssignment); connectionRef.current = null; void connection.stop(); };
  }, [roomId, t]);

  const flip = async (position: number) => {
    prepareGameAudio();
    const connection = connectionRef.current;
    const game = state?.gameState;
    if (!connection || connection.state !== HubConnectionState.Connected || !roomId || !game || playerIndex !== game.currentPlayerIndex || game.isResolving || game.isFinished) return;
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
  return <main className="min-h-screen text-[#edf6ff]"><Navbar onlineCount={totalOnline} gameOnlineCount={gameOnline} /><section className="px-6 py-5 max-sm:px-4 lg:flex lg:min-h-[calc(100vh-7rem)] lg:items-center lg:py-4"><div className="mx-auto w-full max-w-5xl rounded-[34px] border border-[rgba(141,232,255,0.14)] bg-[rgba(8,18,34,0.96)] p-6"><div className="flex flex-wrap justify-between gap-3"><div><span className="text-sm uppercase tracking-[0.18em] text-[#97dafc]/58">Memory / Pairs</span><h1 className="font-['Rajdhani'] text-4xl font-bold uppercase">Room {roomName}</h1></div><div className="flex gap-2"><Badge variant="primary">{state?.jugadoresConectados ?? 0}/2 players</Badge><Badge variant="success">You {game?.scores[playerIndex ?? 0] ?? 0} pairs</Badge></div></div><p className="mt-3 text-[#d7ebff]/70">{game?.isFinished ? game.winnerIndex === null ? 'Draw.' : game.winnerIndex === playerIndex ? 'You win.' : 'Opponent wins.' : isMyTurn ? 'Your turn: flip a card.' : game?.isResolving ? 'Resolving cards...' : message}</p><div className="mt-4 grid grid-cols-3 gap-3 lg:grid-cols-4">{(game?.cards ?? Array.from({ length: 12 }, (_, position) => ({ position, state: 'hidden' as const, value: null }))).map(card => <button key={card.position} type="button" disabled={!isMyTurn || card.state !== 'hidden' || game?.isResolving || game?.isFinished} onClick={() => flip(card.position)} className="aspect-square rounded-[18px] border border-[rgba(141,232,255,0.14)] bg-[rgba(255,255,255,0.03)] text-3xl disabled:opacity-60">{card.value ?? '?'}</button>)}</div><div className="mt-4 flex justify-end"><Button onClick={() => navigate('/game/memory')}>Back to Memory lobby</Button></div></div></section></main>;
}

export default MemoryGame;
