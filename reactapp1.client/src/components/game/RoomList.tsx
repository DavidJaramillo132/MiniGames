import Button from '../ui/Button';

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
  const selectedRoom = rooms.find((room) => room.id === selectedRoomId) ?? null;

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-[28px] border border-[rgba(141,232,255,0.14)] bg-[linear-gradient(180deg,rgba(8,18,34,0.95),rgba(5,12,24,0.98))] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.2)]">
      <div className="mb-5 inline-flex items-center justify-between gap-3 text-[1.8rem] font-bold tracking-[-0.04em]">
        <span>Available Rooms</span>
        <span className="inline-flex h-[38px] min-w-[38px] items-center justify-center rounded-full border border-[rgba(120,230,255,0.22)] bg-[rgba(120,230,255,0.08)] px-2.5 text-[0.95rem] font-bold text-[#a8efff]">
          {rooms.length}
        </span>
      </div>

      <div className="grid min-h-0 flex-1 grid-rows-[minmax(0,1fr)_auto] gap-4">
        <div className="grid min-h-0 content-start gap-3 overflow-auto pr-1">
          {rooms.length === 0 ? (
            <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 text-center text-[#f5f7ff]/68">
              <span>No rooms available yet.</span>
              <Button onClick={onCreateRoom}>Create the first room</Button>
            </div>
          ) : (
            rooms.map((room) => (
              <button
                key={room.id}
                type="button"
                className="w-full rounded-[22px] border border-[rgba(141,232,255,0.1)] bg-[rgba(255,255,255,0.02)] p-4 text-left transition hover:border-[rgba(120,230,255,0.34)]"
                style={
                  selectedRoomId === room.id
                    ? {
                        borderColor: 'rgba(120,230,255,0.68)',
                        backgroundColor: 'rgba(120,230,255,0.08)',
                        boxShadow: '0 0 0 1px rgba(120,230,255,0.2) inset',
                      }
                    : undefined
                }
                onClick={() => onSelectRoom(room.id)}
              >
                <div className="mb-2 flex items-center justify-between gap-3">
                  <strong className="text-[1.02rem]">{room.name}</strong>
                  <span className="text-[#d7ebff]/68">
                    {room.players}/{room.capacity}
                  </span>
                </div>
                <div className="flex flex-wrap gap-x-[18px] gap-y-2 text-[0.9rem] text-[#d7ebff]/58">
                  <span>Creator: {room.creator}</span>
                  <span>{room.players} players inside</span>
                </div>
              </button>
            ))
          )}
        </div>

        <div className="mt-auto">
          <Button
            fullWidth
            variant="surface"
            disabled={!selectedRoom}
            onClick={() => {
              if (selectedRoom) {
                onJoinRoom(selectedRoom);
              }
            }}
          >
            Join Room
          </Button>
        </div>
      </div>
    </section>
  );
}

export default RoomList;
