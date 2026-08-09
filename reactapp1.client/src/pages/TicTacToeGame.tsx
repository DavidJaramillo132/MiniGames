import { HubConnection, HubConnectionBuilder, HubConnectionState, LogLevel } from '@microsoft/signalr';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { useGame } from '../hooks/useGame';
import { useAuthStore } from '../store/authStore';
import { usePresence } from '../hooks/usePresence';

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
  const [statusMessage, setStatusMessage] = useState('Conectando a la sala...');

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
            : 'Partida finalizada en empate.',
        );
      } else if (state.isStarted) {
        setStatusMessage(`Turno de ${resolvedCurrentTurnPlayerName}.`);
      } else {
        setStatusMessage('Esperando al segundo jugador.');
      }
    };

    const handlePlayerAssignment = (assignment: PlayerAssignmentDto) => {
      setPlayerSymbol(assignment.symbol);
    };

    const handleInvalidMove = (message: string) => {
      setStatusMessage(message);
    };

    const handleGameStarted = () => {
      setStatusMessage('La partida ha comenzado.');
    };

    const handleGameRestarted = () => {
      setStatusMessage('La partida se reinicio.');
    };

    const handlePlayerDisconnected = () => {
      setStatusMessage('Un jugador salio de la sala.');
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
        setStatusMessage(`Entrando a la sala ${roomId}...`);
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
        setStatusMessage('No se pudo conectar con la sala.');
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
  }, [roomId, gameId, navigate]);

  const connectionBadge = useMemo(() => {
    if (connectionState === 'connected') {
      return <Badge variant="success">Connected</Badge>;
    }

    if (connectionState === 'connecting') {
      return <Badge variant="primary">Connecting</Badge>;
    }

    return <Badge variant="warning">Disconnected</Badge>;
  }, [connectionState]);

  const isMyTurn = playerSymbol === currentTurn && isStarted && !isFinished;
  const winnerName = winner ? (winner === 'X' ? playerXName : playerOName) : null;

  const playerCards = [
    { label: '', value: playerXName, accent: '#78e6ff' },
    { label: 'Jugador O', value: playerOName, accent: '#ff7b63' },
  ];

  const handlePlay = async (index: number) => {
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
        setStatusMessage(result.message ?? 'La jugada no fue aceptada.');
        return;
      }

      pendingMoveKeys.current.delete(index);
      if (result.replayed) {
        setStatusMessage(result.message ?? 'La jugada ya estaba registrada.');
      }
    } catch (error) {
      console.error(error);
      setStatusMessage('No se pudo confirmar la jugada. Reinténtala para reconciliar el estado.');
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
      setStatusMessage('No se pudo reiniciar la partida.');
    }
  };

  if (gameId && gameId !== 'tic-tac-toe') {
    return <Navigate to="/game/tic-tac-toe" replace />;
  }

  if (!roomId) {
    return <Navigate to="/game/tic-tac-toe" replace />;
  }

  return (
    <main className="min-h-screen bg-transparent text-[#edf6ff]">
      <div className="relative min-h-screen">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(120,230,255,0.12),transparent_26%),radial-gradient(circle_at_80%_18%,rgba(255,123,99,0.08),transparent_20%)]" />

         <Navbar onlineCount={totalOnline} gameOnlineCount={gameOnline} />

        <section className="relative px-6 py-7 max-sm:px-4">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-6 xl:grid-cols-[1fr_320px] xl:justify-center">

              {/* ─── Left column: Board ─── */}
              <div className="grid gap-6">
                {/* Title + badges */}
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="grid gap-2">
                    <span className="text-sm uppercase tracking-[0.18em] text-[#97dafc]/58">
                      Tic-Tac-Toe
                    </span>
                    <h1 className="font-['Rajdhani'] text-[clamp(2.8rem,5vw,4.4rem)] leading-none font-bold uppercase tracking-[0.06em] text-[#f6fbff]">
                      Sala {roomName}
                    </h1>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {connectionBadge}
                    <Badge variant="primary">{playersConnected}/2 players</Badge>
                  </div>
                </div>

                {/* Animated turn bar */}
                <div className="grid gap-3">
                  <div className="relative h-[6px] w-full overflow-hidden rounded-full bg-[rgba(141,232,255,0.08)]">
                    <div
                      className={`absolute inset-y-0 left-0 w-1/2 rounded-full transition-all duration-700 ease-in-out ${
                        isFinished ? 'opacity-30' : ''
                      }`}
                      style={{
                        transform: isFinished
                          ? 'translateX(25%)'
                          : currentTurn === 'X'
                          ? 'translateX(0%)'
                          : 'translateX(100%)',
                        background: isFinished
                          ? 'rgba(141,232,255,0.3)'
                          : currentTurn === 'X'
                          ? 'linear-gradient(90deg, #78e6ff, #4da3ff)'
                          : 'linear-gradient(90deg, #ff7b63, #ff5a3d)',
                      }}
                    />
                  </div>
                  <p className="text-center text-sm font-medium text-[#f2f8ff]">
                    {isFinished ? (
                      winnerName ? (
                        <span>Victoria de <strong>{winnerName}</strong></span>
                      ) : (
                        <span>Empate</span>
                      )
                    ) : (
                      <span>
                        Turno de <strong>{currentTurnPlayerName}</strong>
                        {isMyTurn ? ' • Te toca jugar' : ''}
                      </span>
                    )}
                  </p>
                </div>

                {/* Board */}
                <div className="grid w-full max-w-[860px] grid-cols-3 gap-4 justify-self-center">
                  {board.map((cell, index) => (
                    <button
                      key={`cell-${index}`}
                      type="button"
                      className="flex aspect-square items-center justify-center rounded-[24px] border border-[rgba(141,232,255,0.08)] bg-[rgba(255,255,255,0.03)] text-[clamp(2.8rem,7vw,4.2rem)] font-bold transition hover:border-[rgba(120,230,255,0.5)] disabled:cursor-not-allowed disabled:opacity-60"
                      onClick={() => handlePlay(index)}
                      disabled={!isStarted || isFinished || Boolean(cell) || !isMyTurn}
                    >
                      <span style={{ color: cell === 'O' ? '#ff7b63' : '#78e6ff' }}>{cell}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* ─── Right column: Panel lateral ─── */}
              <aside className="grid content-start gap-4">
                {playerCards.map((card) => (
                  <article
                    key={card.label}
                    className="rounded-[24px] border border-[rgba(141,232,255,0.1)] bg-[rgba(255,255,255,0.03)] px-5 py-4 text-center"
                  >
                    <p className="text-[0.78rem] uppercase tracking-[0.2em] text-[#d7ebff]/40">
                      {card.label}
                    </p>
                    <div
                      className="mt-2 text-[1.75rem] font-bold tracking-[-0.05em]"
                      style={{ color: card.accent }}
                    >
                      {card.value}
                    </div>
                  </article>
                ))}

                <div className="rounded-[24px] border border-[rgba(255,199,106,0.16)] bg-[rgba(255,199,106,0.08)] px-5 py-4 text-center">
                  <p className="text-[0.78rem] uppercase tracking-[0.2em] text-[#ffe2b8]/60">
                    Estado
                  </p>
                  <p className="mt-2 text-[0.95rem] font-semibold leading-5 text-[#fff7ec]">
                    {statusMessage}
                  </p>
                </div>

                <div className="grid gap-2">
                  <Button fullWidth variant="surface" onClick={handleRestart} disabled={!isStarted}>
                    Reiniciar partida
                  </Button>
                  <Button fullWidth onClick={() => navigate('/game/tic-tac-toe')}>
                    Volver al lobby
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
