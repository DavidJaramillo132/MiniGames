import { useCallback, useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import ErrorBoundary from '../components/ui/ErrorBoundary';
import ErrorFallback from '../components/ui/ErrorFallback';
import Navbar from '../components/layout/Navbar';
import CreateRoomModal from '../components/game/CreateRoomModal';
import Leaderboard from '../components/game/Leaderboard';
import RoomList from '../components/game/RoomList';
import StatsPanel from '../components/game/StatsPanel';
import { useGame } from '../hooks/useGame';
import { useSignalR } from '../hooks/useSignalR';
import { usePresence } from '../hooks/usePresence';
import { getRoomsForGame, createRoom, type RoomSummary } from '../services/gameService';
import type { RoomListItem } from '../components/game/RoomList';
import { useI18n } from '../i18n/LanguageContext';

function Game() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { gameId } = useParams<{ gameId: string }>();
  const { details, selectedGame, isDetailsLoading, isFindingMatch, selectGame, findMatch } = useGame();
  const { totalOnline, gameOnline } = usePresence(gameId);
  const [availableRooms, setAvailableRooms] = useState<RoomSummary[]>([]);
  const [roomsError, setRoomsError] = useState<string | null>(null);
  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomId, setNewRoomId] = useState('');
  const activeRoomId = searchParams.get('room');
  const { status, connection } = useSignalR(Boolean(activeRoomId), activeRoomId ?? undefined);
  useEffect(() => {
    if (gameId) { selectGame(gameId); }
  }, [gameId, selectGame]);

  const loadRooms = useCallback(async () => {
    if (!gameId) return;

    setRoomsError(null);

    try {
      const rooms = await getRoomsForGame(gameId);
      setAvailableRooms(rooms);
    } catch (error) {
      console.error('Failed to load rooms:', error);
      setRoomsError(t('failedRooms'));
    }
  }, [gameId, t]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadRooms(), 0);

    return () => window.clearTimeout(timer);
  }, [loadRooms]);

  useEffect(() => {
    if (!connection) return;

    const handleRoomsChanged = () => { void loadRooms(); };

    connection.on('RoomsChanged', handleRoomsChanged);
    connection.on('RoomDeleted', handleRoomsChanged);

    return () => {
      connection.off('RoomsChanged', handleRoomsChanged);
      connection.off('RoomDeleted', handleRoomsChanged);
    };
  }, [connection, loadRooms]);

  const handleOpenCreateRoom = () => {
    setNewRoomName('');
    setNewRoomId(crypto.randomUUID());
    setIsCreateRoomOpen((current) => !current);
  };

  const handleCloseCreateRoom = () => {
    setIsCreateRoomOpen(false);
    setNewRoomName('');
    setNewRoomId('');
  };

  const handleConfirmCreateRoom = async () => {
    if (!details || !selectedGame || !gameId) { return; }

    const trimmedName = newRoomName.trim();
    const generatedRoomId = newRoomId.trim();

    if (!trimmedName || !generatedRoomId) { return; }

    try {
      const room = await createRoom(gameId, trimmedName, generatedRoomId);
      handleCloseCreateRoom();
      await loadRooms();

      navigate(`/game/${gameId}/room/${room.roomCode}?name=${encodeURIComponent(trimmedName)}`);
    } catch (error) {
      console.error('Failed to create room:', error);
    }
  };

  const handleJoinRoom = (room: RoomListItem) => {
    navigate(`/game/${gameId}/room/${room.id}?name=${encodeURIComponent(room.name)}`);
  };

  if (!gameId) {
    return <Navigate to="/home" replace />;
  }

  const handleFindMatch = async () => {
    const match = await findMatch();
    if (match) { navigate(`/game/${match.gameId}`); }
  };

  const appShellClass =
    'min-h-screen w-full overflow-x-hidden border-y border-[#2a2a3a] bg-gradient-to-b from-[rgba(20,20,28,0.98)] to-[rgba(15,15,19,0.98)]';
  const panelClass =
    'rounded-[12px] border border-[rgba(58,58,78,0.72)] bg-gradient-to-b from-[rgba(28,28,40,0.97)] to-[rgba(24,24,35,0.97)] p-4';

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(83,74,183,0.12),transparent_30%),#0f0f13] font-sans text-[#f5f7ff]">
      <div className={appShellClass}>
         <Navbar onlineCount={totalOnline} gameOnlineCount={gameOnline} />

        <section className="min-h-[calc(100vh-126px)] px-6 pb-8 pt-7 max-sm:px-4">
          {isDetailsLoading || !details || !selectedGame ? (
            <div className={`${panelClass} flex min-h-[320px] flex-col items-center justify-center gap-3 text-[#f5f7ff]/68`}>
              <Spinner size={28} />
              <span>{t('loadingMatchRoom')}</span>
            </div>
          ) : (
            <div className="grid gap-4">
              <ErrorBoundary>
                <section className={`${panelClass} grid gap-3`}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="inline-flex h-10 w-10 items-center justify-center rounded-[12px] border"
                        style={{
                          color: selectedGame?.accentColor ?? '#78e6ff',
                          borderColor: `${selectedGame?.accentColor ?? '#78e6ff'}55`,
                          backgroundColor: `${selectedGame?.accentColor ?? '#78e6ff'}20`,
                        }}
                      >
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.9">
                          <path d="M4 7h16" />
                          <path d="M7 4v16" />
                          <path d="M17 4v16" />
                          <path d="M4 17h16" />
                        </svg>
                      </div>
                      <h1 className="text-[1.6rem] font-bold tracking-[-0.03em] text-[#f5f7ff]">
                        {details.gameName}
                      </h1>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <Badge variant="success">{details.roomStatus}</Badge>
                    <Badge variant="primary">{status}</Badge>
                    <span className="ml-1 flex items-center gap-1.5 text-[#f5f7ff]/78">
                      <span className="h-2 w-2 rounded-full bg-[#86f0be]" />
                      {t('playerOnline', { count: gameOnline })}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    <Button onClick={handleOpenCreateRoom}>{t('createRoom')}</Button>
                    <Button variant="surface" isLoading={isFindingMatch} onClick={handleFindMatch}>
                      {t('fastMatch')}
                    </Button>
                    <Button variant="surface" onClick={() => navigate('/home')}>{t('back')}</Button>
                  </div>
                </section>
              </ErrorBoundary>

              <div className="grid gap-4 xl:grid-cols-2">
                <ErrorBoundary>
                  {roomsError ? (
                    <ErrorFallback message={roomsError} onRetry={loadRooms} />
                  ) : (
                    <RoomList
                      rooms={availableRooms}
                      selectedRoomId={activeRoomId}
                      onSelectRoom={(roomId) => setSearchParams({ room: roomId })}
                      onJoinRoom={handleJoinRoom}
                      onCreateRoom={handleOpenCreateRoom}
                    />
                  )}
                </ErrorBoundary>

                <ErrorBoundary>
                  <StatsPanel stats={details.stats} />
                </ErrorBoundary>
              </div>

              <ErrorBoundary>
                <Leaderboard gameName={details.gameName} entries={details.leaderboard} />
              </ErrorBoundary>
            </div>
          )}
        </section>
      </div>

      <CreateRoomModal
        gameName={details?.gameName}
        isOpen={isCreateRoomOpen}
        roomName={newRoomName}
        onRoomNameChange={setNewRoomName}
        onClose={handleCloseCreateRoom}
        onConfirm={handleConfirmCreateRoom}
      />
    </main>
  );
}

export default Game;
