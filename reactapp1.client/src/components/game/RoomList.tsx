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
    <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-[12px] border border-[rgba(58,58,78,0.72)] bg-gradient-to-b from-[rgba(28,28,40,0.97)] to-[rgba(24,24,35,0.97)] p-[22px]">
      <div className="mb-[18px] inline-flex items-center justify-between gap-3 text-[1.8rem] font-bold tracking-[-0.04em]">
        <span>Available Rooms</span>
        <span className="inline-flex h-[34px] min-w-[34px] items-center justify-center rounded-full border border-[rgba(83,74,183,0.3)] bg-[rgba(83,74,183,0.14)] px-2.5 text-[0.95rem] font-bold text-[#c5c0ff]">
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
                className="w-full rounded-[8px] border border-[rgba(42,42,58,0.92)] bg-[rgba(17,17,25,0.82)] p-4 text-left transition hover:border-[#4a4a63]"
                style={
                  selectedRoomId === room.id
                    ? {
                        borderColor: 'rgba(116,106,235,0.95)',
                        backgroundColor: 'rgba(83,74,183,0.14)',
                        boxShadow: '0 0 0 1px rgba(116,106,235,0.3) inset',
                      }
                    : undefined
                }
                onClick={() => onSelectRoom(room.id)}
              >
                <div className="mb-2 flex items-center justify-between gap-3">
                  <strong>{room.name}</strong>
                  <span className="text-[#f5f7ff]/68">
                    {room.players}/{room.capacity}
                  </span>
                </div>
                <div className="flex flex-wrap gap-x-[18px] gap-y-2 text-[0.94rem] text-[#f5f7ff]/68">
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
