import { HubConnection, HubConnectionBuilder, HubConnectionState, LogLevel } from '@microsoft/signalr';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import Navbar from '../components/layout/Navbar';
import { useGame } from '../hooks/useGame';

type BoardCell = string;

interface RoomStateDto {
  salaId: string;
  board: string[];
  currentTurn: 'X' | 'O';
  isStarted: boolean;
  isFinished: boolean;
  winner: string | null;
  jugadoresConectados: number;
}

const emptyBoard: BoardCell[] = Array.from({ length: 9 }, () => '');

function TicTacToeGame() {
  const navigate = useNavigate();
  const { roomId, gameId } = useParams<{ roomId: string; gameId?: string }>();
  const { totalPlayersOnline, selectGame } = useGame();
  const connectionRef = useRef<HubConnection | null>(null);
  const [connectionState, setConnectionState] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [board, setBoard] = useState<BoardCell[]>(emptyBoard);
  const [currentTurn, setCurrentTurn] = useState<'X' | 'O'>('X');
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
      .withUrl(`${import.meta.env.VITE_SIGNALR_HUB ?? '/gameHub'}`)
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Warning)
      .build();

    connectionRef.current = connection;

    const handleRoomState = (state: RoomStateDto) => {
      setBoard(state.board ?? emptyBoard);
      setCurrentTurn(state.currentTurn);
      setIsStarted(state.isStarted);
      setIsFinished(state.isFinished);
      setWinner(state.winner);
      setPlayersConnected(state.jugadoresConectados);
      setConnectionState('connected');

      if (state.isFinished) {
        setStatusMessage(
          state.winner ? `Partida finalizada. Ganó ${state.winner}.` : 'Partida finalizada en empate.',
        );
      } else if (state.isStarted) {
        setStatusMessage(`Turno de ${state.currentTurn}.`);
      } else {
        setStatusMessage('Esperando al segundo jugador.');
      }
    };

    const handleInvalidMove = (message: string) => {
      setStatusMessage(message);
    };

    const handleGameStarted = () => {
      setStatusMessage('La partida ha comenzado.');
    };

    const handleGameRestarted = () => {
      setStatusMessage('La partida se reinició.');
    };

    const handlePlayerDisconnected = () => {
      setStatusMessage('Un jugador salió de la sala.');
      setPlayersConnected((current) => Math.max(0, current - 1));
    };

    connection.on('EstadoJuegoActualizado', handleRoomState);
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
      connection.off('MovimientoInvalido', handleInvalidMove);
      connection.off('JuegoIniciado', handleGameStarted);
      connection.off('PartidaReiniciada', handleGameRestarted);
      connection.off('JugadorDesconectado', handlePlayerDisconnected);
      connectionRef.current = null;

      if (connection.state === HubConnectionState.Connected) {
        void connection.stop();
      }
    };
  }, [roomId]);

  const connectionBadge = useMemo(() => {
    if (connectionState === 'connected') {
      return <Badge variant="success">Connected</Badge>;
    }

    if (connectionState === 'connecting') {
      return <Badge variant="primary">Connecting</Badge>;
    }

    return <Badge variant="warning">Disconnected</Badge>;
  }, [connectionState]);

  const handlePlay = async (index: number) => {
    const connection = connectionRef.current;

    if (!connection || connection.state !== HubConnectionState.Connected || !roomId) {
      return;
    }

    try {
      await connection.invoke('HacerJugada', roomId, index);
    } catch (error) {
      console.error(error);
      setStatusMessage('No se pudo enviar la jugada.');
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

  const winnerText = winner ? `Ganador: ${winner}` : 'Sin ganador todavía';

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(83,74,183,0.12),transparent_30%),#0f0f13] font-sans text-[#f5f7ff]">
      <div className="min-h-screen border-y border-[#2a2a3a] bg-gradient-to-b from-[rgba(20,20,28,0.98)] to-[rgba(15,15,19,0.98)]">
        <Navbar onlineCount={totalPlayersOnline} />

        <section className="px-6 py-7 max-sm:px-4">
          <div className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-[1.3fr_0.7fr]">
            <article className="rounded-[14px] border border-[rgba(58,58,78,0.72)] bg-gradient-to-b from-[rgba(28,28,40,0.97)] to-[rgba(24,24,35,0.97)] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.28)]">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="grid gap-2">
                  <span className="text-sm uppercase tracking-[0.18em] text-white/45">Tic-Tac-Toe</span>
                  <h1 className="text-[clamp(2.2rem,4vw,3.6rem)] leading-none font-bold tracking-[-0.06em]">
                    Sala {roomId}
                  </h1>
                  <p className="max-w-2xl text-white/62">
                    El backend crea la sala automáticamente al unirse. El juego empieza cuando entran
                    dos jugadores.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {connectionBadge}
                  <Badge variant="primary">{playersConnected}/2 players</Badge>
                </div>
              </div>

              <div className="mt-5 rounded-[12px] border border-[rgba(42,42,58,0.82)] bg-[rgba(17,17,25,0.82)] p-4 text-white/68">
                {statusMessage}
              </div>

              <div className="mt-6 grid gap-6 2xl:grid-cols-[minmax(0,1fr)_320px] 2xl:items-start">
                <div className="grid min-w-0 gap-4">
                  <div className="grid grid-cols-3 gap-3">
                    {board.map((cell, index) => (
                      <button
                        key={`cell-${index}`}
                        type="button"
                        className="flex aspect-square items-center justify-center rounded-[16px] border border-[rgba(58,58,78,0.9)] bg-[rgba(17,17,25,0.9)] text-[clamp(2rem,6vw,3.2rem)] font-bold transition hover:border-[#6e67db] disabled:cursor-not-allowed disabled:opacity-60"
                        onClick={() => handlePlay(index)}
                        disabled={!isStarted || isFinished || Boolean(cell)}
                      >
                        {cell}
                      </button>
                    ))}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-[12px] border border-[rgba(42,42,58,0.8)] bg-[rgba(17,17,25,0.84)] p-4">
                      <span className="mb-1 block text-xs uppercase tracking-[0.14em] text-white/35">
                        Estado
                      </span>
                      <strong>{isFinished ? 'Finalizada' : isStarted ? 'En juego' : 'Esperando'}</strong>
                    </div>
                    <div className="rounded-[12px] border border-[rgba(42,42,58,0.8)] bg-[rgba(17,17,25,0.84)] p-4">
                      <span className="mb-1 block text-xs uppercase tracking-[0.14em] text-white/35">
                        Turno actual
                      </span>
                      <strong>{currentTurn}</strong>
                    </div>
                    <div className="rounded-[12px] border border-[rgba(42,42,58,0.8)] bg-[rgba(17,17,25,0.84)] p-4">
                      <span className="mb-1 block text-xs uppercase tracking-[0.14em] text-white/35">
                        Resultado
                      </span>
                      <strong>{winnerText}</strong>
                    </div>
                  </div>
                </div>

                <aside className="grid gap-4 rounded-[12px] border border-[rgba(58,58,78,0.72)] bg-[rgba(17,17,25,0.82)] p-4 2xl:w-[320px]">
                  <div className="grid gap-1">
                    <span className="text-xs uppercase tracking-[0.16em] text-white/35">
                      Reglas rápidas
                    </span>
                    <p className="m-0 text-sm text-white/62">
                      El servidor asigna X al primer jugador que entra y O al segundo. La sala se
                      crea sola cuando se invoca la unión.
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

                  <div className="rounded-[12px] border border-[rgba(42,42,58,0.8)] bg-[rgba(12,12,18,0.72)] p-4 text-sm text-white/58">
                    Si el otro jugador aún no entra, la sala queda lista y visible en Available Rooms.
                  </div>
                </aside>
              </div>
            </article>

            <aside className="grid gap-4">
              <div className="rounded-[14px] border border-[rgba(58,58,78,0.72)] bg-gradient-to-b from-[rgba(28,28,40,0.97)] to-[rgba(24,24,35,0.97)] p-6">
                <span className="text-sm uppercase tracking-[0.16em] text-white/35">Status</span>
                <h2 className="mt-2 text-[1.8rem] leading-none font-bold tracking-[-0.04em]">
                  Live multiplayer room
                </h2>
                <p className="mt-3 text-white/62">
                  Todo el estado de la sala se recibe por SignalR desde <strong>GameHub</strong>.
                </p>
              </div>

              <div className="rounded-[14px] border border-[rgba(58,58,78,0.72)] bg-gradient-to-b from-[rgba(28,28,40,0.97)] to-[rgba(24,24,35,0.97)] p-6">
                <span className="text-sm uppercase tracking-[0.16em] text-white/35">SignalR</span>
                <h2 className="mt-2 text-[1.8rem] leading-none font-bold tracking-[-0.04em]">
                  Hub conectado
                </h2>
                <p className="mt-3 break-all text-white/62">{import.meta.env.VITE_SIGNALR_HUB ?? '/gameHub'}</p>
              </div>

              {connectionState === 'connecting' ? (
                <div className="flex min-h-[160px] items-center justify-center gap-3 rounded-[14px] border border-[rgba(58,58,78,0.72)] bg-gradient-to-b from-[rgba(28,28,40,0.97)] to-[rgba(24,24,35,0.97)] text-white/68">
                  <Spinner size={26} />
                  <span>Conectando partida...</span>
                </div>
              ) : null}
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}

export default TicTacToeGame;
