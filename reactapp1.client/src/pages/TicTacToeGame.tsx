import { HubConnection, HubConnectionBuilder, HubConnectionState, LogLevel } from '@microsoft/signalr';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { useGame } from '../hooks/useGame';
import { useAuthStore } from '../store/authStore';
import { usePresence } from '../hooks/usePresence';
import { useI18n } from '../i18n/LanguageContext';
import { playTicTacToeTone, prepareGameAudio } from '../utils/gameAudio';

type BoardCell = string;
type PlayerSymbol = 'X' | 'O';

interface RoomStateDto {
  salaId: string;
  board: string[];
  currentTurn: PlayerSymbol;
  currentTurnPlayerName?: string | null;
  playerXName?: string | null;
  playerOName?: string | null;
  isStarted: boolean;
  isFinished: boolean;
  winner: string | null;
  jugadoresConectados: number;
}

interface PlayerAssignmentDto {
  symbol: PlayerSymbol;
  playerName: string;
}

interface MoveSubmissionDto {
  accepted: boolean;
  replayed: boolean;
  message?: string | null;
}

const emptyBoard: BoardCell[] = Array.from({ length: 9 }, () => '');

function TicTacToeGame() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { roomId, gameId } = useParams<{ roomId: string; gameId?: string }>();
  const [searchParams] = useSearchParams();
  const roomName = searchParams.get('name') ?? roomId;
  const { selectGame } = useGame();
  const { totalOnline, gameOnline } = usePresence('tic-tac-toe');
  const connectionRef = useRef<HubConnection | null>(null);
  const pendingMoveKeys = useRef(new Map<number, string>());
  const [connectionState, setConnectionState] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [board, setBoard] = useState<BoardCell[]>(emptyBoard);
  const [currentTurn, setCurrentTurn] = useState<PlayerSymbol>('X');
  const [currentTurnPlayerName, setCurrentTurnPlayerName] = useState<string>('Jugador X');
  const [playerSymbol, setPlayerSymbol] = useState<PlayerSymbol | null>(null);
  const [playerXName, setPlayerXName] = useState<string>('Jugador X');
  const [playerOName, setPlayerOName] = useState<string>('Jugador O');
  const [isStarted, setIsStarted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [playersConnected, setPlayersConnected] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    selectGame('tic-tac-toe');
  }, [selectGame]);

  useEffect(() => {
    if (gameId && gameId !== 'tic-tac-toe') {
      navigate(`/game/${gameId}`, { replace: true });
    }
  }, [gameId, navigate]);

  useEffect(() => {
    if (!roomId) {
      return;
    }

    let isDisposed = false;
    const connection = new HubConnectionBuilder()
      .withUrl(`${import.meta.env.VITE_SIGNALR_HUB ?? '/gameHub'}`, {
        accessTokenFactory: () => useAuthStore.getState().token ?? '',
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Warning)
      .build();

    connectionRef.current = connection;

    const handleRoomState = (state: RoomStateDto) => {
      const resolvedPlayerXName = state.playerXName || 'Jugador X';
      const resolvedPlayerOName = state.playerOName || 'Jugador O';
      const resolvedCurrentTurnPlayerName =
        state.currentTurnPlayerName ||
        (state.currentTurn === 'X' ? resolvedPlayerXName : resolvedPlayerOName);

      setBoard(state.board ?? emptyBoard);
      setCurrentTurn(state.currentTurn);
      setCurrentTurnPlayerName(resolvedCurrentTurnPlayerName);
      setPlayerXName(resolvedPlayerXName);
      setPlayerOName(resolvedPlayerOName);
      setIsStarted(state.isStarted);
      setIsFinished(state.isFinished);
      setWinner(state.winner);
      setPlayersConnected(state.jugadoresConectados);
      setConnectionState('connected');

      if (state.isFinished) {
        setStatusMessage(
          state.winner
            ? `Partida finalizada. Gana ${state.winner === 'X' ? resolvedPlayerXName : resolvedPlayerOName}.`
            : t('gameFinishedDraw'),
        );
      } else if (state.isStarted) {
        setStatusMessage(`Turno de ${resolvedCurrentTurnPlayerName}.`);
      } else {
        setStatusMessage(t('waitingSecond'));
      }
    };

    const handlePlayerAssignment = (assignment: PlayerAssignmentDto) => {
      setPlayerSymbol(assignment.symbol);
    };

    const handleInvalidMove = (message: string) => {
      setStatusMessage(message);
    };

    const handleGameStarted = () => {
      setStatusMessage(t('gameStarted'));
    };

    const handleGameRestarted = () => {
      setStatusMessage(t('gameRestarted'));
    };

    const handlePlayerDisconnected = () => {
      setStatusMessage(t('playerLeft'));
      setPlayersConnected((current) => Math.max(0, current - 1));
    };

    connection.on('EstadoJuegoActualizado', handleRoomState);
    connection.on('AsignacionJugador', handlePlayerAssignment);
    connection.on('MovimientoInvalido', handleInvalidMove);
    connection.on('JuegoIniciado', handleGameStarted);
    connection.on('PartidaReiniciada', handleGameRestarted);
    connection.on('JugadorDesconectado', handlePlayerDisconnected);

    void (async () => {
      try {
        setStatusMessage(t('enteringRoom', { roomId }));
        await connection.start();

        if (isDisposed) {
          await connection.stop();
          return;
        }

        await connection.invoke('UnirseSala', roomId);
      } catch (error) {
        if (isDisposed) {
          return;
        }

        console.error(error);
        setConnectionState('disconnected');
        setStatusMessage(t('roomConnectFailed'));
      }
    })();

    return () => {
      isDisposed = true;
      connection.off('EstadoJuegoActualizado', handleRoomState);
      connection.off('AsignacionJugador', handlePlayerAssignment);
      connection.off('MovimientoInvalido', handleInvalidMove);
      connection.off('JuegoIniciado', handleGameStarted);
      connection.off('PartidaReiniciada', handleGameRestarted);
      connection.off('JugadorDesconectado', handlePlayerDisconnected);
      connectionRef.current = null;

      if (connection.state === HubConnectionState.Connected) {
        void connection.stop();
      }
    };
  }, [roomId, gameId, navigate, t]);

  const connectionBadge = useMemo(() => {
    if (connectionState === 'connected') {
      return <Badge variant="success">{t('connected')}</Badge>;
    }

    if (connectionState === 'connecting') {
      return <Badge variant="primary">{t('connecting')}</Badge>;
    }

    return <Badge variant="warning">{t('disconnected')}</Badge>;
  }, [connectionState, t]);

  const isMyTurn = playerSymbol === currentTurn && isStarted && !isFinished;
  const winnerName = winner ? (winner === 'X' ? playerXName : playerOName) : null;

  const playerCards = [
    { label: 'Player X', value: playerXName, accent: '#d4ff00' },
    { label: 'Player O', value: playerOName, accent: '#ffffff' },
  ];

  const handlePlay = async (index: number) => {
    await prepareGameAudio();
    const connection = connectionRef.current;

    if (!connection || connection.state !== HubConnectionState.Connected || !roomId) {
      return;
    }

    const idempotencyKey = pendingMoveKeys.current.get(index) ?? crypto.randomUUID();
    pendingMoveKeys.current.set(index, idempotencyKey);

    try {
      const result = await connection.invoke<MoveSubmissionDto>('HacerJugada', roomId, index, idempotencyKey);

      if (!result.accepted) {
        pendingMoveKeys.current.delete(index);
        setStatusMessage(result.message ?? t('moveRejected'));
        return;
      }

      pendingMoveKeys.current.delete(index);
      if (!result.replayed) {
        playTicTacToeTone();
      }
      if (result.replayed) {
        setStatusMessage(result.message ?? t('moveRecorded'));
      }
    } catch (error) {
      console.error(error);
      setStatusMessage(t('moveConfirmFailed'));
    }
  };

  const handleRestart = async () => {
    const connection = connectionRef.current;

    if (!connection || connection.state !== HubConnectionState.Connected || !roomId) {
      return;
    }

    try {
      await connection.invoke('ReiniciarPartida', roomId);
    } catch (error) {
      console.error(error);
      setStatusMessage(t('restartFailed'));
    }
  };

  if (gameId && gameId !== 'tic-tac-toe') {
    return <Navigate to="/game/tic-tac-toe" replace />;
  }

  if (!roomId) {
    return <Navigate to="/game/tic-tac-toe" replace />;
  }

  return (
    <main className="min-h-screen bg-transparent text-[#f4f4f6]">
      <div className="relative min-h-screen">
        <Navbar onlineCount={totalOnline} gameOnlineCount={gameOnline} />

        <section className="relative px-6 py-8 max-sm:px-4">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-8 xl:grid-cols-[1fr_320px] xl:justify-center">

              {/* ─── Left column: Board ─── */}
              <div className="grid gap-6">
                {/* Title + badges */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <h1 className="font-['Rajdhani'] text-[clamp(2.5rem,4.5vw,3.8rem)] leading-none font-bold uppercase tracking-[0.04em] text-[#f4f4f6]">
                    {t('room', { name: roomName ?? '' })}
                  </h1>
                  <div className="flex flex-wrap gap-2.5">
                    {connectionBadge}
                    <Badge variant="primary">{t('playersCount', { count: playersConnected })}</Badge>
                  </div>
                </div>

                {/* Animated turn bar */}
                <div className="grid gap-3">
                  <div className="relative h-2 w-full overflow-hidden rounded-full bg-white/[0.06]">
                    <div
                      className={`absolute inset-y-0 left-0 w-1/2 rounded-full transition-all duration-500 ease-out ${
                        isFinished ? 'opacity-30' : ''
                      }`}
                      style={{
                        transform: isFinished
                          ? 'translateX(25%)'
                          : currentTurn === 'X'
                          ? 'translateX(0%)'
                          : 'translateX(100%)',
                        background: isFinished
                          ? 'rgba(212,255,0,0.3)'
                          : currentTurn === 'X'
                          ? '#d4ff00'
                          : '#ffffff',
                        boxShadow: currentTurn === 'X' ? '0 0 14px rgba(212,255,0,0.7)' : '0 0 14px rgba(255,255,255,0.7)',
                      }}
                    />
                  </div>
                  <p className="text-center text-sm font-bold uppercase tracking-[0.08em] text-[#f4f4f6]">
                    {isFinished ? (
                      winnerName ? (
                        <span className="text-[#00f5a0]">{t('victory', { name: winnerName })}</span>
                      ) : (
                        <span className="text-[#ffaa00]">{t('draw')}</span>
                      )
                    ) : (
                      <span>
                        {t('turn', { name: currentTurnPlayerName })}
                        {isMyTurn ? <span className="text-[#d4ff00] font-bold"> • {t('yourTurn')}</span> : ''}
                      </span>
                    )}
                  </p>
                </div>

                {/* Board */}
                <div className="grid w-full max-w-[720px] grid-cols-3 gap-4 justify-self-center">
                  {board.map((cell, index) => (
                    <button
                      key={`cell-${index}`}
                      type="button"
                      aria-label={`Cell ${index + 1}, ${cell ? cell : 'empty'}`}
                      className="flex aspect-square items-center justify-center rounded-[18px] border border-white/[0.08] bg-[#111114] transition-all duration-150 hover:border-[#d4ff00] hover:bg-[#17171d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4ff00] focus-visible:ring-offset-2 focus-visible:ring-offset-[#08080a] active:scale-[0.96] shadow-[0_8px_24px_rgba(0,0,0,0.6)] disabled:cursor-not-allowed disabled:opacity-60"
                      onClick={() => handlePlay(index)}
                      disabled={!isStarted || isFinished || Boolean(cell) || !isMyTurn}
                    >
                      {cell === 'X' && (
                        <svg viewBox="0 0 24 24" className="w-[52%] h-[52%] stroke-[#d4ff00] filter drop-shadow-[0_0_16px_rgba(212,255,0,0.7)]" fill="none" strokeWidth="2.5" strokeLinecap="round">
                          <line x1="5" y1="5" x2="19" y2="19" />
                          <line x1="19" y1="5" x2="5" y2="19" />
                        </svg>
                      )}
                      {cell === 'O' && (
                        <svg viewBox="0 0 24 24" className="w-[52%] h-[52%] stroke-[#ffffff] filter drop-shadow-[0_0_16px_rgba(255,255,255,0.7)]" fill="none" strokeWidth="2.5">
                          <circle cx="12" cy="12" r="8" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* ─── Right column: Panel lateral ─── */}
              <aside className="xl:sticky xl:top-6 xl:self-start grid content-start gap-4">
                {playerCards.map((card) => (
                  <article
                    key={card.label}
                    className="rounded-[18px] border border-white/[0.08] bg-[#111114] px-5 py-4 text-center shadow-[0_8px_24px_rgba(0,0,0,0.4)]"
                  >
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#8c8c9a]">
                      {card.label}
                    </p>
                    <div
                      className="mt-2 font-['Rajdhani'] text-[2rem] font-bold tracking-tight"
                      style={{ color: card.accent }}
                    >
                      {card.value}
                    </div>
                  </article>
                ))}

                <div className="rounded-[18px] border border-[#ffaa00]/30 bg-[#ffaa00]/10 px-5 py-4 text-center">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#ffaa00]">
                     {t('status')}
                  </p>
                  <p className="mt-2 text-sm font-semibold leading-relaxed text-[#fff7ec]">
                    {statusMessage}
                  </p>
                </div>

                <div className="grid gap-2.5 pt-2">
                  <Button fullWidth variant="surface" onClick={handleRestart} disabled={!isStarted}>
                     {t('restartGame')}
                  </Button>
                  <Button fullWidth onClick={() => navigate('/game/tic-tac-toe')}>
                     {t('backToLobby')}
                  </Button>
                </div>
              </aside>

            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default TicTacToeGame;
