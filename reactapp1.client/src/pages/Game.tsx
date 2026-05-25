import { useCallback, useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import Navbar from '../components/layout/Navbar';
import CreateRoomModal from '../components/game/CreateRoomModal';
import Leaderboard from '../components/game/Leaderboard';
import RoomList from '../components/game/RoomList';
import StatsPanel from '../components/game/StatsPanel';
import { useAuth } from '../hooks/useAuth';
import { useGame } from '../hooks/useGame';
import { useSignalR } from '../hooks/useSignalR';
import { formatDate } from '../utils/formatDate';
import { getRoomsForGame, createRoom, type RoomSummary } from '../services/gameService';

function slugifyRoomId(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 24);
}

function Game() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { gameId } = useParams<{ gameId: string }>();
  const { user } = useAuth();
  const { totalPlayersOnline, details, selectedGame, isDetailsLoading, selectGame } = useGame();
  const [availableRooms, setAvailableRooms] = useState<RoomSummary[]>([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);
  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomId, setNewRoomId] = useState('');
  const activeRoomId = searchParams.get('room');
  const { status, hubUrl, connection } = useSignalR(Boolean(activeRoomId), activeRoomId ?? undefined);
  const selectedRoomId = activeRoomId;

  useEffect(() => {
    if (gameId) {
      selectGame(gameId);
    }
  }, [gameId, selectGame]);

  // Load rooms from the API
  const loadRooms = useCallback(async () => {
    if (!gameId) return;

    setIsLoadingRooms(true);

    try {
      const rooms = await getRoomsForGame(gameId);
      setAvailableRooms(rooms);
    } catch (error) {
      console.error('Failed to load rooms:', error);
    } finally {
      setIsLoadingRooms(false);
    }
  }, [gameId]);

  useEffect(() => {
    void loadRooms();
  }, [loadRooms]);

  // Listen for SignalR room changes to refresh the list in real-time
  useEffect(() => {
    if (!connection) return;

    const handleRoomsChanged = () => {
      void loadRooms();
    };

    connection.on('RoomsChanged', handleRoomsChanged);
    connection.on('RoomDeleted', handleRoomsChanged);

    return () => {
      connection.off('RoomsChanged', handleRoomsChanged);
      connection.off('RoomDeleted', handleRoomsChanged);
    };
  }, [connection, loadRooms]);

  const activeRoom = useMemo(
    () => availableRooms.find((room) => room.id === activeRoomId) ?? null,
    [activeRoomId, availableRooms],
  );

  const handleOpenCreateRoom = () => {
    setNewRoomName('');
    setNewRoomId('');
    setIsCreateRoomOpen((current) => !current);
  };

  const handleCloseCreateRoom = () => {
    setIsCreateRoomOpen(false);
    setNewRoomName('');
    setNewRoomId('');
  };

  const handleConfirmCreateRoom = async () => {
    if (!details || !selectedGame || !gameId) {
      return;
    }

    const trimmedName = newRoomName.trim();
    const generatedRoomId = (newRoomId.trim() || slugifyRoomId(trimmedName)).trim();

    if (!trimmedName || !generatedRoomId) {
      return;
    }

    try {
      const room = await createRoom(gameId, trimmedName, generatedRoomId);

      handleCloseCreateRoom();

      // Refresh rooms list
      await loadRooms();

      if (gameId === 'tic-tac-toe') {
        navigate(`/game/tic-tac-toe/room/${room.roomCode}`);
        return;
      }

      setSearchParams({ room: room.id });
    } catch (error) {
      console.error('Failed to create room:', error);
    }
  };

  const handleJoinRoom = (room: RoomSummary) => {
    if (gameId === 'tic-tac-toe') {
      navigate(`/game/tic-tac-toe/room/${room.id}`);
      return;
    }

    setSearchParams({ room: room.id });
  };

  if (!gameId) {
    return <Navigate to="/home" replace />;
  }

  const appShellClass =
    'min-h-screen w-full overflow-x-hidden border-y border-[#2a2a3a] bg-gradient-to-b from-[rgba(20,20,28,0.98)] to-[rgba(15,15,19,0.98)]';
  const panelClass =
    'rounded-[12px] border border-[rgba(58,58,78,0.72)] bg-gradient-to-b from-[rgba(28,28,40,0.97)] to-[rgba(24,24,35,0.97)] p-[22px]';

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(83,74,183,0.12),transparent_30%),#0f0f13] font-sans text-[#f5f7ff]">
      <div className={appShellClass}>
        <Navbar onlineCount={totalPlayersOnline} />

        <section className="min-h-[calc(100vh-126px)] px-6 pb-8 pt-7 max-sm:px-4">
          {isDetailsLoading || !details || !selectedGame ? (
            <div className={`${panelClass} flex min-h-[320px] flex-col items-center justify-center gap-3 text-[#f5f7ff]/68`}>
              <Spinner size={28} />
              <span>Loading match room...</span>
            </div>
          ) : (
            <div className="grid min-h-full auto-rows-[minmax(320px,1fr)] gap-5 xl:grid-cols-2">
              <section className={`${panelClass} grid h-full min-h-0 grid-rows-[auto_auto_1fr_auto] gap-[18px]`}>
                <div className="grid gap-2.5 text-[#f5f7ff]/68">
                  <div className="text-base uppercase tracking-[0.14em] text-white/52">Game Room</div>
                  <h1 className="m-0 text-[2.2rem] leading-[1.05] font-bold tracking-[-0.04em] text-[#f5f7ff]">
                    {details.gameName}
                  </h1>
                  <p className="m-0 text-[#f5f7ff]/68">{selectedGame.description}</p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Badge variant="success">{details.roomStatus}</Badge>
                  <Badge variant="primary">{status}</Badge>
                  {activeRoom ? <Badge variant="primary">{activeRoom.id}</Badge> : null}
                </div>

                <div className="grid gap-3 xl:grid-cols-2 2xl:grid-cols-3">
                  <div className="rounded-[8px] border border-[rgba(42,42,58,0.8)] bg-[rgba(17,17,25,0.82)] p-[14px_16px]">
                    <span className="mb-1 block text-[0.9rem] text-white/35">Players online</span>
                    <strong>{selectedGame.playersOnline ?? 0}</strong>
                  </div>
                  <div className="rounded-[8px] border border-[rgba(42,42,58,0.8)] bg-[rgba(17,17,25,0.82)] p-[14px_16px]">
                    <span className="mb-1 block text-[0.9rem] text-white/35">Last sync</span>
                    <strong>{formatDate(details.updatedAt)}</strong>
                  </div>
                  <div className="rounded-[8px] border border-[rgba(42,42,58,0.8)] bg-[rgba(17,17,25,0.82)] p-[14px_16px]">
                    <span className="mb-1 block text-[0.9rem] text-white/35">SignalR hub</span>
                    <strong>{hubUrl}</strong>
                  </div>
                </div>

                {activeRoom ? (
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-[8px] border border-[rgba(42,42,58,0.72)] bg-[rgba(17,17,25,0.76)] p-3">
                      <span className="mb-1 block text-xs uppercase tracking-[0.14em] text-white/35">Creator</span>
                      <strong>{activeRoom.creator}</strong>
                    </div>
                    <div className="rounded-[8px] border border-[rgba(42,42,58,0.72)] bg-[rgba(17,17,25,0.76)] p-3">
                      <span className="mb-1 block text-xs uppercase tracking-[0.14em] text-white/35">Players</span>
                      <strong>
                        {activeRoom.players}/{activeRoom.capacity}
                      </strong>
                    </div>
                    <div className="rounded-[8px] border border-[rgba(42,42,58,0.72)] bg-[rgba(17,17,25,0.76)] p-3">
                      <span className="mb-1 block text-xs uppercase tracking-[0.14em] text-white/35">Room ID</span>
                      <strong>{activeRoom.id}</strong>
                    </div>
                  </div>
                ) : null}

                <div className="mt-auto flex flex-wrap gap-3">
                  <Button className="flex-1 basis-[180px]" onClick={handleOpenCreateRoom}>
                    Create Room
                  </Button>
                  <Button
                    className="flex-1 basis-[180px]"
                    variant="surface"
                    onClick={() => navigate('/home')}
                  >
                    Back to lobby
                  </Button>
                </div>
              </section>

              <RoomList
                rooms={availableRooms}
                selectedRoomId={selectedRoomId}
                onSelectRoom={(roomId) => setSearchParams({ room: roomId })}
                onJoinRoom={handleJoinRoom}
                onCreateRoom={handleOpenCreateRoom}
              />

              <Leaderboard gameName={details.gameName} entries={details.leaderboard} />
              <StatsPanel stats={details.stats} />
            </div>
          )}
        </section>
      </div>

      <CreateRoomModal
        gameName={details?.gameName}
        creatorName={user?.name ?? 'Host player'}
        isOpen={isCreateRoomOpen}
        roomName={newRoomName}
        roomId={newRoomId}
        previewRoomId={newRoomId || slugifyRoomId(newRoomName) || 'pending-room-id'}
        onRoomNameChange={(value) => {
          setNewRoomName(value);

          if (!newRoomId.trim()) {
            setNewRoomId(slugifyRoomId(value));
          }
        }}
        onRoomIdChange={setNewRoomId}
        onClose={handleCloseCreateRoom}
        onConfirm={handleConfirmCreateRoom}
      />
    </main>
  );
}

export default Game;
