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
import { GamepadIcon, ZapIcon, PlusIcon } from '../components/ui/Icons';
import { useGame } from '../hooks/useGame';
import { useSignalR } from '../hooks/useSignalR';
import { usePresence } from '../hooks/usePresence';
import { getRoomsForGame, createRoom, type RoomSummary } from '../services/gameService';
import type { RoomListItem } from '../components/game/RoomList';
import { useI18n } from '../i18n/LanguageContext';
import { playTactileClickTone, prepareGameAudio } from '../utils/gameAudio';

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

  const handleJoinRoom = async (room: RoomListItem) => {
    await prepareGameAudio();
    playTactileClickTone();
    navigate(`/game/${gameId}/room/${room.id}?name=${encodeURIComponent(room.name)}`);
  };

  if (!gameId) {
    return <Navigate to="/home" replace />;
  }

  const handleFindMatch = async () => {
    await prepareGameAudio();
    playTactileClickTone();
    const match = await findMatch();
    if (match) { navigate(`/game/${match.gameId}`); }
  };

  const panelClass =
    'rounded-[24px] border border-white/[0.08] bg-[#111114] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.6)]';

  return (
    <main className="min-h-screen bg-transparent text-[#f4f4f6]">
      <Navbar onlineCount={totalOnline} gameOnlineCount={gameOnline} />

      <section className="mx-auto max-w-[1360px] px-6 pb-16 pt-3 max-sm:px-4">
        {isDetailsLoading || !details || !selectedGame ? (
          <div className={`${panelClass} flex min-h-[320px] flex-col items-center justify-center gap-3 text-[#8c8c9a]`}>
            <Spinner size={32} />
            <span className="font-['Rajdhani'] text-sm font-bold uppercase tracking-wider text-[#8c8c9a]">
              {t('loadingMatchRoom')}
            </span>
          </div>
        ) : (
          <div className="grid gap-6">
            {/* ─── Matchmaking Arena Header Deck ─── */}
            <section className="relative overflow-hidden rounded-[26px] border border-white/[0.08] bg-[#111114] p-6 sm:p-8 shadow-[0_24px_70px_rgba(0,0,0,0.8)]">
              <div className="flex flex-wrap items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div
                    className="inline-flex h-14 w-14 items-center justify-center rounded-[16px] border shadow-[0_0_20px_rgba(212,255,0,0.2)]"
                    style={{
                      color: selectedGame?.accentColor ?? '#d4ff00',
                      borderColor: `${selectedGame?.accentColor ?? '#d4ff00'}50`,
                      backgroundColor: `${selectedGame?.accentColor ?? '#d4ff00'}15`,
                    }}
                  >
                    <GamepadIcon size={28} />
                  </div>
                  <div>
                    <h1 className="font-['Rajdhani'] text-3xl sm:text-4xl font-bold uppercase tracking-[0.03em] text-[#f4f4f6]">
                      {details.gameName}
                    </h1>
                    <div className="mt-1 flex flex-wrap items-center gap-2.5">
                      <Badge variant="success">{details.roomStatus}</Badge>
                      <Badge variant="primary">{status}</Badge>
                      <span className="inline-flex items-center gap-1.5 font-['Rajdhani'] text-xs font-bold uppercase tracking-wider text-[#00f5a0]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#00f5a0] animate-pulse" />
                        {t('playerOnline', { count: gameOnline })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Button variant="primary" isLoading={isFindingMatch} onClick={handleFindMatch}>
                    <ZapIcon size={16} />
                    <span>{t('fastMatch')}</span>
                  </Button>
                  <Button variant="surface" onClick={handleOpenCreateRoom}>
                    <PlusIcon size={16} />
                    <span>{t('createRoom')}</span>
                  </Button>
                  <Button variant="surface" onClick={() => navigate('/home')}>
                    {t('back')}
                  </Button>
                </div>
              </div>
            </section>

            {/* ─── Rooms & Personal Stats Deck ─── */}
            <div className="grid gap-6 xl:grid-cols-2">
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

            {/* ─── Arena Leaderboard ─── */}
            <ErrorBoundary>
              <Leaderboard gameName={details.gameName} entries={details.leaderboard} />
            </ErrorBoundary>
          </div>
        )}
      </section>

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
