import Button from '../ui/Button';
import EmptyState from '../ui/EmptyState';
import { useI18n } from '../../i18n/LanguageContext';
import { UsersIcon, ArrowRightIcon } from '../ui/Icons';

export interface RoomListItem {
  id: string;
  name: string;
  creator: string;
  players: number;
  capacity: number;
}

interface RoomListProps {
  rooms: RoomListItem[];
  selectedRoomId: string | null;
  onSelectRoom: (roomId: string) => void;
  onJoinRoom: (room: RoomListItem) => void;
  onCreateRoom: () => void;
}

function RoomList({
  rooms,
  selectedRoomId,
  onSelectRoom,
  onJoinRoom,
  onCreateRoom,
}: RoomListProps) {
  const { t } = useI18n();
  const selectedRoom = rooms.find((room) => room.id === selectedRoomId) ?? null;

  return (
    <section className="flex h-full min-h-[380px] flex-col overflow-hidden rounded-[24px] border border-white/[0.08] bg-[#111114] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
      <div className="mb-5 flex items-center justify-between gap-3 pb-3 border-b border-white/[0.08]">
        <div className="flex items-center gap-2.5">
          <span className="font-['Rajdhani'] text-2xl font-bold uppercase tracking-wide text-[#f4f4f6]">
            {t('availableRooms')}
          </span>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full border border-[#d4ff00]/30 bg-[#d4ff00]/10 px-3 py-1 font-['Rajdhani'] text-xs font-bold uppercase tracking-wider text-[#d4ff00]">
          <UsersIcon size={14} />
          <span>{rooms.length} SALAS</span>
        </span>
      </div>

      <div className="grid min-h-0 flex-1 grid-rows-[minmax(0,1fr)_auto] gap-4">
        <div className="grid min-h-0 content-start gap-3 overflow-auto pr-1">
          {rooms.length === 0 ? (
            <EmptyState
              title={t('noRooms')}
              action={{ label: t('createFirstRoom'), onClick: onCreateRoom }}
            />
          ) : (
            rooms.map((room) => {
              const isSelected = selectedRoomId === room.id;
              const isFull = room.players >= room.capacity;

              return (
                <div
                  key={room.id}
                  onClick={() => onSelectRoom(room.id)}
                  className={`group flex items-center justify-between gap-4 rounded-[16px] border p-4 transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? 'border-[#d4ff00] bg-[#d4ff00]/10 shadow-[0_0_20px_rgba(212,255,0,0.2)]'
                      : 'border-white/[0.08] bg-[#0d0d10] hover:border-white/[0.22] hover:bg-[#15151a]'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2.5 mb-1">
                      <strong className="font-['Rajdhani'] text-lg font-bold uppercase tracking-wide text-[#f4f4f6] truncate">
                        {room.name}
                      </strong>
                      <span
                        className={`rounded-full px-2.5 py-0.5 font-['Rajdhani'] text-xs font-bold uppercase tracking-wider ${
                          isFull
                            ? 'border border-[#ff3355]/40 bg-[#ff3355]/15 text-[#ff3355]'
                            : 'border border-[#00f5a0]/40 bg-[#00f5a0]/15 text-[#00f5a0]'
                        }`}
                      >
                        {room.players}/{room.capacity}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-[#8c8c9a]">
                      Host: <strong className="text-[#f4f4f6]">{room.creator}</strong>
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onJoinRoom(room);
                    }}
                    disabled={isFull}
                    className="shrink-0 inline-flex items-center gap-1.5 rounded-[12px] border border-[#d4ff00]/40 bg-[#d4ff00]/10 px-3.5 py-2 font-['Rajdhani'] text-xs font-bold uppercase tracking-wider text-[#d4ff00] transition-all hover:bg-[#d4ff00] hover:text-[#08080a] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <span>{isFull ? 'LLENO' : 'ENTRAR'}</span>
                    <ArrowRightIcon size={14} />
                  </button>
                </div>
              );
            })
          )}
        </div>

        <div className="pt-2 border-t border-white/[0.08]">
          <Button
            fullWidth
            variant="surface"
            disabled={!selectedRoom}
            onClick={() => {
              if (selectedRoom) { onJoinRoom(selectedRoom); }
            }}
          >
            {t('joinRoom')}
          </Button>
        </div>
      </div>
    </section>
  );
}

export default RoomList;
